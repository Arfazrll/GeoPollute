package model
import "time"
type Sensor struct {
	ID             string     `json:"id" db:"id"`
	UUID           string     `json:"-" db:"-"`
	ApiVersion     string     `json:"-" db:"-"`
	Name           *string    `json:"name,omitempty" db:"name"`
	LocationLabel  *string    `json:"location_label,omitempty" db:"location_label"`
	Latitude       float64    `json:"latitude" db:"latitude"`
	Longitude      float64    `json:"longitude" db:"longitude"`
	InstalledAt    time.Time  `json:"installed_at" db:"installed_at"`
	DeactivatedAt  *time.Time `json:"deactivated_at,omitempty" db:"deactivated_at"`
	Active         bool       `json:"active" db:"active"`
}

var StaticSensors = []Sensor{
	{ID: "LCS-1", UUID: "44d5d408-17c1-49bd-bec3-eca943f78497", ApiVersion: "v2", Latitude: -6.22932, Longitude: 106.79982, Active: true},
	{ID: "LCS-2", UUID: "b17e88de-7927-495b-b669-a28c00d09cb2", ApiVersion: "v1", Latitude: -6.245800, Longitude: 106.875300, Active: true},
	{ID: "LCS-3", UUID: "185e24d9-8ba9-4af9-bfe1-bcbd24c4b43a", ApiVersion: "v1", Latitude: -6.211762, Longitude: 106.763832, Active: true},
	{ID: "LCS-4", UUID: "d8f1b701-2802-4bcd-bb73-00105e7163d6", ApiVersion: "v1", Latitude: -6.275300, Longitude: 106.797700, Active: true},
	{ID: "LCS-5", UUID: "74a42923-6332-46df-b0d0-6c0cfa1ceafb", ApiVersion: "v1", Latitude: -6.134922, Longitude: 106.812796, Active: true},
	{ID: "LCS-6", UUID: "3fb757be-2045-4708-b61d-d1a5190f6d52", ApiVersion: "v1", Latitude: -6.250400, Longitude: 106.815230, Active: true},
	{ID: "LCS-7", UUID: "6307d3bf-c752-48db-8449-2bf450a3c922", ApiVersion: "v1", Latitude: -6.279579, Longitude: 106.845108, Active: true},
	{ID: "LCS-8", UUID: "44d82deb-08ce-4577-b7df-d8fc7e269bbc", ApiVersion: "v1", Latitude: -6.154077, Longitude: 106.706211, Active: true},
	{ID: "LCS-9", UUID: "929016fc-487a-473b-b169-92159443edcc", ApiVersion: "v1", Latitude: -6.192979, Longitude: 106.910955, Active: true},
	{ID: "LCS-10", UUID: "0e9af77d-17f5-4f99-aaa7-af5423c2d084", ApiVersion: "v1", Latitude: -6.1538005, Longitude: 106.9109397, Active: true},
	{ID: "LCS-11", UUID: "da7e8005-6ec3-42e1-a6cb-2f8f3ff4963b", ApiVersion: "v1", Latitude: -6.20128, Longitude: 106.82345, Active: true},
	{ID: "LCS-12", UUID: "3b81261a-bd1c-4d65-91f3-211fb33f2c31", ApiVersion: "v2", Latitude: -6.123810, Longitude: 106.859667, Active: true},
	{ID: "LCS-13", UUID: "893a37c8-7ffc-4acf-b0b2-4474e8eecccc", ApiVersion: "v1", Latitude: -6.23583, Longitude: 106.82596, Active: true},
	{ID: "LCS-14", UUID: "ff26ef11-1c71-4d8d-a519-e177a9280ee5", ApiVersion: "v1", Latitude: -5.7468056, Longitude: 106.6121966, Active: true},
	{ID: "LCS-15", UUID: "bf8cf23d-fb9a-4ba1-a108-db45cbdb397c", ApiVersion: "v1", Latitude: -6.24596, Longitude: 106.79821, Active: true},
	{ID: "LCS-16", UUID: "f86fe731-c5cd-406a-8709-2581b8bffc05", ApiVersion: "v1", Latitude: -6.20955, Longitude: 106.82196, Active: true},
	{ID: "LCS-17", UUID: "ae38fe54-454e-48e6-8f71-87fa5073d4cd", ApiVersion: "v2", Latitude: -6.24048, Longitude: 106.79855, Active: true},
	{ID: "LCS-18", UUID: "245d3ee8-9109-4f4a-804c-4f561f63f8d1", ApiVersion: "v1", Latitude: -6.20849, Longitude: 106.82988, Active: true},
	{ID: "LCS-19", UUID: "97c54eef-63a5-4801-b3b8-3d3f0a4e375e", ApiVersion: "v1", Latitude: -6.21726, Longitude: 106.81539, Active: true},
	{ID: "LCS-20", UUID: "c606236c-7570-48fc-ac2d-6e102f242058", ApiVersion: "v1", Latitude: -6.1831, Longitude: 106.82475, Active: true},
	{ID: "LCS-21", UUID: "405b4d37-fd6a-4387-b3e8-8ae65c6b1341", ApiVersion: "v1", Latitude: -6.24309, Longitude: 106.80245, Active: true},
	{ID: "LCS-23", UUID: "44f97b97-5ba9-4384-ab1e-6dfa53f450cb", ApiVersion: "v1", Latitude: -6.18701, Longitude: 106.82003, Active: true},
	{ID: "LCS-24", UUID: "6a557710-80b1-4a76-9151-918e00816d97", ApiVersion: "v1", Latitude: -6.20756, Longitude: 106.79716, Active: true},
	{ID: "LCS-26", UUID: "951a40ae-57d6-4389-a626-6b0ab5bb03b3", ApiVersion: "v1", Latitude: -6.09637, Longitude: 106.95996, Active: true},
}