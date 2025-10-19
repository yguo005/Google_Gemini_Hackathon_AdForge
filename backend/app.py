from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import uuid
import asyncio
import threading
from datetime import datetime
from dotenv import load_dotenv
from adforge_agent import AdForgeAgent
from gemini_service import GeminiService

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# In-memory job storage (in production, use Redis or database)
active_jobs = {}


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

@app.route('/test-gemini', methods=['GET'])
def test_gemini():
    """Test Gemini API connection"""
    try:
        gemini_service = GeminiService()
        is_connected = gemini_service.test_connection()
        
        return jsonify({
            "success": True,
            "gemini_connected": is_connected,
            "message": "Gemini API is working" if is_connected else "Gemini API connection failed - using fallback responses",
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "gemini_connected": False,
            "error": str(e),
            "message": "Please set GEMINI_API_KEY environment variable",
            "timestamp": datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    # Ensure logs directory exists
    os.makedirs('logs', exist_ok=True)
    
    print("🚀 AdForge Agent Backend starting...")
    print("📊 Ready to analyze campaigns with AI transparency")
    app.run(debug=True, host='0.0.0.0', port=5001)
