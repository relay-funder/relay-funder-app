import random
import time
from datetime import datetime, timedelta
from locust import task, between
from tests.auth_user import AuthenticatedUser


class CreatorUser(AuthenticatedUser):
    tags = ["creator"]
    """
    Simulates an authenticated user performing creator-related actions,
    specifically creating new campaigns via POST /api/campaigns.
    """

    # Slower pace for complex, resource-intensive creation flows
    wait_time = between(5, 15)

    def generate_future_date(self, days_offset: int) -> str:
        """Generates an ISO formatted date string in the future."""
        future_date = datetime.now() + timedelta(days=days_offset)
        # Append 'Z' for UTC interpretation, common for API date strings
        return future_date.isoformat() + "Z"

    @task(1)
    def create_new_campaign(self):
        """
        Tests POST /api/campaigns using multipart/form-data.
        This simulates a user creating a new campaign draft.
        """
        if not self.jwt:
            # Skip if JWT is missing, as this is an authenticated task
            return

        # Generate dynamic and unique data
        unique_id = int(time.time() * 1000)
        title = f"Load Test Campaign {unique_id}"
        description = (
            f"A description for load test campaign {unique_id}. Testing creator flow."
        )
        funding_goal = str(random.randint(1000, 5000))

        # Set campaign duration (must be in the future)
        start_offset = random.randint(1, 10)
        duration = random.randint(10, 30)

        start_time = self.generate_future_date(start_offset)
        end_time = self.generate_future_date(start_offset + duration)

        # Form fields (must be strings for FormData)
        data = {
            "title": title,
            "description": description,
            "fundingGoal": funding_goal,
            "startTime": start_time,
            "endTime": end_time,
            "status": "draft",  # Start as draft
            "location": random.choice(["Kenya", "Germany"]),
            "category": "education",
        }

        # Simulate file upload for bannerImage
        # Locust uses the 'files' parameter to correctly encode multipart/form-data.
        dummy_image_content = b"This is a dummy image file content."
        files = {"bannerImage": ("banner.png", dummy_image_content, "image/png")}

        self.client.post(
            "/api/campaigns",
            data=data,
            files=files,
            name="/api/campaigns [POST - Create Campaign]",
            # Ensure we don't send application/json header for multipart requests
            headers={"Authorization": f"Bearer {self.jwt}"},
            # Locust handles Content-Type: multipart/form-data automatically when 'files' is present
        )
