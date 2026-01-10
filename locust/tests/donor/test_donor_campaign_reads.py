import random
from locust import task
from .base_donor_api import BaseDonorApiUser


class DonorCampaignReadUser(BaseDonorApiUser):
    """
    Tests authenticated read endpoints specific to individual campaigns.
    Inherits campaign ID setup and JWT handling from BaseDonorApiUser.
    """

    # Inherits tags=["donor"], wait_time, and setup logic

    @task(4)
    def get_campaign_financial_data(self):
        """Tests GET /api/campaigns/[id]/payments and /treasury-balance"""
        campaign_id = self._get_random_campaign_id()

        # Get list of payments/donations for the campaign
        self.client.get(
            f"/api/campaigns/{campaign_id}/payments",
            name="/api/campaigns/[id]/payments [GET]",
        )

        # Get treasury balance
        self.client.get(
            f"/api/campaigns/{campaign_id}/treasury-balance",
            name="/api/campaigns/[id]/treasury-balance [GET]",
        )

    @task(3)
    def get_campaign_status_data(self):
        """Tests GET /api/campaigns/[id]/updates and /stats"""
        campaign_id = self._get_random_campaign_id()

        # Get campaign updates (e.g., blog posts, progress reports)
        self.client.get(
            f"/api/campaigns/{campaign_id}/updates",
            name="/api/campaigns/[id]/updates [GET]",
        )
