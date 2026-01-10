# Relay Funder App Load Testing with Locust

This directory contains the Locust test suite for load testing the `relay-funder-app`. Tests are split into public (non-authenticated) and authenticated user flows, leveraging Docker Compose for distributed execution.

## Prerequisites

1.  Docker and Docker Compose installed.
2.  The main application (`app` service) must be running.
3.  For authenticated tests, a valid Session JWT for a test user is required.

## Running Public (Non-Authenticated) Tests

Public tests cover endpoints like `/`, `/campaigns`, `/api/campaigns`, `/api/rounds`, etc. All user classes in `tests` will be automatically discovered.

1.  **Start the services:**
    ```bash
    docker compose --profile loadtest up --build -d app locust-master
    ```

2.  **Access the UI:**
    Open your browser to `http://localhost:8089`.

3.  **Start Swarming:**
    *   **Host:** Enter the target host URL (e.g., `http://app:3000` for local Docker testing, or a staging/production URL).
    *   Set the desired number of users and spawn rate.

## Running Authenticated (User) Tests

Authenticated tests require one or more valid JSON Web Tokens (JWTs) to be passed to the worker containers. The `AuthenticatedUser` base class (`auth_user.py`) handles loading these tokens and assigning a random token to each user instance.

### 1. Providing Session JWTs

You can provide JWTs using one of two methods:

#### Method A: Multiple Users (Recommended for Scale)

1.  **Create a JWT File:** Create a file (e.g., `locust/sessions.txt`) where each line contains a single, unique session JWT.
    ```
    # locust/sessions.txt
    eyJhbGciOiJIUzI1NiI...<token_for_user_1>
    eyJhbGciOiJIUzI1NiI...<token_for_user_2>
    ...
    ```
2.  **Set Environment Variable:** Pass the path to this file using `SESSION_JWT_FILE`.
    ```bash
    export SESSION_JWT_FILE="./locust/sessions.txt"
    ```

#### Method B: Single User (For quick testing)

1.  **Set Environment Variable:** Pass a single JWT using `SESSION_JWT`. All users will share this token.
    ```bash
    export SESSION_JWT="<YOUR_SINGLE_JWT_HERE>"
    ```

### 2. Start Services

Ensure the chosen environment variable (`SESSION_JWT_FILE` or `SESSION_JWT`) is set in your shell or passed to Docker Compose.

```bash
docker compose --profile loadtest up --build -d app locust-master locust-worker
```
*(Note: The `locust-worker` service must be configured in `docker-compose.yml` to read these variables.)*

### 3. Access the UI and Start Swarming:

Follow the same steps as the public tests. The authenticated user classes (`DonorUser`, `CreatorUser`) will automatically use the provided JWT.

## Running Specific Flows (Using Tags)

All user classes have been assigned tags to allow isolated testing of specific flows:
*   **`read-only`**: Public pages and non-authenticated API calls.
*   **`donor`**: Authenticated donor actions (commenting, faving).
*   **`creator`**: Authenticated creator actions (campaign creation).

To run a specific flow, enter the corresponding tag (e.g., `read-only`) in the "Tags to include" field in the Locust Web UI before starting the swarm.

## Scaling the Load Test

To increase the load beyond what a single worker can handle, scale the worker service:

```bash
# Scales the worker service to 10 instances
docker compose --profile loadtest up --scale locust-worker=10 -d
```

## Test Structure

All load test logic is contained within the `locust` directory:

| File | Purpose |
| :--- | :--- |
| `public/test_health_check.py` | Basic health check. |
| `auth_user.py` | Base class for authenticated users (handles JWT). |
| `public/test_public_pages.py` | Tests public page rendering. |
| `public/test_api_campaigns.py` | Tests public campaign listing API endpoints. |
| `public/test_api_campaign_details.py` | Tests public campaign detail API endpoints. |
| `public/test_api_categories.py` | Tests public categories API endpoints. |
| `public/test_api_collections_featured.py` | Tests public featured collections API endpoints. |
| `public/test_api_rounds.py` | Tests public rounds API endpoints. |
| `donor/base_donor_api.py` | Base class for donor API tests (handles campaign ID setup). |
| `donor/test_donor_interactions.py` | Authenticated donor interactions (commenting, faving). |
| `donor/test_donor_payments.py` | Authenticated donor payment/donation flow. |
| `donor/test_donor_profile.py` | Authenticated donor profile and user data reads. |
| `donor/test_donor_campaign_reads.py` | Authenticated donor campaign-specific reads. |
| `donor/test_donor_misc_reads.py` | Authenticated donor global/miscellaneous reads. |
| `creator/test_campaign_creation.py` | Authenticated creator flows (campaign creation). |
