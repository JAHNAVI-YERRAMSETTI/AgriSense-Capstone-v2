import requests

payload = {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 20.8,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.9
}

response = requests.post(
    "http://localhost:5000/predict",
    json=payload
)

print("Status:", response.status_code)
print("Response:", response.json())
