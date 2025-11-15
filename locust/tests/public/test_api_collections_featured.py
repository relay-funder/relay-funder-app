from locust import HttpUser, task, between


class ApiFeaturedCollectionsUser(HttpUser):
    tags = ["read-only"]
    """
    User class that will test the /api/collections/featured endpoint.
    """

    wait_time = between(1, 2.5)

    @task
    def get_featured_collections(self):
        """
        Test GET /api/collections/featured endpoint.
        """
        self.client.get("/api/collections/featured", name="/api/collections/featured")
