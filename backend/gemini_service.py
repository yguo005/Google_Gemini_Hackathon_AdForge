import google.generativeai as genai
import json
import os
from typing import Dict, Any

class GeminiService:
    def __init__(self, api_key: str = None):
        """
        Initialize Gemini service with API key.
        API key can be passed directly or set as environment variable GEMINI_API_KEY
        """
        self.api_key = api_key or os.getenv('GEMINI_API_KEY') or os.getenv('API_KEY')
        
        if not self.api_key:
            raise ValueError(
                "Gemini API key is required. Please set GEMINI_API_KEY environment variable "
                "or pass api_key parameter to GeminiService constructor."
            )
        
        # Configure the Gemini API
        genai.configure(api_key=self.api_key)
        
        # Initialize the model
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    async def generate_content(self, prompt: str) -> str:
        """
        Generate content using Gemini API
        """
        try:
            # Generate content using Gemini
            response = self.model.generate_content(prompt)
            
            # Return the generated text
            return response.text
            
        except Exception as e:
            print(f"Error calling Gemini API: {str(e)}")
            # Fallback to mock response if API fails
            return self._get_fallback_response(prompt)
    
    def _get_fallback_response(self, prompt: str) -> str:
        """
        Fallback response when Gemini API is unavailable
        """
        # Analyze prompt to provide intelligent fallback
        if "ROI" in prompt and any(word in prompt.lower() for word in ["high", "good", "strong", "positive"]):
            return '''```json
{
  "reasoning": "Campaign shows promising performance metrics. ROI appears positive and engagement indicators suggest effective targeting. However, without real-time AI analysis, recommending conservative approach.",
  "confidence": 0.70,
  "action": {
    "tool_name": "continue_monitoring",
    "parameters": {"reason": "api_fallback"},
    "expected_outcome": "Maintain current performance while awaiting full AI analysis"
  }
}```'''
        elif any(word in prompt.lower() for word in ["cost", "expensive", "budget", "spend"]):
            return '''```json
{
  "reasoning": "Cost-related concerns detected in campaign data. Without full AI analysis, recommending budget optimization to minimize risk while maintaining performance.",
  "confidence": 0.65,
  "action": {
    "tool_name": "optimize_targeting",
    "parameters": {"focus": "cost_efficiency", "reason": "api_fallback"},
    "expected_outcome": "Improved cost efficiency while maintaining conversion quality"
  }
}```'''
        else:
            return '''```json
{
  "reasoning": "Campaign analysis in progress. Current metrics appear stable. Continuing monitoring approach until full AI analysis is available.",
  "confidence": 0.60,
  "action": {
    "tool_name": "continue_monitoring",
    "parameters": {"reason": "api_fallback"},
    "expected_outcome": "Stable performance maintenance during analysis period"
  }
}```'''

    def test_connection(self) -> bool:
        """
        Test if the Gemini API connection is working
        """
        try:
            test_response = self.model.generate_content("Hello, this is a test. Please respond with 'OK'.")
            return "OK" in test_response.text or "ok" in test_response.text.lower()
        except Exception as e:
            print(f"Gemini API connection test failed: {str(e)}")
            return False
