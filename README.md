#  AdForge - AI Marketing Agent Transparency Platform

A revolutionary platform that combines **AI-powered campaign generation** with **transparent AI decision-making** using Google's Gemini AI.

##  **Two Powerful Features**

###  **Original AdForge**
- **AI-Powered Script Generation**: Create engaging ad copy tailored to specific audiences
- **Visual Campaign Creation**: Generate stunning ad visuals with detailed prompts
- **Multi-Audience Targeting**: Generate different campaigns for different target demographics

###  **Agent Transparency Dashboard**
- **Real-time OODA Loop**: Watch AI think through Observe, Orient, Decide, Act
- **Live AI Reasoning**: See exactly how Gemini analyzes campaign data
- **Transparent Decision-Making**: Every AI thought process is visible
- **Campaign Simulation**: Using real marketing data from CSV dataset

##  **Quick Start**

### **Prerequisites**
- Node.js and Python 3.x installed
- Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### **Setup (2 terminals required)**

**Terminal 1 - Backend:**
```bash
cd backend
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key_here" > .env
python3 app.py
```

**Terminal 2 - Frontend:**
```bash
npm install
echo "API_KEY=your_key_here" > .env
npm run dev
```

### **Access Your App**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

##  **Architecture**

- **Frontend**: React + TypeScript + Vite
- **Backend**: Python + Flask + Gemini AI
- **AI Integration**: Real Google Gemini API
- **Data**: Real marketing campaign dataset

##  **Documentation**

- **[Complete Setup Guide](docs/SETUP_GUIDE.md)** - Detailed installation instructions
- **[Project Structure](PROJECT_STRUCTURE.md)** - Code organization overview

