export interface RoundResultsPartner {
  id: string;
  name: string;
  logo: string;
  website: string;
  description: string;
}

export interface RoundResultsCampaignBinding {
  name: string;
  partnerId: string;
  partner?: RoundResultsPartner;
}

export interface RoundResultsSponsor {
  name: string;
  logo: string;
  description: string;
  website: string;
}

export const CELO_PREZENTI_SPONSOR: RoundResultsSponsor = {
  name: 'Prezenti, Celo',
  logo: '/images/logo-prezenti.svg',
  description:
    'Prezenti is a community-powered funding organisation that provides fast, flexible grants to local leaders and projects in the Celo community. Their mission is to boost teams doing meaningful work, often before traditional funders even notice them, by removing barriers and centering trust. Prezenti grants are designed to help ideas take shape quickly, giving organizers the push they need to turn intention into action.',
  website: 'https://prezenti.xyz',
};

export const ROUND_RESULTS_PARTNERS: RoundResultsPartner[] = [
  {
    id: 'refunite',
    name: 'REFUNITE',
    logo: '/images/logo-refunite.webp',
    website: 'https://refunite.org',
    description:
      'A global nonprofit and digital platform that helps refugees and displaced people reconnect with missing family members through secure mobile and online tools, operating across multiple countries.',
  },
  {
    id: 'grassroots-economics',
    name: 'Grassroots Economics',
    logo: '/images/logo-grassroots-economics.webp',
    website: 'https://www.grassrootseconomics.org',
    description:
      'A nonprofit foundation strengthening local economies through community-driven financial tools such as Community Asset Vouchers and pooled commitments, enabling marginalized communities to build more resilient livelihoods.',
  },
  {
    id: 'sina-loketa',
    name: 'SINA Loketa',
    logo: '/images/logo-sina-loketa.jpg',
    website: 'https://sinaloketa.org',
    description:
      'A refugee-led nonprofit in Uganda that fosters entrepreneurship, digital inclusion, peacebuilding, and sustainable livelihoods among refugees and host communities.',
  },
  {
    id: 'action-for-refugee-life',
    name: 'Action for Refugee Life',
    logo: '/images/logo-arel.svg',
    website: 'https://refugeelife.org',
    description:
      'A Kenya-based, refugee-led organization in Kakuma refugee camp advancing education, digital skills, and entrepreneurship to promote long-term self-reliance.',
  },
  {
    id: 'opportunigee-uganda',
    name: 'Opportunigee Uganda',
    logo: '/images/logo-opportunigee.jpg',
    website: 'https://www.linkedin.com/company/opportunigee-hub/',
    description:
      'A refugee-founded social entrepreneurship hub in Nakivale providing mentorship, training, and incubation support for young entrepreneurs building community-based businesses.',
  },
  {
    id: 'vulnerable-ugandan-communities',
    name: 'Vulnerable Ugandan Communities',
    logo: '/images/logo-vuc.jpg',
    website: 'https://www.vuc-uganda.org',
    description:
      'A Ugandan nonprofit supporting marginalized populations through economic empowerment, education, healthcare access, advocacy, and broader community development initiatives.',
  },
];

const ROUND_RESULTS_PARTNER_LOOKUP = new Map<string, RoundResultsPartner>(
  ROUND_RESULTS_PARTNERS.map((partner) => [partner.id, partner]),
);

const ROUND_RESULTS_CAMPAIGN_BINDINGS_BASE: Array<
  Omit<RoundResultsCampaignBinding, 'partner'>
> = [
  {
    name: 'From Ideas to Income: SINA Loketa Entrepreneurship Program 2026 Cohort',
    partnerId: 'sina-loketa',
  },
  {
    name: 'Bridging the Digital Divide: Support Our Community Computer Lab',
    partnerId: 'refunite',
  },
  {
    name: 'Beyond the Camp: Equipping Refugee Talent for the Global Digital Economy',
    partnerId: 'action-for-refugee-life',
  },
  {
    name: 'Friends of Kaya Pool In Kwale Kenya',
    partnerId: 'grassroots-economics',
  },
  {
    name: 'Equipping Refugees Single mothers through tailoring and livelihood Skills',
    partnerId: 'refunite',
  },
  {
    name: 'Tayari Water Filter: Clean Water For Nakivale Refugee Settlement',
    partnerId: 'opportunigee-uganda',
  },
  {
    name: 'Strengthen The Women through the Establishment of a Community Hairdressing Salon',
    partnerId: 'refunite',
  },
  {
    name: 'Strengthen Mutual Aid in Dadaab Refugee Camp',
    partnerId: 'grassroots-economics',
  },
  {
    name: 'Strengthen Mutual Aid in Kalobeyei and Kakuma Refugee Camps',
    partnerId: 'grassroots-economics',
  },
  {
    name: 'Seeds of hope: Help us Empower Farmers and grow Community',
    partnerId: 'refunite',
  },
  {
    name: 'Turning waste to opportunities with affordable cooking fuel sources',
    partnerId: 'vulnerable-ugandan-communities',
  },
  {
    name: 'Early Childhood Education Center for Refugee Families in Kampala',
    partnerId: 'refunite',
  },
  {
    name: 'Building Futures: Support our Carpentry Training Projects',
    partnerId: 'refunite',
  },
  {
    name: 'One Day Training Programme: A Psychological Support For Sudanese Refugees',
    partnerId: 'refunite',
  },
  {
    name: 'Keeping Girls in School: Menstrual Hygiene Support in Kakuma Refugee Camp',
    partnerId: 'refunite',
  },
  {
    name: 'Friends of Kiriba Ecosystem',
    partnerId: 'grassroots-economics',
  },
  {
    name: 'Kakuma Care Project: Educating Orphans, Supporting Widows',
    partnerId: 'refunite',
  },
  {
    name: 'Creating Access to knowledge: the community Library Initiative',
    partnerId: 'refunite',
  },
  {
    name: 'Theatre for Transformation, Using Drama to Inspire Social Change in Kakuma',
    partnerId: 'refunite',
  },
  {
    name: 'Kakuma Stories: Building Refugee Filmmakers and Futures',
    partnerId: 'refunite',
  },
  {
    name: 'Support The Azande Sustainable Sandal Making Livelihood project',
    partnerId: 'refunite',
  },
  {
    name: 'Build The Future for Women and Girls through Skills Training and Gender-Based Violence Awareness',
    partnerId: 'refunite',
  },
  {
    name: 'Refugee Media Training: Building the Next Generation of Storytellers',
    partnerId: 'refunite',
  },
  {
    name: 'Kampala Injera Collective: Uplifting Ethiopian Refugee Women through Food Entrepreneurship',
    partnerId: 'refunite',
  },
];

export const ROUND_RESULTS_CAMPAIGN_BINDINGS: RoundResultsCampaignBinding[] =
  ROUND_RESULTS_CAMPAIGN_BINDINGS_BASE.map((binding) => ({
    ...binding,
    partner: ROUND_RESULTS_PARTNER_LOOKUP.get(binding.partnerId),
  }));
