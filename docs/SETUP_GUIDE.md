# 🚀 Complete Setup Guide for AdForge

## 📋 **Prerequisites**
- Node.js installed
- Python 3.x installed
- Gemini API key from https://aistudio.google.com/

## 🔑 **Step 1: Get Your Gemini API Key**
1. Visit https://aistudio.google.com/
2. Sign in with your Google account
3. Click "Get API Key" → "Create API Key"
4. Copy the key (starts with `AIzaSy...`)

## ⚙️ **Step 2: Set Up API Keys**

### **For Frontend (React):**
Create `/Users/mac/Desktop/adforge/.env`:
```bash
cd /Users/mac/Desktop/adforge
echo "API_KEY=AIzaSy_your_actual_api_key_here" > .env
```

### **For Backend (Python):**
Create `/Users/mac/Desktop/adforge/backend/.env`:
```bash
cd /Users/mac/Desktop/adforge/backend
echo "GEMINI_API_KEY=AIzaSy_your_actual_api_key_here" > .env
echo "API_KEY=AIzaSy_your_actual_api_key_here" >> .env
```

## 🏃‍♂️ **Step 3: Run Both Services**

### **Terminal 1: Start Backend**
```bash
cd /Users/mac/Desktop/adforge/backend
python3 app.py
```
✅ Should show: `Running on http://127.0.0.1:5001`

### **Terminal 2: Start Frontend**
```bash
cd /Users/mac/Desktop/adforge
npm run dev
```
✅ Should show: `Local: http://localhost:5173/`

## 🧪 **Step 4: Test Everything**

### **Test Backend:**
```bash
curl http://localhost:5001/health
curl http://localhost:5001/test-gemini
```

### **Test Frontend:**
Open http://localhost:5173 in your browser

## 🎯 **What Each Service Does:**

### **Frontend (React + TypeScript)**
- **Original AdForge features**: Campaign generation, image creation
- **Uses**: `services/geminiService.ts`
- **Port**: 5173
- **API Key**: Reads from `/Users/mac/Desktop/adforge/.env`

### **Backend (Python + Flask)**
- **Agent Transparency Dashboard**: OODA loop visualization
- **Uses**: `backend/gemini_service.py`
- **Port**: 5001
- **API Key**: Reads from `/Users/mac/Desktop/adforge/backend/.env`

## 🔄 **Complete Workflow:**

1. **Start both terminals** (backend on 5001, frontend on 5173)
2. **Open browser** to http://localhost:5173
3. **Two options available**:
   - **Original AdForge**: Use the input form for campaign generation
   - **Agent Demo**: Click "🤖 Launch Agent Transparency Demo"

## 🐛 **Troubleshooting:**

### **"vite: command not found"**
```bash
cd /Users/mac/Desktop/adforge
npm install
```

### **"Port already in use"**
```bash
# Kill existing processes
pkill -f "python.*app.py"
pkill -f "node.*vite"
```

### **"API key required"**
- Make sure both `.env` files exist with your actual API key
- Restart both servers after adding the key

### **Backend won't start**
```bash
cd /Users/mac/Desktop/adforge/backend
pip install -r requirements.txt
```

## 🎉 **Demo Ready!**

Once both are running:
- **Frontend**: http://localhost:5173 (Original AdForge + Demo launcher)
- **Backend**: http://localhost:5001 (Agent API)
- **Agent Demo**: Click the demo button to see AI transparency in action!

Both services share the same Gemini API key but serve different purposes in your hackathon demo! 🏆
