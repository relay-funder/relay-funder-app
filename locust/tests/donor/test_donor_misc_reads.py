import random
from locust import task
from .base_donor_api import BaseDonorApiUser


class DonorMiscReadsUser(BaseDonorApiUser):
    """
    Tests global authenticated read endpoints not tied to a specific profile or campaign.
    Inherits campaign ID setup and JWT handling from BaseDonorApiUser.
    """

    # Inherits tags=["donor"], wait_time, and setup logic

    @task(3)
    def get_global_event_feed(self):
        """Tests GET /api/event-feed (Global activity feed)"""
        self.client.get("/api/event-feed", name="/api/event-feed [GET]")

    @task(2)
    def get_treasury_balance(self):
        """Tests GET /api/treasury/balance (Global treasury status)"""
        self.client.get(
            "/api/treasury/balance?address=0x10b52a537a9558f7fa7dc03c2b00c04de9023bce",
            name="/api/treasury/balance [GET]",
        )

    @task(2)
    def get_round_details(self):
        """Tests GET /api/rounds/active and /api/rounds/[id]/campaigns"""
        # Test active round detail (might return more data for authenticated users)
        self.client.get("/api/rounds/active", name="/api/rounds/active [GET]")
        self.client.get("/api/rounds/upcoming", name="/api/rounds/upcoming [GET]")
