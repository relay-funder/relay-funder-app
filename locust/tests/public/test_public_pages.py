import random
import json
from locust import HttpUser, task, between


class PublicWebsiteUser(HttpUser):
    tags = ["read-only"]
    """
    User class that tests the main public-facing pages of the application,
    including dynamic loading of campaign detail pages and paginated browsing.
    """

    wait_time = between(2, 5)  # Longer wait time for page loads

    # Class-level list to store valid campaign slugs
    _campaign_slugs = []
    _slugs_fetched = False
    MAX_CAMPAIGNS_TO_FETCH = 10

    def on_start(self):
        """
        Called when a user starts. Ensures campaign slugs are fetched once per worker process.
        """
        if not PublicWebsiteUser._slugs_fetched:
            self._fetch_campaign_slugs()

    def _fetch_campaign_slugs(self):
        """
        Performs the API call to GET /api/campaigns and populates the slug list.
        """
        # Set the flag immediately to prevent other users in this process from trying
        PublicWebsiteUser._slugs_fetched = True

        print("INFO: Starting setup to fetch public campaign slugs for page tests...")

        try:
            # Fetch active campaigns with a large page size
            response = self.client.get(
                f"/api/campaigns?page=1&pageSize={self.MAX_CAMPAIGNS_TO_FETCH}&status=active",
                name="/api/campaigns [SETUP_PAGES]",
            )

            if response.status_code != 200:
                print(
                    f"ERROR: Failed to fetch campaign list during setup. Status: {response.status_code}"
                )
                return

            data = response.json()

            if "campaigns" in data and isinstance(data["campaigns"], list):
                slugs = []
                for campaign in data["campaigns"]:
                    slug = campaign.get("slug")
                    if slug:
                        slugs.append(slug)

                if slugs:
                    PublicWebsiteUser._campaign_slugs = slugs
                    print(
                        f"INFO: Successfully fetched {len(slugs)} campaign slugs for page tests."
                    )
                else:
                    print(
                        "WARNING: Campaign list was empty or missing slugs. Detail page tests may fail."
                    )

        except Exception as e:
            print(f"CRITICAL ERROR: Exception during campaign slug setup: {e}")
            # Reset flag if critical failure occurred, allowing retry by next user
            PublicWebsiteUser._slugs_fetched = False

    def _get_random_slug(self):
        """Returns a random campaign slug from the fetched list or a placeholder."""
        if not PublicWebsiteUser._campaign_slugs:
            # Fallback to a placeholder slug if setup failed
            return random.choice(["placeholder-slug-1", "placeholder-slug-2"])
        return random.choice(PublicWebsiteUser._campaign_slugs)

    @task(5)  # Higher weight for the root page
    def load_root_page(self):
        """
        Tests loading the application's root page.
        """
        self.client.get("/", name="/ [Home Page]")

    @task(3)
    def load_campaigns_listing(self):
        """
        Tests loading the /campaigns listing page.
        """
        self.client.get("/campaigns", name="/campaigns [Listing Page]")

    @task(2)
    def load_campaign_detail_page(self):
        """
        Tests loading a random campaign detail page by slug.
        """
        slug = self._get_random_slug()
        self.client.get(f"/campaigns/{slug}", name="/campaigns/[slug] [Detail Page]")

    @task(2)
    def load_full_campaigns_pagination(self):
        """
        Simulates a user browsing through multiple pages of the campaign listing API.
        This hits the underlying API endpoint, which is often triggered by client-side pagination.
        """
        # Assuming the API supports max pageSize=10 and we want to browse 5 pages
        for page in range(1, 10):
            self.client.get(
                f"/api/campaigns?page={page}&pageSize=10&status=active",
                name="/api/campaigns [Paginated Browse]",
            )

    # Assuming /collections/page.tsx exists and is public
    @task(1)
    def load_collections_listing(self):
        """
        Tests loading the /collections listing page.
        """
        self.client.get("/collections", name="/collections [Listing Page]")
