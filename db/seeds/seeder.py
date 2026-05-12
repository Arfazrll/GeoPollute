"""
Seeder script: generate 24 jam dummy readings untuk 15 sensor.
Setiap sensor punya ~720 readings (1 reading per 2 menit).

Usage:
    cd db/seeds
    pip install psycopg2-binary python-dotenv
    python seeder.py
"""
import os
import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

try:
    import psycopg2
except ImportError:
    print("ERROR: psycopg2 not installed. Run: pip install psycopg2-binary")
    sys.exit(1)


from dotenv import load_dotenv

# Load .env from root or current dir
load_dotenv(Path(__file__).parents[2] / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable is not set.")
    sys.exit(1)

SENSORS = [f"S-{i:02d}" for i in range(1, 16)]
INTERVAL_SECONDS = 120
HOURS_BACK = 24

# Base PM2.5 untuk tiap sensor (variasi spasial realistis Jakarta)
BASE_PM25 = {
    "S-01": 45, "S-02": 52, "S-03": 38, "S-04": 67, "S-05": 41,
    "S-06": 33, "S-07": 78, "S-08": 55, "S-09": 89, "S-10": 42,
    "S-11": 35, "S-12": 61, "S-13": 72, "S-14": 31, "S-15": 58,
}


def generate_pm25(sensor_id: str, hour_of_day: int) -> float:
    """Generate realistic PM2.5 dengan variasi diurnal + noise."""
    base = BASE_PM25[sensor_id]

    # Diurnal cycle: pollution peak pagi (7-9) dan sore (17-19)
    if hour_of_day in (7, 8, 9, 17, 18, 19):
        diurnal = random.uniform(8, 15)
    elif hour_of_day in (0, 1, 2, 3, 4, 5):
        diurnal = random.uniform(-10, -5)
    else:
        diurnal = random.uniform(-3, 5)

    noise = random.uniform(-4, 4)
    return max(0, base + diurnal + noise)


def main():
    print(f"Connecting to: {DATABASE_URL}")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # Verify sensors exist
    cur.execute("SELECT COUNT(*) FROM sensors")
    count = cur.fetchone()[0]
    if count == 0:
        print("ERROR: No sensors found. Run seed SQL first.")
        sys.exit(1)
    print(f"Found {count} sensors")

    now = datetime.now(timezone.utc)
    rows = []
    total_intervals = HOURS_BACK * 3600 // INTERVAL_SECONDS

    print(f"Generating {total_intervals} intervals x {len(SENSORS)} sensors...")

    for i in range(total_intervals, 0, -1):
        ts = now - timedelta(seconds=i * INTERVAL_SECONDS)
        hour = ts.hour
        for sensor_id in SENSORS:
            pm25 = generate_pm25(sensor_id, hour)
            rows.append((sensor_id, "PM25", pm25, "ug/m3", ts))

    print(f"Inserting {len(rows)} rows...")

    cur.executemany(
        """INSERT INTO pollutant_readings
           (sensor_id, pollutant_type, value, unit, recorded_at)
           VALUES (%s, %s, %s, %s, %s)""",
        rows,
    )
    conn.commit()
    print(f"✓ Inserted {len(rows)} readings across {HOURS_BACK} hours")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()