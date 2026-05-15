package model
import "time"
type Sensor struct {
	ID             string     `json:"id" db:"id"`
	Name           *string    `json:"name,omitempty" db:"name"`
	LocationLabel  *string    `json:"location_label,omitempty" db:"location_label"`
	Latitude       float64    `json:"latitude" db:"latitude"`
	Longitude      float64    `json:"longitude" db:"longitude"`
	InstalledAt    time.Time  `json:"installed_at" db:"installed_at"`
	DeactivatedAt  *time.Time `json:"deactivated_at,omitempty" db:"deactivated_at"`
	Active         bool       `json:"active" db:"active"`
}
var StaticSensors = []Sensor{
	{ID: "LCS-1", Latitude: -6.22932, Longitude: 106.79982, Active: true},
	{ID: "LCS-2", Latitude: -6.245800, Longitude: 106.875300, Active: true},
	{ID: "LCS-3", Latitude: -6.211762, Longitude: 106.763832, Active: true},
	{ID: "LCS-4", Latitude: -6.275300, Longitude: 106.797700, Active: true},
	{ID: "LCS-5", Latitude: -6.134922, Longitude: 106.812796, Active: true},
	{ID: "LCS-6", Latitude: -6.250400, Longitude: 106.815230, Active: true},
	{ID: "LCS-7", Latitude: -6.279579, Longitude: 106.845108, Active: true},
	{ID: "LCS-8", Latitude: -6.154077, Longitude: 106.706211, Active: true},
	{ID: "LCS-9", Latitude: -6.192979, Longitude: 106.910955, Active: true},
	{ID: "LCS-10", Latitude: -6.1538005, Longitude: 106.9109397, Active: true},
	{ID: "LCS-11", Latitude: -6.20128, Longitude: 106.82345, Active: true},
	{ID: "LCS-12", Latitude: -6.123810, Longitude: 106.859667, Active: true},
	{ID: "LCS-13", Latitude: -6.23583, Longitude: 106.82596, Active: true},
	{ID: "LCS-14", Latitude: -5.7468056, Longitude: 106.6121966, Active: true},
	{ID: "LCS-15", Latitude: -6.24596, Longitude: 106.79821, Active: true},
	{ID: "LCS-16", Latitude: -6.20955, Longitude: 106.82196, Active: true},
	{ID: "LCS-17", Latitude: -6.24048, Longitude: 106.79855, Active: true},
	{ID: "LCS-18", Latitude: -6.20849, Longitude: 106.82988, Active: true},
	{ID: "LCS-19", Latitude: -6.21726, Longitude: 106.81539, Active: true},
	{ID: "LCS-20", Latitude: -6.1831, Longitude: 106.82475, Active: true},
	{ID: "LCS-21", Latitude: -6.24309, Longitude: 106.80245, Active: true},
	{ID: "LCS-23", Latitude: -6.18701, Longitude: 106.82003, Active: true},
	{ID: "LCS-24", Latitude: -6.20756, Longitude: 106.79716, Active: true},
	{ID: "LCS-26", Latitude: -6.09637, Longitude: 106.95996, Active: true},
}