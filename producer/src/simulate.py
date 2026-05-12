"""
GeoPollute IoT Producer Simulator

Simulates 15 IoT sensors pushing PM2.5 readings to the GeoPollute API
every 120 seconds. Each reading includes realistic spatial variation and
diurnal patterns (higher pollution during morning/evening rush hours).

Usage:
    docker compose --profile demo up producer
    OR
    cd producer/src && python simulate.py
"""
import os
import random
import sys
import time
from datetime import datetime
from typing import Dict

import requests

# ============================================================
# Configuration
# ============================================================
API_BASE = os.getenv("API_BASE", "http://localhost:8080")
INTERVAL_SECONDS = int(os.getenv("INTERVAL_SECONDS", "120"))
INGEST_ENDPOINT = f"{API_BASE}/ingest"

# Same base values as db/seeds/seeder.py for spatial consistency
BASE_PM25: Dict[str, int] = {
    "S-01": 45, "S-02": 52, "S-03": 38, "S-04": 67, "S-05": 41,
    "S-06": 33, "S-07": 78, "S-08": 55, "S-09": 89, "S-10": 42,
    "S-11": 35, "S-12": 61, "S-13": 72, "S-14": 31, "S-15": 58,
}


def generate_pm25(sensor_id: str, hour_of_day: int) -> float:
    """Generate realistic PM2.5 with diurnal variation + noise."""
    base = BASE_PM25[sensor_id]

    # Diurnal cycle: pollution peaks morning (7-9) and evening (17-19)
    if hour_of_day in (7, 8, 9, 17, 18, 19):
        diurnal = random.uniform(8, 15)
    elif hour_of_day in (0, 1, 2, 3, 4, 5):
        diurnal = random.uniform(-10, -5)
    else:
        diurnal = random.uniform(-3, 5)

    noise = random.uniform(-4, 4)
    return max(0, round(base + diurnal + noise, 2))


def wait_for_api(timeout_seconds: int = 60) -> bool:
    """Wait until API is reachable."""
    start = time.time()
    while time.time() - start < timeout_seconds:
        try:
            r = requests.get(f"{API_BASE}/health", timeout=2)
            if r.status_code == 200:
                print(f"[{datetime.now().isoformat()}] ✓ API reachable: {API_BASE}")
                return True
        except requests.exceptions.RequestException:
            pass
        print(f"[{datetime.now().isoformat()}] Waiting for API at {API_BASE}...")
        time.sleep(3)
    return False


def push_reading(sensor_id: str, value: float) -> bool:
    """POST single reading to /ingest endpoint."""
    payload = {
        "sensor_id": sensor_id,
        "pollutant_type": "PM25",
        "value": value,
        "unit": "ug/m3",
    }
    try:
        r = requests.post(INGEST_ENDPOINT, json=payload, timeout=5)
        if r.status_code == 201:
            return True
        print(f"[{datetime.now().isoformat()}] ✗ {sensor_id}: HTTP {r.status_code} {r.text[:80]}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now().isoformat()}] ✗ {sensor_id}: {e}")
        return False


def run_cycle() -> tuple[int, int]:
    """Push readings for all 15 sensors. Returns (success, failed)."""
    hour = datetime.now().hour
    success = 0
    failed = 0

    for sensor_id in BASE_PM25.keys():
        pm25 = generate_pm25(sensor_id, hour)
        if push_reading(sensor_id, pm25):
            success += 1
        else:
            failed += 1

    return success, failed


def main():
    print(f"╔══════════════════════════════════════════════════════════╗")
    print(f"║       GeoPollute IoT Producer Simulator                  ║")
    print(f"╠══════════════════════════════════════════════════════════╣")
    print(f"║ API:      {API_BASE:<48}║")
    print(f"║ Interval: {INTERVAL_SECONDS}s{'':<46}║")
    print(f"║ Sensors:  {len(BASE_PM25):<48}║")
    print(f"╚══════════════════════════════════════════════════════════╝")

    if not wait_for_api(timeout_seconds=60):
        print(f"[{datetime.now().isoformat()}] ✗ API not reachable after 60s. Exiting.")
        sys.exit(1)

    cycle_count = 0
    while True:
        cycle_count += 1
        start = time.time()
        success, failed = run_cycle()
        elapsed = time.time() - start

        print(f"[{datetime.now().isoformat()}] Cycle #{cycle_count}: "
              f"{success}/{len(BASE_PM25)} ok, {failed} failed, {elapsed:.2f}s elapsed")

        # Wait for next cycle (accounting for elapsed time)
        sleep_time = max(0, INTERVAL_SECONDS - elapsed)
        time.sleep(sleep_time)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n[{datetime.now().isoformat()}] ✓ Producer stopped gracefully")
        sys.exit(0)