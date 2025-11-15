import random
from locust import task
from .base_donor_api import BaseDonorApiUser


class DonorProfileUser(BaseDonorApiUser):
    """
    Tests authenticated read-heavy endpoints related to the user's profile and data.
    """

    # Inherits tags=["donor"], wait_time, and setup logic from BaseDonorApiUser

    @task(5)
    def get_user_profile_and_me(self):
        """Tests GET /api/profile and /api/users/me"""
        self.client.get("/api/users/me", name="/api/users/me [GET]")

    @task(3)
    def get_user_score(self):
        """Tests GET /api/users/me/score and /api/users/me/score/events"""
        self.client.get("/api/users/me/score", name="/api/users/me/score [GET]")
        self.client.get(
            "/api/users/me/score/events", name="/api/users/me/score/events [GET]"
        )

    @task(2)
    def get_user_donations(self):
        """Tests GET /api/users/donations"""
        self.client.get("/api/users/donations", name="/api/users/donations [GET]")

    @task(1)
    def get_user_updates(self):
        """Tests GET /api/users/updates"""
        self.client.get("/api/users/updates", name="/api/users/updates [GET]")
