package service
import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
	"github.com/arfazrll/geopollute/api/internal/model"
)
type cacheEntry struct {
	data      *model.PollutantResponse
	timestamp time.Time
}
type PollutantService struct {
	httpClient    *http.Client
	cache         map[model.FilterMode]cacheEntry
	cacheMutex    sync.RWMutex
}
func NewPollutantService() *PollutantService {
	return &PollutantService{
		httpClient:    &http.Client{Timeout: 30 * time.Second},
		cache:         make(map[model.FilterMode]cacheEntry),
	}
}
func (s *PollutantService) GetReadingsByFilter(ctx context.Context, filter model.FilterMode) (*model.PollutantResponse, error) {
	if !filter.IsValid() {
		return nil, model.ErrInvalidFilter
	}
	s.cacheMutex.RLock()
	entry, found := s.cache[filter]
	s.cacheMutex.RUnlock()
	ttl := 5 * time.Minute
	if filter == "2m" {
		ttl = 1 * time.Minute
	}
	if found && time.Since(entry.timestamp) < ttl {
		fmt.Printf("time=%s level=INFO msg=\"cache hit\" filter=%s\n", time.Now().Format(time.RFC3339), filter)
		return entry.data, nil
	}
	fmt.Printf("time=%s level=INFO msg=\"cache miss, fetching data\" filter=%s\n", time.Now().Format(time.RFC3339), filter)
	sensors := model.StaticSensors
	now := time.Now()
	today := now.Format("2006-01-02")
	yesterday := now.AddDate(0, 0, -1).Format("2006-01-02")
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location()).Format("2006-01-02")
	var wg sync.WaitGroup
	resultsChan := make(chan model.SensorReadingDTO, len(sensors))
	for _, sensor := range sensors {
		wg.Add(1)
		go func(sn model.Sensor) {
			defer wg.Done()
			isV2 := sn.ID == "ae38fe54-454e-48e6-8f71-87fa5073d4cd" ||
			        sn.ID == "3b81261a-bd1c-4d65-91f3-211fb33f2c31" ||
					sn.ID == "44d5d408-17c1-49bd-bec3-eca943f78497"
			sDate := today
			if filter == "2m" || filter == "1h" {
				sDate = yesterday
			}
			valPM25, valCO, valNO2, history, err := s.fetchExternalData(sn.ID, isV2, filter, sDate, today, startOfMonth)
			if err == nil {
				resultsChan <- model.SensorReadingDTO{
					ID:    sn.ID,
					Lat:   sn.Latitude,
					Lng:   sn.Longitude,
					PM25:  valPM25,
					CO:    valCO,
					NO2:   valNO2,
					Timestamp: now,
					History: history,
				}
			}
		}(sensor)
	}
	wg.Wait()
	close(resultsChan)
	data := make([]model.SensorReadingDTO, 0, len(sensors))
	for r := range resultsChan {
		data = append(data, r)
	}
	resp := &model.PollutantResponse{
		Filter: filter,
		Data:   data,
	}
	s.cacheMutex.Lock()
	s.cache[filter] = cacheEntry{
		data:      resp,
		timestamp: time.Now(),
	}
	s.cacheMutex.Unlock()
	return resp, nil
}
func (s *PollutantService) fetchExternalData(deviceID string, isV2 bool, filter model.FilterMode, startDate, endDate, startOfMonth string) (pm25, co, no2 float64, history []model.HistoricalPoint, err error) {
	var url string
	mode := "hourly"
	sDate := startDate
	eDate := endDate
	if filter == model.Filter1d {
		mode = "daily"
		sDate = startOfMonth
	}
	if isV2 {
		url = fmt.Sprintf("https://api-gateway.langit-biru.com/api/v1/datavsnew/average/%s?start=%s&end=%s&device_id=%s",
			mode, sDate, eDate, deviceID)
	} else {
		url = fmt.Sprintf("https://api-gateway.langit-biru.com/api/v1/datavs/average/%s?start=%s&end=%s&device_ids=%s",
			mode, sDate, eDate, deviceID)
	}
	fmt.Printf("time=%s level=INFO msg=\"fetching external data\" url=%s\n", time.Now().Format(time.RFC3339), url)
	resp, err := s.httpClient.Get(url)
	if err != nil {
		return 0, 0, 0, nil, fmt.Errorf("external api request failed: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return 0, 0, 0, nil, fmt.Errorf("external api returned status %d", resp.StatusCode)
	}
	var result struct {
		Data struct {
			Results []struct {
				Buckets []struct {
					AvgPM25 *float64 `json:"avg_pm2_5"`
					AvgCO2  *float64 `json:"avg_co2"`
					AvgCO   *float64 `json:"avg_co"`
					AvgNO2  *float64 `json:"avg_no2"`
					Value   *float64 `json:"value"`
					Avg     *float64 `json:"avg_value"`
					Start   string   `json:"start"`
				} `json:"buckets"`
			} `json:"results"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, 0, 0, nil, fmt.Errorf("failed to decode api response: %w", err)
	}
	if len(result.Data.Results) == 0 || len(result.Data.Results[0].Buckets) == 0 {
		return 0, 0, 0, nil, nil
	}
	history = make([]model.HistoricalPoint, 0)
	for _, b := range result.Data.Results[0].Buckets {
		val := 0.0
		if b.AvgPM25 != nil {
			val = *b.AvgPM25
		} else if b.Avg != nil {
			val = *b.Avg
		} else if b.Value != nil {
			val = *b.Value
		}
		if val > 0 {
			t, _ := time.Parse("2006-01-02 15:04:05", b.Start)
			history = append(history, model.HistoricalPoint{
				Value:     val,
				Timestamp: t,
			})
		}
	}
	var d struct {
		AvgPM25 *float64
		AvgCO2  *float64
		AvgCO   *float64
		AvgNO2  *float64
		Value   *float64
		Avg     *float64
	}
	found := false
	for i := len(result.Data.Results[0].Buckets) - 1; i >= 0; i-- {
		b := result.Data.Results[0].Buckets[i]
		if b.AvgPM25 != nil || b.Value != nil || b.Avg != nil {
			d.AvgPM25 = b.AvgPM25
			d.AvgCO2 = b.AvgCO2
			d.AvgCO = b.AvgCO
			d.AvgNO2 = b.AvgNO2
			d.Value = b.Value
			d.Avg = b.Avg
			found = true
			break
		}
	}
	if !found {
		return 0, 0, 0, history, nil
	}
	if d.AvgPM25 != nil {
		pm25 = *d.AvgPM25
	} else if d.Avg != nil {
		pm25 = *d.Avg
	} else if d.Value != nil {
		pm25 = *d.Value
	}
	if d.AvgCO != nil {
		co = *d.AvgCO
	} else if d.AvgCO2 != nil {
		co = *d.AvgCO2
	}
	if d.AvgNO2 != nil {
		no2 = *d.AvgNO2
	}
	return pm25, co, no2, history, nil
}
func (s *PollutantService) IngestReading(ctx context.Context, req *model.IngestRequest) error {
	return fmt.Errorf("ingest disabled in production mode")
}