# AdForge Agent Backend

This is the backend service for the AdForge Agent Transparency Dashboard with real Gemini AI integration.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up your Gemini API key:
```bash
# Create a .env file in the backend directory
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
```

3. Run the server:
```bash
python app.py
```

The server will start on `http://localhost:5001`

## API Endpoints

- `POST /start-campaign` - Start a new campaign analysis
- `GET /get-campaign-status/<job_id>` - Get live status and logs
- `GET /list-jobs` - List all active jobs
- `GET /health` - Health check
- `GET /test-gemini` - Test Gemini API connection

## Features

- **Real Gemini AI Integration**: Uses Google's Gemini API for intelligent campaign analysis
- **Fallback System**: Gracefully handles API failures with intelligent fallback responses
- **Real-time OODA loop visualization**: Watch AI think through Observe, Orient, Decide, Act
- **Campaign data simulation**: Uses your CSV dataset for realistic scenarios
- **AI decision-making transparency**: Every AI reasoning step is logged and visible
- **Live log streaming**: Real-time updates of agent's thought process

## Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key (required)
- `API_KEY` - Alternative name for the API key (optional)

## Testing Gemini Connection

Visit `http://localhost:5001/test-gemini` to verify your API key is working correctly.
