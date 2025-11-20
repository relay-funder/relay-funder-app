# This file serves as the entry point (locustfile) for the Locust test runner.
# It explicitly imports all concrete HttpUser classes from tests.the subdirectories
# so that Locust can discover them, enabling tag-based filtering.

# --- Public (Read-Only) Users ---
from tests.public.test_public_pages import PublicWebsiteUser
from tests.public.test_api_campaigns import CampaignsApiUser
from tests.public.test_api_campaign_details import CampaignDetailsApiUser
from tests.public.test_api_categories import ApiCategoriesUser
from tests.public.test_api_collections_featured import ApiFeaturedCollectionsUser
from tests.public.test_api_rounds import RoundsApiUser

# --- Donor Users ---
from tests.donor.test_donor_interactions import DonorUser
from tests.donor.test_donor_payments import DonorPaymentUser
from tests.donor.test_donor_profile import DonorProfileUser
from tests.donor.test_donor_campaign_reads import DonorCampaignReadUser
from tests.donor.test_donor_misc_reads import DonorMiscReadsUser

# --- Creator Users ---
from tests.creator.test_campaign_creation import CreatorUser

# Locust will automatically detect all imported HttpUser classes.
