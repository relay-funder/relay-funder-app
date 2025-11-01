import random
import json
from locust import HttpUser, task, between


class CampaignDetailsApiUser(HttpUser):
    tags = ["read-only"]
    """
    User class that tests the /api/campaigns/{campaignId} endpoint by first
    fetching a list of valid campaign identifiers from the listing API.
    """

    wait_time = between(1, 2.5)

    # Class-level list to store valid campaign identifiers (slugs or IDs)
    _campaign_identifiers = []
    _identifiers_fetched = False

    # Define a maximum number of campaigns to fetch during setup
    MAX_CAMPAIGNS_TO_FETCH = 10

    def on_start(self):
        """
        Ensures a list of valid campaign identifiers is fetched once per worker process.
        """
        # Use a class-level flag to ensure setup runs only once per worker process.
        if not CampaignDetailsApiUser._identifiers_fetched:
            self._fetch_campaign_identifiers()

    def _fetch_campaign_identifiers(self):
        """
        Performs the API call to GET /api/campaigns and populates the identifier list.
        """
        # Set the flag immediately to prevent other users in this process from trying
        CampaignDetailsApiUser._identifiers_fetched = True

        print("INFO: Starting setup to fetch public campaign identifiers...")

        try:
            page = 1
            # Fetch active campaigns with a large page size to maximize coverage
            response = self.client.get(
                f"/api/campaigns?page={page}&pageSize={self.MAX_CAMPAIGNS_TO_FETCH}&status=active",
                name="/api/campaigns [SETUP]",
            )

            if response.status_code != 200:
                print(
                    f"ERROR: Failed to fetch campaign list during setup. Status: {response.status_code}"
                )
                return

            data = response.json()

            if "campaigns" in data and isinstance(data["campaigns"], list):
                identifiers = []
                for campaign in data["campaigns"]:
                    # Prioritize slug if available, otherwise use ID
                    identifier = campaign.get("slug") or str(campaign.get("id"))
                    if identifier:
                        identifiers.append(identifier)

                if identifiers:
                    CampaignDetailsApiUser._campaign_identifiers = identifiers
                    print(
                        f"INFO: Successfully fetched {len(identifiers)} active campaign identifiers."
                    )
                else:
                    print("WARNING: Campaign list was empty or missing identifiers.")

        except Exception as e:
            print(f"CRITICAL ERROR: Exception during campaign identifier setup: {e}")
            # Reset flag if critical failure occurred, allowing retry by next user
            CampaignDetailsApiUser._identifiers_fetched = False

    @task(5)
    def get_campaign_by_id_or_slug(self):
        """
        Tests GET /api/campaigns/{campaignId} using a random fetched identifier.
        """
        identifiers = CampaignDetailsApiUser._campaign_identifiers

        if not identifiers:
            # Fallback if setup failed or no campaigns exist
            self.client.get(
                "/api/campaigns/1",
                name="/api/campaigns/[id_or_slug] [Placeholder]",
            )
            return

        campaign_id = random.choice(identifiers)
        self.client.get(
            f"/api/campaigns/{campaign_id}", name="/api/campaigns/[id_or_slug]"
        )
