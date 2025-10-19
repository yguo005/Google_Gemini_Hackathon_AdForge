# 🤖 Setting Up Real Gemini AI Integration

Your AdForge Agent Transparency Dashboard now uses **real Google Gemini AI** instead of mock responses! Here's how to set it up:

## 🔑 Step 1: Get Your Gemini API Key

1. **Visit Google AI Studio**: https://aistudio.google.com/
2. **Sign in** with your Google account
3. **Click "Get API Key"** in the left sidebar
4. **Create a new API key** or use an existing one
5. **Copy the API key** (it looks like: `AIzaSyC...`)

## ⚙️ Step 2: Configure Your Backend

1. **Navigate to the backend directory**:
   ```bash
   cd /Users/mac/Desktop/adforge/backend
   ```

2. **Create a .env file** with your API key:
   ```bash
   echo "GEMINI_API_KEY=AIzaSyC_your_actual_api_key_here" > .env
   ```

3. **Test the connection**:
   ```bash
   curl http://localhost:5001/test-gemini
   ```

   You should see:
   ```json
   {
     "success": true,
     "gemini_connected": true,
     "message": "Gemini API is working"
   }
   ```

## 🚀 Step 3: Run the Demo

1. **Make sure backend is running**:
   ```bash
   cd /Users/mac/Desktop/adforge/backend
   python3 app.py
   ```

2. **Start the frontend**:
   ```bash
   cd /Users/mac/Desktop/adforge
   npm run dev
   ```

3. **Open your browser** and click "🤖 Launch Agent Transparency Demo"

4. **Click "Start Agent Demo"** and watch **real AI** analyze your campaign data!

## 🧠 What's Different Now?

### Before (Mock):
- ❌ Fake, predictable responses
- ❌ No real AI reasoning
- ❌ Limited decision variety

### Now (Real Gemini):
- ✅ **Real Google Gemini AI** analyzing your data
- ✅ **Genuine AI reasoning** and insights  
- ✅ **Dynamic responses** based on actual campaign metrics
- ✅ **Intelligent fallbacks** if API is unavailable
- ✅ **Transparent AI thinking** process

## 🎯 Features of Real Integration

1. **Intelligent Analysis**: Gemini analyzes ROI, conversion rates, click-through rates, and more
2. **Strategic Decisions**: Real AI makes marketing decisions like budget adjustments, targeting optimization
3. **Contextual Reasoning**: AI provides detailed explanations for each decision
4. **Confidence Scoring**: AI indicates how confident it is in each recommendation
5. **Graceful Fallbacks**: System continues working even if API is temporarily unavailable

## 🔧 Troubleshooting

### "API key is required" Error:
- Make sure your `.env` file is in the `backend/` directory
- Verify your API key is correct (no extra spaces)
- Restart the backend server after adding the key

### "Gemini API connection failed":
- Check your internet connection
- Verify your API key is valid at https://aistudio.google.com/
- Make sure you have API quota remaining

### Backend won't start:
- Install dependencies: `pip install -r requirements.txt`
- Check if port 5001 is available
- Look for error messages in the terminal

## 🎉 Demo Script

Perfect for your hackathon presentation:

1. **"Let me show you how our AI agent thinks..."**
2. **Click the demo button** → Audience sees the dashboard
3. **Start the agent** → Real-time OODA loop visualization begins
4. **Point out each step**:
   - 🎯 **OBSERVE**: "Here's the agent receiving campaign data"
   - 🧠 **ORIENT**: "Now it's consulting Gemini AI for analysis"
   - ✅ **DECIDE**: "The AI has made a strategic decision"
   - ⚡ **ACT**: "And now it's executing that decision"

5. **Highlight the transparency**: "This is what makes AI trustworthy - you can see exactly how it thinks!"

Your audience will be amazed by the real-time AI decision-making process! 🏆
