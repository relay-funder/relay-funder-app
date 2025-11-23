import os
import random
from locust import HttpUser, between
import logging
import http.cookies

# Class-level storage for full cookie strings loaded from environment/file
_cookie_strings = []

# --- Token Loading Logic ---
# This block executes when the module is imported by a Locust worker process.
# Resolve the path relative to the directory of this file
base_dir = os.path.dirname(os.path.abspath(__file__))
jwt_file_path = os.path.join(base_dir, "..", "sessions.txt")
try:
    # Load multiple JWTs from the specified file (one per line)
    with open(jwt_file_path, "r") as f:
        tokens = [line.strip() for line in f if line.strip()]
        _cookie_strings.extend(tokens)
    logging.info(
        f"Loaded {len(_cookie_strings)} cookie strings from file specified by SESSION_JWT_FILE."
    )
except FileNotFoundError:
    pass
except Exception as e:
    logging.error(f"Failed to read cookie file: {e}")

# Fallback to single cookie string environment variable if no tokens were loaded from file
if not _cookie_strings:
    single_cookie = os.environ.get("SESSION_JWT")
    if single_cookie:
        _cookie_strings.append(single_cookie)
        logging.info(
            "Loaded single cookie string from SESSION_JWT environment variable."
        )

# --- AuthenticatedUser Class Definition ---


class AuthenticatedUser(HttpUser):
    """
    Base class for authenticated users.
    Reads full cookie strings from sessions.txt (multiple strings, one per line) or
    SESSION_JWT environment variable (single string). A random cookie string is assigned to each user instance.
    """

    # Setting abstract = True prevents Locust from trying to run this class directly.
    abstract = True
    wait_time = between(1, 3)

    def on_start(self):
        """
        Called when a Locust user starts running. Used to set up authentication.
        """

        if _cookie_strings:
            # Select a random full cookie string from the pool for this user
            cookie_string = random.choice(_cookie_strings)

            # Parse the cookie string and set individual cookies on the client
            cookie_jar = http.cookies.SimpleCookie()
            cookie_jar.load(cookie_string)

            for key, morsel in cookie_jar.items():
                # Set each cookie on the client's session.
                # Requests handles setting cookies based on the request URL domain.
                self.client.cookies.set(key, morsel.value)

            logging.info(f"User initialized with {len(cookie_jar)} cookies.")

            # Ensure minimal headers are set
            self.client.headers = {"Content-Type": "application/json"}
        else:
            # Log a warning if no cookie strings are available.
            logging.warning("No cookie strings loaded. Authenticated tasks will fail.")
            # Ensure minimal headers are set even without cookies
            self.client.headers = {"Content-Type": "application/json"}
