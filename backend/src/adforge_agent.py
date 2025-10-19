import json
import time
import os
from datetime import datetime
from .ad_simulator import AdCampaignSimulator

class AdForgeAgent:
    def __init__(self, job_id, gemini_service):
        self.job_id = job_id
        self.gemini_service = gemini_service
        self.log_file_path = f"logs/{job_id}.jsonlog"
        
        # Ensure logs directory exists
        os.makedirs("logs", exist_ok=True)
        
        # Clear any existing log file
        if os.path.exists(self.log_file_path):
            os.remove(self.log_file_path)
    
    def write_log_entry(self, entry_data):
        """Appends a new JSON object to the job's log file."""
        entry_data["timestamp"] = datetime.now().isoformat()
        with open(self.log_file_path, "a") as f:
            f.write(json.dumps(entry_data) + "\n")
    
    def construct_reasoning_prompt(self, observation):
        """
        Constructs a unique prompt for Gemini by combining a fixed meta-prompt
        with live, real-time data.
        """
        meta_prompt = """
You are AdForge, an expert AI marketing agent. Your sole objective is to maximize product sales by intelligently managing advertising campaigns.

You have the following tools available:
1. `increase_budget`: Increase budget for high-performing campaigns
2. `decrease_budget`: Reduce budget for underperforming campaigns  
3. `pause_campaign`: Stop a campaign that's losing money
4. `optimize_targeting`: Adjust targeting parameters
5. `continue_monitoring`: Keep current settings and monitor
6. `request_human_input`: Ask for human guidance on complex decisions

DECISION CRITERIA:
- ROI > 20%: Consider increasing budget
- ROI < -10%: Consider decreasing budget or pausing
- Cost per conversion > $30: Needs optimization
- Click-through rate < 2%: Poor targeting, needs optimization
- High engagement but low conversions: Optimize landing page

Analyze the campaign data below. Provide clear reasoning and choose the single best action.
Your response MUST be valid JSON with this exact structure:
{
  "reasoning": "Your detailed analysis of the current situation",
  "confidence": 0.85,
  "action": {
    "tool_name": "tool_to_execute",
    "parameters": {"key": "value"},
    "expected_outcome": "What you expect this action to achieve"
  }
}
"""
        
        # Convert observation to readable format
        current_state = json.dumps(observation, indent=2)
        
        full_prompt = f"""
{meta_prompt}

--- CURRENT CAMPAIGN DATA ---
{current_state}
--- END OF DATA ---

Provide your reasoning and next action as JSON:
"""
        
        return full_prompt
    
    def execute_action(self, action_decision):
        """
        Simulate executing the agent's decision.
        In a real system, this would call actual APIs.
        """
        tool_name = action_decision.get("tool_name", "unknown")
        parameters = action_decision.get("parameters", {})
        
        # Simulate different action outcomes
        action_results = {
            "increase_budget": f"Budget increased by {parameters.get('amount', '20%')}. Monitoring for improved performance.",
            "decrease_budget": f"Budget decreased by {parameters.get('amount', '15%')}. Reducing risk exposure.",
            "pause_campaign": "Campaign paused. No further spend until review.",
            "optimize_targeting": f"Targeting optimized: {parameters.get('changes', 'demographic adjustments made')}.",
            "continue_monitoring": "No changes made. Continuing to monitor performance metrics.",
            "request_human_input": f"Human input requested: {parameters.get('question', 'Need guidance on next steps')}"
        }
        
        result = action_results.get(tool_name, f"Executed {tool_name} with parameters {parameters}")
        
        # Add some realistic delay
        time.sleep(0.5)
        
        return {
            "tool_executed": tool_name,
            "parameters_used": parameters,
            "result": result,
            "execution_time": datetime.now().isoformat()
        }
    
    async def run_intelligent_campaign(self, dataset_path):
        """
        Main agent loop implementing the OODA cycle:
        Observe -> Orient -> Decide -> Act
        """
        # Initialize the simulator
        simulator = AdCampaignSimulator(dataset_path, demo_rows=3)
        
        # Log campaign start
        campaign_summary = simulator.get_campaign_summary()
        start_log = {
            "step": "INITIALIZE",
            "message": "AdForge Agent starting campaign analysis",
            "campaign_summary": campaign_summary
        }
        self.write_log_entry(start_log)
        time.sleep(1)
        
        step_number = 1
        
        # Main OODA loop
        while True:
            # --- 1. OBSERVE ---
            observation = simulator.get_next_observation()
            if observation is None:
                break  # Campaign finished
            
            observe_log = {
                "step": "OBSERVE",
                "step_number": step_number,
                "sub_step": "data_received",
                "message": f"Receiving campaign data for step {step_number}",
                "data": observation
            }
            self.write_log_entry(observe_log)
            time.sleep(1.5)  # Demo effect
            
            # --- 2. ORIENT ---
            # Sub-step 1: Construct prompt
            prompt = self.construct_reasoning_prompt(observation)
            orient_log_1 = {
                "step": "ORIENT", 
                "step_number": step_number,
                "sub_step": "prompt_constructed",
                "message": "Analyzing data and preparing query for AI reasoning engine",
                "prompt": prompt[:500] + "..." if len(prompt) > 500 else prompt  # Truncate for display
            }
            self.write_log_entry(orient_log_1)
            time.sleep(1)
            
            # Sub-step 2: Get AI response
            orient_log_2 = {
                "step": "ORIENT",
                "step_number": step_number, 
                "sub_step": "consulting_ai",
                "message": "Consulting Gemini AI for strategic analysis..."
            }
            self.write_log_entry(orient_log_2)
            time.sleep(2)
            
            try:
                gemini_response_str = await self.gemini_service.generate_content(prompt)
                # Clean up the response to extract JSON
                if "```json" in gemini_response_str:
                    json_start = gemini_response_str.find("```json") + 7
                    json_end = gemini_response_str.find("```", json_start)
                    gemini_response_str = gemini_response_str[json_start:json_end].strip()
                
                gemini_response = json.loads(gemini_response_str)
                
                orient_log_3 = {
                    "step": "ORIENT",
                    "step_number": step_number,
                    "sub_step": "ai_response_received", 
                    "message": "AI analysis complete",
                    "ai_response": gemini_response
                }
                self.write_log_entry(orient_log_3)
                time.sleep(1)
                
            except Exception as e:
                # Fallback decision if AI fails
                gemini_response = {
                    "reasoning": f"AI service unavailable. Using fallback logic based on ROI: {observation.get('roi', 0)}%",
                    "confidence": 0.6,
                    "action": {
                        "tool_name": "continue_monitoring",
                        "parameters": {},
                        "expected_outcome": "Maintain current strategy until AI service is restored"
                    }
                }
                
                orient_log_3 = {
                    "step": "ORIENT",
                    "step_number": step_number,
                    "sub_step": "ai_fallback",
                    "message": f"AI service error, using fallback logic: {str(e)}",
                    "ai_response": gemini_response
                }
                self.write_log_entry(orient_log_3)
                time.sleep(1)
            
            # --- 3. DECIDE ---
            decision = gemini_response.get('action', {})
            decide_log = {
                "step": "DECIDE",
                "step_number": step_number,
                "message": f"Decision made: {decision.get('tool_name', 'unknown')}",
                "decision": decision,
                "reasoning": gemini_response.get('reasoning', ''),
                "confidence": gemini_response.get('confidence', 0.5)
            }
            self.write_log_entry(decide_log)
            time.sleep(1)
            
            # --- 4. ACT ---
            act_log_1 = {
                "step": "ACT",
                "step_number": step_number,
                "sub_step": "executing",
                "message": f"Executing action: {decision.get('tool_name', 'unknown')}"
            }
            self.write_log_entry(act_log_1)
            time.sleep(1)
            
            action_result = self.execute_action(decision)
            
            act_log_2 = {
                "step": "ACT",
                "step_number": step_number,
                "sub_step": "completed",
                "message": "Action executed successfully",
                "action_taken": decision,
                "result": action_result
            }
            self.write_log_entry(act_log_2)
            time.sleep(1)
            
            step_number += 1
        
        # Campaign complete
        final_summary = simulator.get_campaign_summary()
        complete_log = {
            "step": "COMPLETE",
            "message": "Campaign analysis complete",
            "final_summary": final_summary
        }
        self.write_log_entry(complete_log)
        
        return final_summary
