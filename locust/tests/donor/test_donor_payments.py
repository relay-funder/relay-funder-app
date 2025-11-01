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
    def get_pledges_registration_status(self):
        """Tests GET /api/pledges/register (Assuming this checks user registration/status)"""
        self.client.post(
            "/api/pledges/register",
            data={
                "treasuryAddress": "0x152c8119c7c055eb473e8c25d2f56fed9c390495",
                "pledgeId": "0xcde",
            },
            name="/api/pledges/register [POST]",
        )
