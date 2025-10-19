# AdForge Agent Backend

This is the backend service for the AdForge Agent Transparency Dashboard.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

- `POST /start-campaign` - Start a new campaign analysis
- `GET /get-campaign-status/<job_id>` - Get live status and logs
- `GET /list-jobs` - List all active jobs
- `GET /health` - Health check

## Features

- Real-time OODA loop visualization
- Campaign data simulation using CSV dataset
- AI decision-making transparency
- Live log streaming
