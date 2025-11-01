import random
from locust import HttpUser, task, between


class RoundsApiUser(HttpUser):
    tags = ["read-only"]
    """
    User class that will test the public-facing /api/rounds endpoints.
    """

    wait_time = between(1, 3)

    # IDs for testing detail pages. Fetched in on_start.
    public_round_ids = []

    def on_start(self):
        """
        Fetch actual round IDs upon user start.
        """
        # Fetch up to 100 rounds to get IDs for detail tests
        response = self.client.get(
            "/api/rounds?page=1&pageSize=10", name="setup: get round ids"
        )
        if response.status_code == 200:
            try:
                data = response.json()
                # Assuming the response is a list of rounds or an object with a 'data' key containing a list
                rounds = data.get("data", data)
                self.public_round_ids = [
                    round_data["id"]
                    for round_data in rounds
                    if isinstance(round_data, dict) and "id" in round_data
                ]
            except Exception as e:
                print(f"Error parsing round IDs response: {e}")

        if not self.public_round_ids:
            # Fallback to a placeholder ID if fetching failed or returned no data
            print(
                "Warning: Could not fetch any round IDs. Falling back to placeholder ID 1."
            )
            self.public_round_ids = [1]

    @task(5)
    def get_all_rounds_default(self):
        """
        Tests GET /api/rounds (default listing).
        """
        self.client.get("/api/rounds", name="/api/rounds [list]")

    @task(3)
    def get_rounds_with_pagination(self):
        """
        Tests GET /api/rounds with pagination.
        """
        page = random.randint(1, 5)
        pageSize = random.choice([5, 10])
        self.client.get(
            f"/api/rounds?page={page}&pageSize={pageSize}",
            name="/api/rounds [paginated]",
        )

    @task(2)
    def get_rounds_by_status(self):
        """
        Tests GET /api/rounds with status filter.
        Assuming 'active' and 'completed' are public statuses.
        """
        status = random.choice(["active", "completed"])
        self.client.get(f"/api/rounds?status={status}", name="/api/rounds [by status]")

    @task(1)
    def get_active_round(self):
        """
        Tests GET /api/rounds/active.
        """
        self.client.get("/api/rounds/active", name="/api/rounds/active")

    @task(1)
    def get_upcoming_round(self):
        """
        Tests GET /api/rounds/upcoming (single upcoming round).
        """
        self.client.get("/api/rounds/upcoming", name="/api/rounds/upcoming")

    @task(1)
    def get_upcoming_rounds_list(self):
        """
        Tests GET /api/rounds/?upcomingOnly=true (list of upcoming rounds).
        """
        self.client.get(
            "/api/rounds?upcomingOnly=true", name="/api/rounds [upcoming list]"
        )

    @task(2)
    def get_round_by_id(self):
        """
        Tests GET /api/rounds/{id} endpoint.
        """
        if self.public_round_ids:
            round_id = random.choice(self.public_round_ids)
            self.client.get(f"/api/rounds/{round_id}", name="/api/rounds/[id]")
        else:
            self.client.get("/api/rounds/1", name="/api/rounds/[id] [placeholder]")
