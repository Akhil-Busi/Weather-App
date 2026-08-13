
#  Historic Weather App & Data Pipeline

A full-stack, serverless web application designed to query, visualize, and archive historical weather data. Built with a React frontend and a FastAPI backend hosted on AWS Lambda, the application fetches daily temperature metrics, archives query payloads as JSON objects in Amazon S3, and renders interactive performance charts.

🔗 **Live Demo:** [https://weather-app-eight-omega-72.vercel.app/](https://weather-app-eight-omega-72.vercel.app/)

---

##  Architecture & Data Flow

This application is built around a fully decoupled **Serverless Architecture**, ensuring high availability, zero idle infrastructure costs, and automatic scaling.

```text
[ Frontend: React + Vite (Vercel) ]
                 │
                 ▼  (HTTPS / REST API)
[ Amazon API Gateway / Lambda Function URL ]
                 │
                 ▼
[ AWS Lambda: FastAPI + Mangum Handler ] ──► [ Open-Meteo API ]
                 │
                 ▼
[ Amazon S3 Bucket: Historical JSON Storage ]

```

### Component Breakdown

* **Single Page Application (SPA):** Hosted on Vercel. Handles user input validation, manages asynchronous API states, and visualizes temperature trends.
* **API Gateway & Routing:** Configured with a wildcard proxy (`/{proxy+}`) that forwards incoming HTTP traffic directly to the AWS Lambda instance, allowing FastAPI to natively handle routing, CORS headers, and payload validation.
* **Serverless Compute Engine:** Python 3.13 environment running FastAPI wrapped inside Mangum (ASGI adapter). It executes request validation, coordinates external API calls, and handles object persistence.
* **Persistent Storage Layer:** Amazon S3 stores immutable JSON payloads representing historic queries, serving as a persistent database for stored weather reports.

---

##  Tech Stack & Libraries Used

### **Frontend Libraries (React + Vite)**

* **UI & DOM:** `react`, `react-dom`
* **Data Fetching:** `axios`
* **Visualization:** `recharts`
* **Iconography:** `lucide-react`
* **Build & Tooling:** `vite`, `@vitejs/plugin-react`
* **Styling Engine:** `tailwindcss`, `postcss`, `autoprefixer`

### **Backend Libraries (Python API)**

* **Core API Framework:** `fastapi`, `starlette`
* **Serverless Adapter:** `mangum`
* **AWS SDK:** `boto3`, `botocore`, `s3transfer`, `jmespath`
* **Data Validation:** `pydantic`, `pydantic_core`
* **Local Server & HTTP Utilities:** `uvicorn`, `httpx`, `httpcore`, `h11`, `urllib3`, `certifi`, `idna`, `anyio`
* **Types & Parsing:** `typing_extensions`, `typing-inspection`, `annotated-doc`, `annotated-types`, `python-dateutil`, `six`
* **Environment & CLI:** `python-dotenv`, `click`, `colorama`

---

##  Real-World Challenges & Engineering Solutions

### 1. Windows-to-Linux Cross-Platform Binary Packaging

* **The Issue:** FastAPI relies on `pydantic-core`, which uses pre-compiled C-extensions. When packaging dependencies on Windows using standard GUI zip utilities or manual extraction, Linux-specific file structures and binary paths (`.so` files) were truncated or corrupted, causing `ModuleNotFound` and `ImportError` runtime failures inside the AWS Lambda Linux environment.
* **The Solution:** Isolated dependency downloading using explicit target platform flags (`--platform manylinux2014_x86_64 --only-binary=:all:`). Replaced manual GUI compression with command-line archiving via Windows `tar.exe` and PowerShell `Compress-Archive` commands inside the deployment pipeline to preserve exact Linux binary integrity and path structures.

### 2. AWS Lambda Execution Timeout Optimization

* **The Issue:** AWS Lambda defaults to a 3.0-second execution limit. The workflow of initializing the Python runtime, fetching data from an external third-party API (Open-Meteo), and executing write operations to Amazon S3 occasionally exceeded this threshold, causing `Sandbox.Timedout` errors.
* **The Solution:** Adjusted the function configuration timeout to 15 seconds and optimized AWS S3 client instantiation outside the main request handler scope to reuse connection pools across warm invocations.

---

##  Local Development Setup

### **Prerequisites**

* Node.js (v18+)
* Python 3.13
* AWS CLI (configured with valid credentials)

---

### **1. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows (CMD/PowerShell):
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run local development server
uvicorn main:app --reload

```

*The interactive API documentation will be accessible at `http://127.0.0.1:8000/docs`.*

---

### **2. Frontend Setup**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set environment variable (.env.local)
echo "VITE_API_BASE_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)" > .env.local

# Run development server
npm run dev

```

---

##  Deployment Guide

### **Deploying Backend to AWS Lambda**

1. **Target-Build Linux Dependencies (on Windows):**
```powershell
pip install -r requirements.txt -t lambda_Upload --platform manylinux2014_x86_64 --implementation cp --python-version 3.13 --only-binary=:all: --upgrade

```


2. **Package Application via Command Line:**
Copy `main.py` into `lambda_Upload/`, navigate into `lambda_Upload/`, and compress via `tar.exe`:
```cmd
tar.exe -a -c -f function.zip *

```


3. **Configure AWS Lambda:**
* Runtime: **Python 3.13** | Architecture: **x86_64**
* Upload `function.zip`
* Handler: **`main.handler`**
* Timeout: **15 seconds**
* Environment Variable: `S3_BUCKET_NAME = inrisk-weather-data-akhil-2026-339388024008-us-east-1-an`


4. **IAM Permissions:**
Ensure the Lambda Execution Role includes permissions for `s3:PutObject`, `s3:GetObject`, and `s3:ListBucket`.

### **Deploying Frontend to Vercel**

1. Connect repository to Vercel.
2. Define Environment Variable:
* `VITE_API_BASE_URL` = `<Your-API-Gateway-or-Lambda-URL>`


3. Trigger deployment.

