import random
from locust import task
from ..auth_user import AuthenticatedUser


class DonorWebsiteUser(AuthenticatedUser):
    tags = ["donor", "authenticated"]
    """
    User class that tests pages accessible to an authenticated donor,
    including the dashboard and profile pages.
    It inherits session management from AuthenticatedUser.
    """

    # Inherits wait_time from AuthenticatedUser (between 1, 3)

    # Class-level list to store valid campaign slugs
    _campaign_slugs = []
    _slugs_fetched = False
    MAX_CAMPAIGNS_TO_FETCH = 10

    def on_start(self):
        """
        Called when a user starts. Ensures campaign slugs are fetched once per worker process,
        and calls the parent's on_start to set up authentication.
        """
        super().on_start()  # Setup authentication first

        if not DonorWebsiteUser._slugs_fetched:
            self._fetch_campaign_slugs()

    def _fetch_campaign_slugs(self):
        """
        Performs the API call to GET /api/campaigns and populates the slug list.
        """
        print("INFO: Starting setup to fetch campaign slugs for donor page tests...")

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
                DonorWebsiteUser._campaign_slugs = []
                DonorWebsiteUser._slugs_fetched = False
                return

            data = response.json()

            if "campaigns" in data and isinstance(data["campaigns"], list):
                slugs = []
                for campaign in data["campaigns"]:
                    slug = campaign.get("slug")
                    if slug:
                        slugs.append(slug)

                if slugs:
                    DonorWebsiteUser._campaign_slugs = slugs
                    DonorWebsiteUser._slugs_fetched = True
                    print(
                        f"INFO: Successfully fetched {len(slugs)} campaign slugs for donor page tests."
                    )
                else:
                    print(
                        "WARNING: Campaign list was empty or missing slugs. Detail page tests may fail."
                    )
                    DonorWebsiteUser._campaign_slugs = []
                    DonorWebsiteUser._slugs_fetched = False

        except Exception as e:
            print(f"CRITICAL ERROR: Exception during campaign slug setup: {e}")
            # Reset flag if critical failure occurred, allowing retry by next user
            DonorWebsiteUser._campaign_slugs = []
            DonorWebsiteUser._slugs_fetched = False

    def _get_random_slug(self):
        """Returns a random campaign slug from the fetched list or a placeholder."""
        if not DonorWebsiteUser._campaign_slugs:
            # Fallback to a placeholder slug if setup failed
            return random.choice(["placeholder-slug-1", "placeholder-slug-2"])
        return random.choice(DonorWebsiteUser._campaign_slugs)

    @task(5)  # High weight for the donor dashboard
    def load_donor_dashboard(self):
        """
        Tests loading the authenticated donor dashboard page.
        """
        self.client.get("/dashboard", name="/dashboard [Donor Dashboard]")

    @task(3)
    def load_donor_profile(self):
        """
        Tests loading the authenticated donor profile page.
        """
        self.client.get("/profile", name="/profile [Donor Profile]")

    @task(2)
    def load_root_page(self):
        """
        Tests loading the application's root page (authenticated view).
        """
        self.client.get("/", name="/ [Home Page - Donor]")

    @task(1)
    def load_campaigns_listing(self):
        """
        Tests loading the /campaigns listing page (authenticated view).
        """
        self.client.get("/campaigns", name="/campaigns [Listing Page - Donor]")

    @task(1)
    def load_campaign_detail_page(self):
        """
        Tests loading a random campaign detail page by slug (authenticated view).
        """
        slug = self._get_random_slug()
        self.client.get(
            f"/campaigns/{slug}", name="/campaigns/[slug] [Detail Page - Donor]"
        )
