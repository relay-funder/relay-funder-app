import random
from locust import HttpUser, task, between


class CampaignsApiUser(HttpUser):
    tags = ["read-only"]
    """
    User class that will test the /api/campaigns endpoint.
    """

    wait_time = between(1, 2.5)

    @task
    def get_active_campaigns(self):
        """
        Tests GET /api/campaigns with default 'active' status.
        """
        self.client.get("/api/campaigns")

    @task
    def get_campaigns_with_pagination(self):
        """
        Tests GET /api/campaigns with pagination parameters.
        """
        page = random.randint(1, 5)  # Assuming a few pages of data exist
        pageSize = random.choice([5, 10])
        self.client.get(f"/api/campaigns?page={page}&pageSize={pageSize}")

    @task
    def get_campaigns_with_status(self):
        """
        Tests GET /api/campaigns with different status.
        Note: The backend enforces 'active' status for non-admin users.
        """
        # Although the backend might enforce 'active' for non-admin,
        # we can still attempt to request other statuses.
        # For a truly public test, 'active' is the most relevant.
        status = random.choice(
            ["active", "completed", "failed"]
        )  # DRAFT, PENDING_APPROVAL, DISABLED require admin
        self.client.get(f"/api/campaigns?status={status}")

    @task
    def get_campaigns_with_rounds(self):
        """
        Tests GET /api/campaigns requesting rounds information.
        """
        self.client.get("/api/campaigns?rounds=true")

    @task
    def get_campaigns_all_parameters(self):
        """
        Tests GET /api/campaigns with a combination of parameters.
        """
        page = random.randint(1, 5)
        pageSize = random.choice([5, 10])
        status = "active"  # For public-facing, non-authenticated, 'active' is most likely valid
        rounds = random.choice(["true", "false"])
        self.client.get(
            f"/api/campaigns?page={page}&pageSize={pageSize}&status={status}&rounds={rounds}"
        )
