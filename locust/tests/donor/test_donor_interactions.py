import random
import json
from locust import task, between
from .base_donor_api import BaseDonorApiUser


class DonorUser(BaseDonorApiUser):
    """
    Simulates an authenticated user performing donor actions (commenting, faving).
    Inherits JWT handling from AuthenticatedUser.
    """

    tags = ["donor"]

    wait_time = between(3, 7)  # Longer wait time for user interaction simulation

    @task(3)
    def post_campaign_comment(self):
        """
        Tests POST /api/campaigns/{campaignId}/comments
        """
        campaign_id = self._get_random_campaign_id()
        comment_content = (
            f"Great campaign! Load test comment {random.randint(1000, 9999)}"
        )

        payload = {"content": comment_content}

        # Note: The Content-Type header is set in the AuthenticatedUser base class
        self.client.post(
            f"/api/campaigns/{campaign_id}/comments",
            data=json.dumps(payload),
            name="/api/campaigns/[id]/comments [POST]",
        )

    @task(2)
    def toggle_campaign_favorite(self):
        """
        Tests POST /api/favorites to add/toggle a favorite campaign.
        """
        campaign_id = self._get_random_campaign_id()

        payload = {"campaignId": campaign_id}

        self.client.post(
            "/api/favorites", data=json.dumps(payload), name="/api/favorites [POST]"
        )

    @task(1)
    def get_user_favorites(self):
        """
        Tests GET /api/favorites/user to retrieve the user's list of favorites.
        """
        self.client.get("/api/favorites/user", name="/api/favorites/user [GET]")
