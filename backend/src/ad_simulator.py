import pandas as pd
import json
from datetime import datetime, timedelta

class AdCampaignSimulator:
    def __init__(self, dataset_path, demo_rows=3):
        """
        Initialize the simulator with the dataset.
        For demo purposes, we'll only use the first few rows.
        """
        # Load the entire dataset
        full_data = pd.read_csv(dataset_path)
        
        # For demo, only use first N rows
        self.data = full_data.head(demo_rows)
        self.current_step = 0
        self.total_steps = len(self.data)
        
        # Convert the data to a more campaign-friendly format
        self.processed_data = self._process_data()
        
    def _process_data(self):
        """Convert the raw data into campaign-style observations"""
        processed = []
        base_date = datetime(2024, 10, 19)  # Start from today
        
        for idx, row in self.data.iterrows():
            # Create a campaign observation from the CSV row
            observation = {
                "date": (base_date + timedelta(hours=idx)).strftime("%Y-%m-%d %H:%M:%S"),
                "campaign_id": f"CAMP_{row['CustomerID']}",
                "ad_spend": round(row['AdSpend'], 2),
                "click_through_rate": round(row['ClickThroughRate'], 4),
                "conversion_rate": round(row['ConversionRate'], 4),
                "website_visits": int(row['WebsiteVisits']),
                "pages_per_visit": round(row['PagesPerVisit'], 2),
                "time_on_site": round(row['TimeOnSite'], 2),
                "social_shares": int(row['SocialShares']),
                "email_opens": int(row['EmailOpens']),
                "email_clicks": int(row['EmailClicks']),
                "conversions": int(row['Conversion']),
                "campaign_channel": row['CampaignChannel'],
                "campaign_type": row['CampaignType'],
                "advertising_platform": row['AdvertisingPlatform'],
                "customer_age": int(row['Age']),
                "customer_gender": row['Gender'],
                "customer_income": int(row['Income']),
                "previous_purchases": int(row['PreviousPurchases']),
                "loyalty_points": int(row['LoyaltyPoints'])
            }
            
            # Calculate some derived metrics
            observation["cost_per_click"] = round(observation["ad_spend"] / max(observation["website_visits"], 1), 2)
            observation["cost_per_conversion"] = round(observation["ad_spend"] / max(observation["conversions"], 1), 2) if observation["conversions"] > 0 else None
            observation["roi"] = round((observation["conversions"] * 50 - observation["ad_spend"]) / observation["ad_spend"] * 100, 2)  # Assuming $50 per conversion
            
            processed.append(observation)
            
        return processed
    
    def get_next_observation(self):
        """
        Returns the campaign data for the current time step
        and advances the simulation.
        """
        if self.current_step >= self.total_steps:
            return None  # The campaign is over
        
        # Get the data for the current time step
        observation = self.processed_data[self.current_step]
        self.current_step += 1
        
        return observation
    
    def get_campaign_summary(self):
        """Get overall campaign metrics"""
        if self.current_step == 0:
            return {
                "total_budget": sum(obs["ad_spend"] for obs in self.processed_data),
                "total_steps": self.total_steps,
                "current_step": 0,
                "status": "READY"
            }
        
        completed_observations = self.processed_data[:self.current_step]
        return {
            "total_budget": sum(obs["ad_spend"] for obs in self.processed_data),
            "spent_budget": sum(obs["ad_spend"] for obs in completed_observations),
            "total_conversions": sum(obs["conversions"] for obs in completed_observations),
            "total_clicks": sum(obs["website_visits"] for obs in completed_observations),
            "total_steps": self.total_steps,
            "current_step": self.current_step,
            "status": "RUNNING" if self.current_step < self.total_steps else "COMPLETE"
        }
    
    def reset(self):
        """Reset the simulator to the beginning"""
        self.current_step = 0
