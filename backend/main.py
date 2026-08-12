import os
import json
import httpx
from datetime import datetime, date, timezone
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator
import boto3
from botocore.exceptions import ClientError
from mangum import Mangum
from dotenv import load_dotenv

# 1. Load the environment variables from the .env file FIRST
load_dotenv()

app = FastAPI()

# 1. CORS Configuration: Required for the frontend to communicate with this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to your Netlify/Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. AWS S3 Client Setup
s3_client = boto3.client("s3")
BUCKET_NAME = os.environ.get("S3_BUCKET_NAME", "your-inrisk-bucket-name")

# 3. Validation Model: Enforces geographic and date constraints instantly.
class WeatherRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date > self.end_date:
            raise ValueError("start_date must be before or equal to end_date")
        if (self.end_date - self.start_date).days > 31:
            raise ValueError("Date range cannot exceed 31 days")
        return self

# 4. Endpoint 1: Fetch and Store Data
@app.post("/store-weather-data")
async def store_weather_data(request: WeatherRequest):
    # Call Open-Meteo historical API
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": request.latitude,
        "longitude": request.longitude,
        "start_date": request.start_date.isoformat(),
        "end_date": request.end_date.isoformat(),
        "daily": "temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,sunrise,sunset,windspeed_10m_max", # The 5 required variables[cite: 1]
        "timezone": "auto"
    }
    
    # Asynchronously fetch the data
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    # --- ADD THIS LINE FOR LOCAL TESTING ---
    print(f"SUCCESS! Open-Meteo Data retrieved. Keys found: {list(data.keys())}")
    # ---------------------------------------
    
    # Generate the exact filename required by the case study[cite: 1]
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    file_name = f"weather_{request.latitude}_{request.longitude}_{request.start_date}_{request.end_date}_{timestamp}.json"

    # Push the JSON to AWS S3
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=file_name,
        Body=json.dumps(data),
        ContentType="application/json"
    )

    return {"status": "ok", "file": file_name}

# 5. Endpoint 2: List Stored Files Efficiently[cite: 1]
@app.get("/list-weather-files")
async def list_weather_files():
    try:
        response = s3_client.list_objects_v2(Bucket=BUCKET_NAME)
        files = []
        
        if 'Contents' in response:
            for obj in response['Contents']:
                files.append({
                    "name": obj['Key'],
                    "size": obj['Size'],
                    "created_at": obj['LastModified'].isoformat() # Formats to ISO8601
                })
                
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")
# 6. Endpoint 3: Fetch File Content[cite: 1]
@app.get("/weather-file-content/{file}")
def get_weather_file(file: str):
    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=file)
        content = response["Body"].read().decode("utf-8")
        return json.loads(content)
    except ClientError as e:
        # Check specifically if the file is missing in S3
        if e.response['Error']['Code'] == 'NoSuchKey':
            # Return the exact JSON required for a 404 by the case study using JSONResponse[cite: 1]
            return JSONResponse(status_code=404, content={"status": "error", "message": "not found"})
        
        # If it's a different AWS error, return a standard 500
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

# 7. The Bridge: Wraps the FastAPI app for AWS Lambda deployment[cite: 1]
handler = Mangum(app)