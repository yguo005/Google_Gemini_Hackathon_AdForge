# 📁 AdForge Project Structure

## 🏗️ **Clean Architecture Overview**

```
adforge/
├── 📁 src/                          # Frontend source code
│   ├── 📁 components/               # React components
│   │   ├── AgentDashboard.tsx      # AI transparency dashboard
│   │   ├── ApiKeySelector.tsx      # API key input component
│   │   ├── CampaignResults.tsx     # Campaign display component
│   │   ├── Header.tsx              # App header
│   │   ├── InputForm.tsx           # Campaign input form
│   │   └── Spinner.tsx             # Loading spinner
│   ├── 📁 services/                # Frontend services
│   │   └── geminiService.ts        # Gemini API for frontend
│   └── 📁 types/                   # TypeScript type definitions
│       └── types.ts                # Campaign and API types
├── 📁 backend/                     # Python backend
│   ├── 📁 src/                     # Backend source code
│   │   ├── __init__.py             # Package init
│   │   ├── ad_simulator.py         # Campaign data simulator
│   │   ├── adforge_agent.py        # AI agent with OODA loop
│   │   └── gemini_service.py       # Gemini API for backend
│   ├── 📁 logs/                    # Agent execution logs
│   ├── app.py                      # Flask API server
│   └── requirements.txt            # Python dependencies
├── 📁 data/                        # Data files
│   └── digital_marketing_campaign_dataset.csv
├── 📁 docs/                        # Documentation
│   └── SETUP_GUIDE.md              # Complete setup instructions
├── 📁 node_modules/                # Node.js dependencies
├── App.tsx                         # Main React app
├── index.tsx                       # React entry point
├── index.html                      # HTML template
├── package.json                    # Node.js dependencies
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite build config
├── PROJECT_STRUCTURE.md            # This file
└── README.md                       # Project overview
```

## 🎯 **Key Features by Component**

### **Frontend (React + TypeScript)**
- **App.tsx**: Main application with demo launcher
- **AgentDashboard**: Real-time AI transparency visualization
- **Original AdForge**: Campaign generation with Gemini + Imagen

### **Backend (Python + Flask)**
- **app.py**: REST API server for agent communication
- **adforge_agent.py**: AI agent implementing OODA loop
- **ad_simulator.py**: Campaign data simulation from CSV
- **gemini_service.py**: Real Gemini AI integration

### **Data & Documentation**
- **data/**: Campaign dataset for realistic simulations
- **docs/**: Setup guides and documentation
- **logs/**: Real-time agent execution logs

## 🚀 **How to Run**

### **Development Mode (2 terminals required):**

**Terminal 1 - Backend:**
```bash
cd backend
python3 app.py
# Runs on http://localhost:5001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Runs on http://localhost:3000
```

## 🔧 **Configuration**

### **API Keys:**
- **Frontend**: Create `.env` with `API_KEY=your_key`
- **Backend**: Create `backend/.env` with `GEMINI_API_KEY=your_key`

### **Dependencies:**
- **Frontend**: `npm install` (React, Vite, Lucide React)
- **Backend**: `pip install -r requirements.txt` (Flask, Gemini AI)

## 🎪 **Demo Features**

1. **Original AdForge**: AI-powered campaign generation
2. **Agent Transparency**: Real-time OODA loop visualization
3. **Real Gemini AI**: Live AI decision-making process
4. **Campaign Simulation**: Using actual marketing data

## 📊 **Architecture Benefits**

- **Separation of Concerns**: Frontend/Backend clearly separated
- **Modular Design**: Components and services are independent
- **Scalable Structure**: Easy to add new features
- **Clean Dependencies**: Minimal coupling between modules
- **Documentation**: Clear setup and usage instructions
