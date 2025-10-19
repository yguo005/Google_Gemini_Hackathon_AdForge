from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import uuid
import asyncio
import threading
from datetime import datetime
import sys
sys.path.append('../services')

from adforge_agent import AdForgeAgent

app = Flask(__name__)
CORS(app)

# In-memory job storage (in production, use Redis or database)
active_jobs = {}

class GeminiService:
    """Mock Gemini service for demo - replace with actual service"""
    async def generate_content(self, prompt):
        # Simulate AI thinking time
        await asyncio.sleep(1)
        
        # Mock intelligent responses based on prompt content
        if "ROI" in prompt and "20%" in prompt:
            return '''```json
{
  "reasoning": "The campaign shows strong ROI of 25.3% which exceeds our 20% threshold. The cost per conversion of $15.2 is well below our $30 limit. Click-through rate of 15.57% indicates excellent targeting. This is a high-performing campaign that deserves increased investment.",
  "confidence": 0.92,
  "action": {
    "tool_name": "increase_budget",
    "parameters": {"amount": "25%", "reason": "high_roi_performance"},
    "expected_outcome": "Increased conversions while maintaining profitable ROI"
  }
}```'''
        elif "cost_per_conversion" in prompt:
            return '''```json
{
  "reasoning": "Current cost per conversion is concerning. The campaign is spending efficiently on clicks but conversion rate needs improvement. The high time on site suggests users are engaged but not converting. This indicates a landing page or offer optimization opportunity rather than a budget issue.",
  "confidence": 0.78,
  "action": {
    "tool_name": "optimize_targeting",
    "parameters": {"focus": "landing_page_optimization", "test_variations": 3},
    "expected_outcome": "Improved conversion rate while maintaining click quality"
  }
}```'''
        else:
            return '''```json
{
  "reasoning": "Campaign performance is within acceptable ranges. No immediate red flags detected. ROI is positive and cost metrics are reasonable. Continuing current strategy while monitoring for trends.",
  "confidence": 0.65,
  "action": {
    "tool_name": "continue_monitoring",
    "parameters": {},
    "expected_outcome": "Stable performance with opportunity to identify optimization patterns"
  }
}```'''

@app.route('/start-campaign', methods=['POST'])
def start_campaign():
    """Start a new campaign analysis job"""
    try:
        # Generate unique job ID
        job_id = str(uuid.uuid4())
        
        # Initialize the job
        active_jobs[job_id] = {
            "status": "STARTING",
            "created_at": datetime.now().isoformat(),
            "progress": 0
        }
        
        # Start the agent in a separate thread
        def run_agent():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                # Create agent and gemini service
                gemini_service = GeminiService()
                agent = AdForgeAgent(job_id, gemini_service)
                
                # Update job status
                active_jobs[job_id]["status"] = "RUNNING"
                
                # Run the campaign analysis
                dataset_path = "../digital_marketing_campaign_dataset.csv"
                result = loop.run_until_complete(agent.run_intelligent_campaign(dataset_path))
                
                # Update final status
                active_jobs[job_id]["status"] = "COMPLETED"
                active_jobs[job_id]["result"] = result
                
            except Exception as e:
                active_jobs[job_id]["status"] = "ERROR"
                active_jobs[job_id]["error"] = str(e)
            finally:
                loop.close()
        
        # Start the agent thread
        thread = threading.Thread(target=run_agent)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            "success": True,
            "job_id": job_id,
            "message": "Campaign analysis started"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/get-campaign-status/<job_id>', methods=['GET'])
def get_campaign_status(job_id):
    """Get the current status and live log of a campaign job"""
    try:
        # Check if job exists
        if job_id not in active_jobs:
            return jsonify({
                "success": False,
                "error": "Job not found"
            }), 404
        
        # Get job info
        job_info = active_jobs[job_id]
        
        # Read the log file
        log_file_path = f"logs/{job_id}.jsonlog"
        log_entries = []
        
        if os.path.exists(log_file_path):
            with open(log_file_path, 'r') as f:
                for line in f:
                    if line.strip():
                        try:
                            log_entries.append(json.loads(line))
                        except json.JSONDecodeError:
                            continue
        
        # Calculate progress based on log entries
        total_expected_steps = 3  # We're using 3 demo rows
        completed_steps = len([entry for entry in log_entries if entry.get("step") == "ACT" and entry.get("sub_step") == "completed"])
        progress = min(100, (completed_steps / total_expected_steps) * 100) if total_expected_steps > 0 else 0
        
        return jsonify({
            "success": True,
            "job_info": {
                **job_info,
                "progress": progress
            },
            "log_entries": log_entries,
            "total_entries": len(log_entries)
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/list-jobs', methods=['GET'])
def list_jobs():
    """List all active jobs"""
    return jsonify({
        "success": True,
        "jobs": active_jobs
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "success": True,
        "message": "AdForge Agent Backend is running",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    # Ensure logs directory exists
    os.makedirs('logs', exist_ok=True)
    
    print("🚀 AdForge Agent Backend starting...")
    print("📊 Ready to analyze campaigns with AI transparency")
    app.run(debug=True, host='0.0.0.0', port=5001)
