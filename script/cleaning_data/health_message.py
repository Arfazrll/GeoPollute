import json
import pandas as pd

# --- RULE KATEGORI ---

def categorize_pm25(value: float) -> str:
    if value < 25:
        return "baik"
    elif 25 <= value <= 55:
        return "sedang"
    else:
        return "tidak sehat"

def categorize_co2(value: float) -> str:
    if value < 700:
        return "normal"
    elif 700 <= value <= 1000:
        return "buruk"
    else:
        return "sangat buruk"

def categorize_temp(value: float) -> str:
    if 18.0 <= value <= 30.0:
        return "nyaman"
    elif (16.0 <= value < 18.0) or (30.1 <= value <= 32.0):
        return "kurang nyaman"
    else:
        return "sangat tidak nyaman"

def categorize_hum(value: float) -> str:
    if 40 <= value <= 60:
        return "nyaman"
    elif (30 <= value < 40) or (61 <= value <= 70):
        return "lembab"
    else:
        return "lembab sekali"

# --- GENERATE PESAN ---

def generate_air_quality_message(pm25: float, co2: float) -> str:
    pm25_status = categorize_pm25(pm25)
    co2_status = categorize_co2(co2)

    if pm25_status == "baik" and co2_status == "normal":
        return "Kualitas udara baik dan sehat, aman untuk semua aktivitas."
    elif pm25_status == "sedang" or co2_status == "buruk":
        return "Kualitas udara sedang, masih aman namun perlu perhatian bila ada gejala pernapasan."
    elif pm25_status == "tidak sehat" or co2_status == "sangat buruk":
        return "Kualitas udara tidak sehat, gunakan masker dan batasi aktivitas luar ruangan."
    else:
        return "Periksa kualitas udara lebih lanjut, kondisi tidak normal."

def generate_thermal_comfort_message(temp: float, hum: float) -> str:
    temp_status = categorize_temp(temp)
    hum_status = categorize_hum(hum)

    if temp_status == "nyaman" and hum_status == "nyaman":
        return "Suhu dan kelembaban berada pada level nyaman, kondisi baik untuk beraktivitas."
    elif temp_status in ["kurang nyaman", "nyaman"] and hum_status == "lembab":
        return "Kondisi agak lembab, jaga hidrasi dan hindari aktivitas berat."
    elif temp_status == "sangat tidak nyaman" or hum_status == "lembab sekali":
        return "Kondisi suhu dan kelembaban tidak nyaman, batasi aktivitas fisik."
    else:
        return "Perhatikan kondisi suhu dan kelembaban, bisa mempengaruhi kenyamanan."

# --- PIPELINE ---

def generate_dataset(input_file, output_file, file_type="json"):
    # Load JSON
    with open(input_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    # Ambil list data sensor
    data = raw_data.get("aqms", [])

    # Convert ke DataFrame
    df = pd.DataFrame(data)

    # Kolom yang dipakai
    cols_used = ["co2", "pm2_5", "temp", "hum"]

    # Pastikan numeric & interpolate NaN
    for col in cols_used:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df[cols_used] = df[cols_used].interpolate(method="linear", limit_direction="both")

    # Bangun dataset baru
    dataset = []
    for _, row in df.iterrows():
        pm25 = float(row["pm2_5"])
        co2 = float(row["co2"])
        temp = float(row["temp"])
        hum = float(row["hum"])

        dataset.append({
            "input": {
                "pm25": pm25,
                "co2": co2,
                "temp": temp,
                "hum": hum
            },
            "output": {
                "air_quality_message": generate_air_quality_message(pm25, co2),
                "thermal_comfort_message": generate_thermal_comfort_message(temp, hum)
            }
        })

    # Simpan hasil
    if file_type == "json":
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(dataset, f, indent=2, ensure_ascii=False)
    elif file_type == "csv":
        pd.DataFrame(dataset).to_csv(output_file, index=False)

    return dataset


if __name__ == "__main__":
    generate_dataset(
        input_file="F:/MODEL LLM/data/raw/aqms_202508201353.json",
        output_file="F:/MODEL LLM/data/raw/aqms_health_message.json",
        file_type="json"
    )
