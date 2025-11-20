from locust import HttpUser, task, between


class ApiCategoriesUser(HttpUser):
    tags = ["read-only"]
    """
    User class that will test the /api/campaigns/categories endpoint,
    which is used to fetch categories that have active campaigns.
    """

    wait_time = between(1, 2.5)

    @task
    def get_categories(self):
        """
        Tests GET /api/campaigns/categories.
        """
        self.client.get("/api/campaigns/categories", name="/api/campaigns/categories")
