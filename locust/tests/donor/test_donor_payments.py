import random
import json
from locust import task, between
from .base_donor_api import BaseDonorApiUser


class DonorPaymentUser(BaseDonorApiUser):
    """
    Simulates an authenticated user making a donation (POST /api/campaigns/[id]/payments).
    """

    tags = ["donor"]
    wait_time = between(5, 10)  # Slower pace for transaction simulation

    @task(1)
    def post_pledges_registration(self):
        """POST /api/pledges/register to register a pledge."""
        self.client.post(
            "/api/pledges/register",
            json={
                "pledgeId": "0xcde",
                "treasuryAddress": "0x152c8119c7c055eb473e8c25d2f56fed9c390495",
            },
            name="/api/pledges/register",
        )
