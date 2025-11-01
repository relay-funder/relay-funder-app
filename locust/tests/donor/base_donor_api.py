import random
import json
from locust import between
from tests.auth_user import AuthenticatedUser


class BaseDonorApiUser(AuthenticatedUser):
    """
    Base class for authenticated donor API tests.
    Handles fetching a list of valid campaign IDs once per worker process
    and provides utility methods for accessing them.
    """

    abstract = True
    tags = ["donor"]
    wait_time = between(2, 6)

    # Class-level storage for campaign IDs
    _campaign_ids = []
    _ids_fetched = False
    MAX_CAMPAIGNS_TO_FETCH = 10

    def on_start(self):
        """
        Called when a user starts. Ensures JWT is loaded (via super) and campaign IDs are fetched.
        """
        super().on_start()

        # Ensure IDs are fetched only once per worker process
        if not BaseDonorApiUser._ids_fetched:
            self._fetch_campaign_ids()

    def _fetch_campaign_ids(self):
        """
        Performs the API call to GET /api/campaigns and populates the ID list.
        """
        # Set the flag immediately to prevent other users in this process from trying
        BaseDonorApiUser._ids_fetched = True
        print("INFO: Starting setup to fetch campaign IDs for donor API tests...")

        try:
            # Fetch active campaigns
            response = self.client.get(
                f"/api/campaigns?page=1&pageSize={self.MAX_CAMPAIGNS_TO_FETCH}&status=active",
                name="/api/campaigns [SETUP_DONOR_BASE]",
            )

            if response.status_code != 200:
                print(
                    f"ERROR: Failed to fetch campaign list during setup. Status: {response.status_code}"
                )
                return

            data = response.json()

            if "campaigns" in data and isinstance(data["campaigns"], list):
                ids = [
                    campaign.get("id")
                    for campaign in data["campaigns"]
                    if isinstance(campaign.get("id"), int)
                ]

                if ids:
                    BaseDonorApiUser._campaign_ids = ids
                    print(
                        f"INFO: Successfully fetched {len(ids)} campaign IDs for donor API tests."
                    )
                else:
                    print(
                        "WARNING: Campaign list was empty or missing IDs. Donor tasks may fail."
                    )

        except Exception as e:
            print(f"CRITICAL ERROR: Exception during campaign ID setup: {e}")
            BaseDonorApiUser._ids_fetched = False

    def _get_random_campaign_id(self):
        """Returns a random campaign ID from the fetched list or a placeholder."""
        if not BaseDonorApiUser._campaign_ids:
            # Fallback to a placeholder ID if setup failed
            return random.choice([1, 2, 3])
        return random.choice(BaseDonorApiUser._campaign_ids)
