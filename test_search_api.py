import requests
import os
from dotenv import load_dotenv
import pathlib

load_dotenv(pathlib.Path(__file__).parent / ".env.local")
SERP_API_KEY = os.environ.get("SERP_API_KEY")

def test_pharmacy_search():
    lat, lon = 12.9716, 77.5946 # Bangalore coords for testing
    params = {
        "engine": "google_maps",
        "q": "medical shop",
        "ll": f"@{lat},{lon},15z",
        "api_key": SERP_API_KEY
    }
    
    print(f"Testing with API Key: {SERP_API_KEY[:5]}...")
    try:
        response = requests.get("https://www.searchapi.io/api/v1/search", params=params)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        
        if "error" in data:
            print(f"API Error: {data['error']}")
            return

        local_results = data.get("local_results", [])
        print(f"Found {len(local_results)} results")
        for i, res in enumerate(local_results[:3]):
            print(f"{i+1}. {res.get('title')} - {res.get('address')}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_pharmacy_search()
