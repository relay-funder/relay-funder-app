import { config } from 'dotenv';
import { PrismaClient } from '../.generated/prisma/client';
import { CampaignStatus } from '../types/campaign';
import shortUUID from 'short-uuid';
import { subDays, addDays } from 'date-fns';
import { notify } from '../lib/api/event-feed';
import {
  deployCampaignContract,
  deployAllContracts,
} from '../lib/seed/contract-deployment';
import { USER_FLAGS } from '../lib/constant/user-flags';
// Load environment variables
config({ path: '.env.local' });

// Check for dummy mode via environment variable or command line argument
const isDummyMode =
  process.env.SEED_DUMMY_MODE === 'true' || process.argv.includes('--dummy');

const db = new PrismaClient({
  log: ['error'],
});

// Deployment statistics tracking
interface DeploymentStats {
  totalCampaigns: number;
  successfulCampaignDeployments: number;
  successfulTreasuryDeployments: number;
  failedCampaignDeployments: number;
  failedTreasuryDeployments: number;
  errorsByType: Record<string, number>;
  errorDetails: Array<{
    campaignTitle: string;
    errorType: string;
    errorMessage: string;
  }>;
}

const deploymentStats: DeploymentStats = {
  totalCampaigns: 0,
  successfulCampaignDeployments: 0,
  successfulTreasuryDeployments: 0,
  failedCampaignDeployments: 0,
  failedTreasuryDeployments: 0,
  errorsByType: {},
  errorDetails: [],
};

function trackError(
  campaignTitle: string,
  errorType: string,
  errorMessage: string,
) {
  deploymentStats.errorsByType[errorType] =
    (deploymentStats.errorsByType[errorType] || 0) + 1;
  deploymentStats.errorDetails.push({
    campaignTitle,
    errorType,
    errorMessage,
  });
}
// NOTE: Campaign addresses removed - all campaigns start with null addresses for admin deployment testing

const campaignTitles = [
  // Education campaigns
  'Digital Learning Centers for Rural Kenya',
  'School Feeding Program in Kakuma',
  'Teacher Training Initiative - Uganda',
  'Girls Education Support in Kitgum',
  'Early Childhood Development - Nairobi Slums',
  'Community Library Project - Mombasa',
  'Adult Literacy Program - Turkana',
  'STEM Education for Girls - Kampala',
  'Vocational Training Center - Dadaab',
  'Educational Technology Access - Kibera',
  // Economic Development campaigns
  'Microfinance for Women Farmers - Kisumu',
  'Youth Entrepreneurship Hub - Kampala',
  'Cooperative Banking for Small Holders',
  'Mobile Money Access Points - Rural Kenya',
  'Artisan Craft Export Program - Mombasa',
  'Small Business Incubator - Nairobi',
  'Agricultural Value Chain Development',
  "Women's Cooperative Market Stalls",
  'Digital Payment Training Initiative',
  'Rural Tourism Development Project',
  // Climate Resilience campaigns
  'Solar Water Pumping Systems - Turkana',
  'Drought-Resistant Crops Training',
  'Reforestation Project - Mount Elgon',
  'Community Climate Adaptation - Karamoja',
  'Rainwater Harvesting Initiative',
  'Renewable Energy Microgrids - Rural Areas',
  'Climate-Smart Agriculture Training',
  'Sustainable Fishing Practices - Lake Victoria',
  'Green Building Materials Production',
  'Community-Based Conservation Program',
  // Emergency Response campaigns
  'Emergency Food Distribution - Dadaab',
  'Disaster Preparedness Training - Coastal Areas',
  'Emergency Medical Supplies - Refugee Camps',
  'Flood Response Equipment - Budalangi',
  'Drought Emergency Water Trucking',
  'Emergency Shelter Construction - Displaced Families',
  'Crisis Communication Networks',
  'Emergency Nutrition Program - Malnourished Children',
  'Rapid Response Medical Teams',
  'Emergency Education Continuity Program',
];

const locations = [
  'Nairobi, Kenya',
  'Kampala, Uganda',
  'Kakuma, Kenya',
  'Dadaab, Kenya',
  'Mombasa, Kenya',
  'Kisumu, Kenya',
  'Kitgum, Uganda',
  'Gulu, Uganda',
  'Turkana, Kenya',
  'Karamoja, Uganda',
  'Kibera, Kenya',
  'Bidi Bidi, Uganda',
  'Mount Elgon, Kenya',
  'Kigali, Rwanda',
  'Dar es Salaam, Tanzania',
  'Addis Ababa, Ethiopia',
  'Juba, South Sudan',
  'Mogadishu, Somalia',
];

// Helper function to generate slug from title
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 16); // Use more characters for better uniqueness
  const slug = `${baseSlug}-${shortUUID().generate()}`;
  return slug;
}
function selectRandom<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('to use selectRandom, provide a list of values');
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
// NOTE: randomHash function removed - no dummy transaction hashes needed
function randomAddress(): string {
  // Generate a random 40-character hexadecimal string
  const randomHexString = Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');

  // Prefix with '0x' to resemble an Ethereum address
  return '0x' + randomHexString;
}
async function createUsers(
  amount: number,
  roles: string[],
  featureFlags: string[] = [],
) {
  const userPromises = [];
  for (let i = 0; i < amount; i++) {
    userPromises.push(
      db.user.create({
        data: {
          address: randomAddress(),
          roles,
          featureFlags,
        },
      }),
    );
  }
  return await Promise.all(userPromises);
}

// Generate realistic grassroots funding goals ($200 - $2,000)
function generateFundingGoal(): string {
  const goals = [
    200, 300, 450, 500, 650, 750, 850, 1000, 1200, 1500, 1800, 2000,
  ];
  return selectRandom(goals).toString();
}

// Generate realistic campaign descriptions based on campaign type
function generateDescription(title: string): string {
  const isEducation =
    title.toLowerCase().includes('education') ||
    title.toLowerCase().includes('school') ||
    title.toLowerCase().includes('learning') ||
    title.toLowerCase().includes('teacher') ||
    title.toLowerCase().includes('child') ||
    title.toLowerCase().includes('library') ||
    title.toLowerCase().includes('literacy') ||
    title.toLowerCase().includes('stem') ||
    title.toLowerCase().includes('vocational') ||
    title.toLowerCase().includes('technology access');
  const isEconomic =
    title.toLowerCase().includes('microfinance') ||
    title.toLowerCase().includes('entrepreneur') ||
    title.toLowerCase().includes('cooperative') ||
    title.toLowerCase().includes('mobile money') ||
    title.toLowerCase().includes('artisan') ||
    title.toLowerCase().includes('business') ||
    title.toLowerCase().includes('agricultural value') ||
    title.toLowerCase().includes('market stalls') ||
    title.toLowerCase().includes('payment training') ||
    title.toLowerCase().includes('tourism');
  const isClimate =
    title.toLowerCase().includes('solar') ||
    title.toLowerCase().includes('drought') ||
    title.toLowerCase().includes('reforestation') ||
    title.toLowerCase().includes('climate') ||
    title.toLowerCase().includes('rainwater') ||
    title.toLowerCase().includes('renewable energy') ||
    title.toLowerCase().includes('agriculture training') ||
    title.toLowerCase().includes('fishing practices') ||
    title.toLowerCase().includes('green building') ||
    title.toLowerCase().includes('conservation');
  const isEmergency =
    title.toLowerCase().includes('emergency') ||
    title.toLowerCase().includes('disaster') ||
    title.toLowerCase().includes('flood response') ||
    title.toLowerCase().includes('shelter construction') ||
    title.toLowerCase().includes('crisis') ||
    title.toLowerCase().includes('rapid response');

  let descriptions: string[] = [];

  if (isEducation) {
    descriptions = [
      `${title} empowers communities through quality education access. We work with local schools and teachers to provide essential learning resources, digital technology, and nutritional support for students.`,
      `This initiative focuses on breaking the cycle of poverty through education. ${title} provides scholarships, school supplies, and infrastructure improvements to ensure every child has access to learning opportunities.`,
      `${title} addresses educational inequality by supporting rural and marginalized communities. Our approach includes teacher training, curriculum development, and creating safe learning environments for all children.`,
    ];
  } else if (isEconomic) {
    descriptions = [
      `${title} strengthens local economies through sustainable financial solutions. We provide training, resources, and market access to help communities build resilient economic foundations.`,
      `This economic empowerment initiative focuses on creating lasting change through entrepreneurship and financial inclusion. ${title} supports small businesses and cooperative development.`,
      `${title} builds economic opportunities for underserved communities. Our comprehensive approach includes skills training, microfinance, and market linkage support to promote sustainable livelihoods.`,
    ];
  } else if (isClimate) {
    descriptions = [
      `${title} helps communities adapt to climate change through sustainable solutions. We focus on renewable energy, water conservation, and climate-smart agriculture practices.`,
      `This climate resilience project addresses environmental challenges through community-based solutions. ${title} supports sustainable practices that protect both people and the planet.`,
      `${title} builds climate-adaptive capacity in vulnerable communities. Our integrated approach combines environmental restoration with livelihood support and disaster preparedness.`,
    ];
  } else if (isEmergency) {
    descriptions = [
      `${title} provides critical emergency response services to communities in crisis. Our rapid deployment approach ensures immediate relief while building long-term disaster preparedness and community resilience.`,
      `This emergency response initiative addresses urgent humanitarian needs through coordinated disaster relief efforts. ${title} focuses on life-saving interventions, emergency supplies, and crisis management systems.`,
      `${title} strengthens emergency response capacity in vulnerable communities. We provide essential emergency services, disaster preparedness training, and crisis communication networks to protect lives and livelihoods.`,
    ];
  } else {
    descriptions = [
      `${title} addresses urgent humanitarian needs through direct community support. Our integrated approach provides immediate relief while building long-term resilience and self-reliance.`,
      `This comprehensive aid program focuses on emergency response and recovery. ${title} works with local partners to deliver essential services and support community rebuilding efforts.`,
      `${title} provides vital assistance to vulnerable populations. We prioritize dignity, cultural sensitivity, and community participation in all our relief and development activities.`,
    ];
  }

  return selectRandom(descriptions);
}

// NOTE: Payment generation functions removed - campaigns start at zero balances
// Real IPFS images from Pinata - distributed across campaign categories
const remoteImageFiles = {
  education: [
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/kyle-glenn-nXt5HtLmlgE-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/elise-gaumier-NXGwIabbhSk-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/tobie-eniafe-7EZfQdvDAl8-unsplash.jpg',
    // Add more education variety from other categories
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/ffeeccde2afa88f6-UN0345662.jpg.jpeg',
  ],
  economic: [
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/emmanuel-appiah-dABvwWlKwOE-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/victor-birai-NVRywFR9CBw-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/mohnish-landge-6kqXbEdog60-unsplash.jpg',
    // Add more economic variety
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/derek-lamar-rr6jwU21VoE-unsplash.jpg',
  ],
  climate: [
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/salah-darwish-7RLkhT9awgk-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/salah-darwish-rfcUPkJfMIs-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/salah-darwish-su0rUMNakdA-unsplash.jpg',
    // Add more climate variety
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/ali-gundogdu-MEW55ogmEtU-unsplash.jpg',
  ],
  emergency: [
    // Emergency response images - using general and other suitable images
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/jabber-visuals-PlUQQyIMO8U-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/victor-birai-NVRywFR9CBw-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/kyle-glenn-nXt5HtLmlgE-unsplash.jpg',
  ],
  health: [
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/ffeeccde2afa88f6-UN0345662.jpg.jpeg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/ali-gundogdu-MEW55ogmEtU-unsplash.jpg',
  ],
  general: [
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/derek-lamar-rr6jwU21VoE-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/jabber-visuals-PlUQQyIMO8U-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/emmanuel-appiah-dABvwWlKwOE-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/tobie-eniafe-7EZfQdvDAl8-unsplash.jpg',
  ],
};

// Track used images to ensure uniqueness
const usedImages = new Set<string>();

// Function to select unique remote image based on campaign category
function selectUniqueCampaignImage(
  category: string,
  campaignIndex: number,
): string {
  let availableImages: string[] = [];

  switch (category) {
    case 'education':
      availableImages = [...remoteImageFiles.education];
      break;
    case 'economic-development':
      availableImages = [...remoteImageFiles.economic];
      break;
    case 'climate-resilience':
      availableImages = [...remoteImageFiles.climate];
      break;
    case 'emergency-response':
      availableImages = [...remoteImageFiles.emergency];
      break;
    default:
      availableImages = [...remoteImageFiles.general];
  }

  // Filter out already used images
  const unusedImages = availableImages.filter((img) => !usedImages.has(img));

  // If all category images are used, fall back to any unused image from all categories
  if (unusedImages.length === 0) {
    const allImages = [
      ...remoteImageFiles.education,
      ...remoteImageFiles.economic,
      ...remoteImageFiles.climate,
      ...remoteImageFiles.emergency,
      ...remoteImageFiles.health,
      ...remoteImageFiles.general,
    ];
    const allUnusedImages = allImages.filter((img) => !usedImages.has(img));

    if (allUnusedImages.length === 0) {
      // If all images are somehow used, reset and start over
      usedImages.clear();
      const selectedImage =
        availableImages[campaignIndex % availableImages.length];
      usedImages.add(selectedImage);
      return selectedImage;
    } else {
      const selectedImage = selectRandom(allUnusedImages);
      usedImages.add(selectedImage);
      return selectedImage;
    }
  } else {
    const selectedImage = selectRandom(unusedImages);
    usedImages.add(selectedImage);
    return selectedImage;
  }
}

// Legacy function for backward compatibility (now uses unique selection)
function selectCampaignImage(category: string): string {
  return selectUniqueCampaignImage(category, 0);
}

// Function to select appropriate category based on campaign index for even distribution
function selectCampaignCategory(campaignIndex: number): string {
  const categories = [
    'education',
    'economic-development',
    'climate-resilience',
    'emergency-response',
  ];
  return categories[campaignIndex % 4]; // Ensures even distribution across all 4 categories
}

async function main() {
  // Log dummy mode status
  if (isDummyMode) {
    console.log(
      'Running seed script in DUMMY MODE - no blockchain interactions will occur',
    );
    console.log(
      '   All contract addresses and transaction hashes will be simulated',
    );
  } else {
    console.log(
      'Running seed script in STAGING MODE - real blockchain interactions will occur',
    );
    console.log(
      '   Ensure all required environment variables are set for contract deployment',
    );

    // Set correct fee values to match kwr_flow_test.sh for proper treasury configuration
    process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS = '0'; // 0% platform fee
    process.env.NEXT_PUBLIC_VAKI_COMMISSION_BPS = '0'; // 0% VAKI commission
    process.env.NEXT_PUBLIC_LAUNCH_OFFSET_SEC = '30'; // 30 seconds for testing (vs 3600 default)
    console.log(
      '   Treasury fee configuration set: 0% platform fee, 0% VAKI commission',
    );
    console.log('   Launch offset set to 30 seconds for testing');
  }

  // Clear existing data
  try {
    await db.user.deleteMany();
    console.log('Cleared existing user data');
  } catch (error) {
    console.error('Failed to clear user data:', error);
    process.exit(1);
  }

  try {
    await db.campaign.deleteMany();
    console.log('Cleared existing campaign data');
  } catch (error) {
    console.error('Failed to clear campaign data:', error);
    process.exit(1);
  }

  try {
    await db.round.deleteMany();
    console.log('Cleared existing round data');
  } catch (error) {
    console.error('Failed to clear round data:', error);
    process.exit(1);
  }

  console.log('Creating predefined test users...');

  // Create specific test users with known addresses
  const protocolAdminUser = await db.user.create({
    data: {
      address: '0x7667Dd0a5D94736BEA1932Cf3441a4BA32A9BD70'.toLowerCase(),
      roles: ['user', 'admin'],
      featureFlags: USER_FLAGS as string[],
    },
  });
  console.log(`✅ Created protocol admin user: ${protocolAdminUser.address}`);

  const testCreatorUser = await db.user.create({
    data: {
      address: '0x9A562a11F7E014B32e2dB1E8d6bAF3C6f39Cc287'.toLowerCase(),
      roles: ['user'],
      featureFlags: [],
    },
  });
  console.log(`✅ Created test creator user: ${testCreatorUser.address}`);

  const testCreatorUser2 = await db.user.create({
    data: {
      address: '0xbAd15e99f9A94DbF931Ae788e10eA8350025b18a'.toLowerCase(),
      roles: ['user'],
      featureFlags: [],
    },
  });
  console.log(`✅ Created test creator user 2: ${testCreatorUser2.address}`);

  const testCreatorUser3 = await db.user.create({
    data: {
      address: '0x0ed2FD2bb8CEcc7159cA8B4DD26740E9Cebe5Aa1'.toLowerCase(),
      roles: ['user'],
      featureFlags: [],
    },
  });
  console.log(`✅ Created test creator user 3: ${testCreatorUser3.address}`);

  // Create additional users for variety (reduced numbers)
  const creatorUsers = await createUsers(15, ['user']);
  const donorUsers = await createUsers(15, ['user']);
  const adminUsers = await createUsers(
    1,
    ['user', 'admin'],
    USER_FLAGS as string[],
  );

  // Combine all users, with test users first for campaign assignment
  const allCreatorUsers = [testCreatorUser, testCreatorUser2, testCreatorUser3, ...creatorUsers];
  const allAdminUsers = [protocolAdminUser, ...adminUsers];

  // Create campaigns ordered by status: ACTIVE first, then PENDING_APPROVAL, then DRAFT
  // This ensures approved campaigns are created first for better testing
  const campaignStatuses = [
    ...Array(8).fill(CampaignStatus.ACTIVE), // 8 ACTIVE campaigns (approved)
    ...Array(2).fill(CampaignStatus.PENDING_APPROVAL), // 2 PENDING_APPROVAL campaigns
    ...Array(2).fill(CampaignStatus.DRAFT), // 2 DRAFT campaigns
  ];

  const campaigns = Array.from({ length: 12 }, (_, i) => {
    const title = campaignTitles[i % campaignTitles.length];
    const campaignStatus = campaignStatuses[i];

    // For ACTIVE campaigns, set startTime slightly in the future for treasury config, then we'll update it later
    const startTimeOffset =
      campaignStatus === CampaignStatus.ACTIVE
        ? 30
        : -Math.random() * 7 * 24 * 60 * 60 * 1000;

    return {
      id: 0,
      title,
      description: generateDescription(title),
      fundingGoal: generateFundingGoal(),
      startTime: new Date(Date.now() + startTimeOffset),
      endTime: new Date(
        Date.now() + (15 + Math.random() * 45) * 24 * 60 * 60 * 1000,
      ), // 15-60 days from now
      creatorAddress: '', // Will be set in the creation loop
      status: campaignStatus,
      slug: generateSlug(title),
      // No contract addresses - these will be deployed via admin tooling
      transactionHash: null,
      campaignAddress: null,
      treasuryAddress: null,
      category: selectCampaignCategory(i),
      location: locations[i % locations.length],
    };
  });
  // Create 5 rounds for matching - variety of statuses for comprehensive testing
  const rounds = [
    {
      title: 'Kenya Education & Development Round',
      description:
        'Supporting educational initiatives and community development projects across Kenya. This comprehensive matching round focuses on creating sustainable impact through quality education, economic empowerment, and essential infrastructure development. We believe that education is the cornerstone of lasting change, and our funding approach prioritizes projects that demonstrate measurable outcomes, community ownership, and innovative approaches to addressing educational gaps. From rural schools lacking basic resources to vocational training programs that equip youth with market-relevant skills, this round aims to transform communities by investing in their most valuable asset - human potential. Our selection criteria emphasize collaborative partnerships, environmental sustainability, and gender inclusivity to ensure that funded projects create ripple effects of positive change throughout Kenya.',
      descriptionUrl: 'https://relayfunder.com',
      matchingPool: 50000,
      startDate: subDays(new Date(), 5), // Started 5 days ago (active)
      endDate: addDays(new Date(), 25), // Ends in 25 days
      applicationStart: subDays(new Date(), 15),
      applicationClose: subDays(new Date(), 1),
      blockchain: 'CELO',
      managerAddress: selectRandom(adminUsers),
      fundWalletAddress: `0xround1matchingpool000000000000000000000000`,
    },
    {
      title: 'East Africa Climate Resilience Round',
      description:
        'Addressing urgent climate challenges across East Africa through innovative renewable energy solutions, comprehensive water conservation initiatives, and sustainable agriculture projects that enhance food security. This specialized funding round emphasizes community-led climate adaptation solutions that combine traditional knowledge with modern technology. We prioritize projects that demonstrate clear environmental impact, economic viability, and social equity. From solar-powered irrigation systems that transform arid landscapes into productive farmland to community-based forest restoration programs that sequester carbon while creating livelihoods, this round supports holistic approaches to climate resilience. Our funding strategy recognizes that climate adaptation requires long-term thinking, cross-sector collaboration, and deep community engagement to build truly sustainable solutions that can withstand future environmental challenges while improving current living conditions.',
      descriptionUrl: 'https://relayfunder.com',
      matchingPool: 75000,
      startDate: addDays(new Date(), 10), // Starts in 10 days (upcoming)
      endDate: addDays(new Date(), 40), // Ends in 40 days
      applicationStart: addDays(new Date(), 5),
      applicationClose: addDays(new Date(), 8),
      blockchain: 'CELO',
      managerAddress: selectRandom(adminUsers),
      fundWalletAddress: `0xround2matchingpool000000000000000000000000`,
    },
    {
      title: 'West Africa Climate Resilience Round',
      description:
        'Addressing urgent climate challenges across West Africa through innovative renewable energy solutions, comprehensive water conservation initiatives, and sustainable agriculture projects that enhance food security. This specialized funding round emphasizes community-led climate adaptation solutions that combine traditional knowledge with modern technology. We prioritize projects that demonstrate clear environmental impact, economic viability, and social equity. From solar-powered irrigation systems that transform arid landscapes into productive farmland to community-based forest restoration programs that sequester carbon while creating livelihoods, this round supports holistic approaches to climate resilience. Our funding strategy recognizes that climate adaptation requires long-term thinking, cross-sector collaboration, and deep community engagement to build truly sustainable solutions that can withstand future environmental challenges while improving current living conditions.',
      descriptionUrl: 'https://relayfunder.com',
      matchingPool: 75000,
      startDate: subDays(new Date(), 40), // Started 40 days ago (completed)
      endDate: subDays(new Date(), 10), // Ended 10 days ago
      applicationStart: subDays(new Date(), 50),
      applicationClose: subDays(new Date(), 45),
      blockchain: 'CELO',
      managerAddress: selectRandom(adminUsers),
      fundWalletAddress: `0xround3matchingpool000000000000000000000000`,
    },
    {
      title: 'Uganda Economic Development Round',
      description:
        'Empowering economic growth and entrepreneurship across Uganda through targeted funding for small business development, agricultural innovation, and financial inclusion initiatives. This round prioritizes projects that create sustainable livelihoods, support women and youth entrepreneurs, and strengthen local value chains. We focus on initiatives that demonstrate potential for scalability, community ownership, and measurable economic impact. From microfinance cooperatives that provide accessible credit to rural farmers, to digital payment platforms that connect remote communities to broader markets, this round invests in the economic infrastructure needed for long-term prosperity and poverty reduction.',
      descriptionUrl: 'https://relayfunder.com',
      matchingPool: 60000,
      startDate: addDays(new Date(), 20), // Starts in 20 days (upcoming)
      endDate: addDays(new Date(), 50), // Ends in 50 days
      applicationStart: addDays(new Date(), 15),
      applicationClose: addDays(new Date(), 18),
      blockchain: 'CELO',
      managerAddress: selectRandom(adminUsers),
      fundWalletAddress: `0xround4matchingpool000000000000000000000000`,
    },
    {
      title: 'Emergency Response Preparedness Round',
      description:
        'Building resilient emergency response systems across East Africa to protect communities from natural disasters, health crises, and humanitarian emergencies. This specialized round supports early warning systems, emergency supply chains, disaster preparedness training, and rapid response infrastructure. We prioritize projects that strengthen community resilience, improve emergency coordination, and ensure vulnerable populations have access to life-saving resources during crises. From mobile emergency communication networks to community-based disaster response teams, this round invests in the critical infrastructure needed to save lives and protect communities when emergencies strike.',
      descriptionUrl: 'https://relayfunder.com',
      matchingPool: 80000,
      startDate: subDays(new Date(), 15), // Started 15 days ago (active)
      endDate: addDays(new Date(), 15), // Ends in 15 days
      applicationStart: subDays(new Date(), 25),
      applicationClose: subDays(new Date(), 20),
      blockchain: 'CELO',
      managerAddress: selectRandom(adminUsers),
      fundWalletAddress: `0xround5matchingpool000000000000000000000000`,
    },
  ];

  // Create campaigns with automatic contract deployment based on status
  for (let i = 0; i < campaigns.length; i++) {
    // Assign specific campaigns to test creators, ensuring equal distribution
    let creator;
    if (i < 4) {
      creator = testCreatorUser; // First test creator owns first 4 campaigns (0,1,2,3)
      console.log(
        `   📝 Assigning campaign "${campaigns[i].title}" to test creator 1: ${testCreatorUser.address}`,
      );
    } else if (i < 8) {
      creator = testCreatorUser2; // Second test creator owns next 4 campaigns (4,5,6,7)
      console.log(
        `   📝 Assigning campaign "${campaigns[i].title}" to test creator 2: ${testCreatorUser2.address}`,
      );
    } else if (i < 12) {
      creator = testCreatorUser3; // Third test creator owns next 4 campaigns (8,9,10,11)
      console.log(
        `   📝 Assigning campaign "${campaigns[i].title}" to test creator 3: ${testCreatorUser3.address}`,
      );
    } else {
      creator = selectRandom(allCreatorUsers);
      console.log(
        `   📝 Assigning campaign "${campaigns[i].title}" to random creator: ${creator.address}`,
      );
    }

    const campaignData = {
      ...campaigns[i],
      id: undefined,
      creatorAddress: creator.address,
    };

    console.log(
      `\nCreating campaign ${i + 1}/${campaigns.length}: ${campaignData.title}`,
    );
    console.log(`   Status: ${campaignData.status}`);

    // Create campaign in database first
    const campaign = await db.campaign.create({
      data: campaignData,
    });
    campaigns[i].id = campaign.id;

    // Track total campaigns for statistics
    deploymentStats.totalCampaigns++;

    // Deploy contracts based on campaign status
    let campaignAddress: string | null = null;
    let treasuryAddress: string | null = null;
    let transactionHash: string | null = null;

    // Add delay between deployments to avoid nonce conflicts and RPC issues
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (campaignData.status === CampaignStatus.PENDING_APPROVAL) {
      // PENDING_APPROVAL campaigns should have campaign contract deployed
      console.log(`   Deploying campaign contract (status: PENDING_APPROVAL)`);
      const deployResult = await deployCampaignContract(
        {
          id: campaign.id,
          title: campaign.title,
          creatorAddress: campaign.creatorAddress,
          fundingGoal: campaign.fundingGoal,
          startTime: campaign.startTime,
          endTime: campaign.endTime,
        },
        isDummyMode,
      );

      if (deployResult.success) {
        campaignAddress = deployResult.campaignAddress;
        transactionHash = deployResult.transactionHash;
        deploymentStats.successfulCampaignDeployments++;
        console.log(`   Campaign contract deployed successfully`);
      } else {
        deploymentStats.failedCampaignDeployments++;
        const errorType = deployResult.errorType || 'UNKNOWN';
        trackError(campaignData.title, errorType, deployResult.error || '');
        console.log(
          `   Campaign contract deployment failed: ${deployResult.error}`,
        );
      }
    } else if (campaignData.status === CampaignStatus.ACTIVE) {
      // ACTIVE campaigns should have both contracts deployed
      console.log(`   Deploying both contracts (status: ACTIVE)`);

      const deployResult = await deployAllContracts(
        {
          id: campaign.id,
          title: campaign.title,
          creatorAddress: campaign.creatorAddress,
          fundingGoal: campaign.fundingGoal,
          startTime: campaign.startTime,
          endTime: campaign.endTime,
        },
        isDummyMode,
      );

      if (deployResult.campaignContract.success) {
        campaignAddress = deployResult.campaignContract.campaignAddress;
        transactionHash = deployResult.campaignContract.transactionHash;
        deploymentStats.successfulCampaignDeployments++;
        console.log(`   Campaign contract deployed successfully`);

        if (deployResult.treasuryContract?.success) {
          treasuryAddress = deployResult.treasuryContract.treasuryAddress;
          deploymentStats.successfulTreasuryDeployments++;
          console.log(
            `   Treasury contract deployed and configured successfully`,
          );

          // After successful treasury configuration, update campaign startTime to be in the past
          await db.campaign.update({
            where: { id: campaign.id },
            data: {
              startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Set to 1 day ago
            },
          });
          console.log(
            `   Updated campaign startTime to past for ACTIVE status`,
          );
        } else {
          deploymentStats.failedTreasuryDeployments++;
          const errorType =
            deployResult.treasuryContract?.errorType || 'UNKNOWN';
          trackError(
            `${campaignData.title} (Treasury)`,
            errorType,
            deployResult.treasuryContract?.error || '',
          );
          console.log(
            `   Treasury deployment failed: ${deployResult.treasuryContract?.error}`,
          );
        }
      } else {
        deploymentStats.failedCampaignDeployments++;
        const errorType = deployResult.campaignContract.errorType || 'UNKNOWN';
        trackError(
          campaignData.title,
          errorType,
          deployResult.campaignContract.error || '',
        );
        console.log(
          `   Campaign contract deployment failed: ${deployResult.campaignContract.error}`,
        );
      }
    } else {
      // DRAFT campaigns have no contracts deployed
      console.log(`   No contracts deployed (status: DRAFT)`);
    }

    // Update campaign with contract addresses
    await db.campaign.update({
      where: { id: campaign.id },
      data: {
        campaignAddress,
        treasuryAddress,
        transactionHash,
      },
    });

    console.log(`   Campaign saved with contract addresses`);

    // Assign remote IPFS image based on campaign type and link properly to campaign
    // Use unique selection for ACTIVE campaigns, regular selection for others
    const imageUrl =
      campaignData.status === CampaignStatus.ACTIVE
        ? selectUniqueCampaignImage(campaign.category || 'general', i)
        : selectCampaignImage(campaign.category || 'general');

    const media = await db.media.create({
      data: {
        url: imageUrl,
        mimeType: 'image/jpeg',
        state: 'UPLOADED',
        createdBy: {
          connect: { id: creator.id }, // Use the same creator as the campaign
        },
        campaign: { connect: { id: campaign.id } },
      },
    });

    const imageType =
      campaignData.status === CampaignStatus.ACTIVE ? 'unique' : 'shared';
    console.log(
      `   🖼️  Assigned ${imageType} image: ${imageUrl.split('/').pop()?.split('-')[0] || 'unknown'}`,
    );

    // Link the media to the campaign via mediaOrder (critical for display)
    await db.campaign.update({
      where: { id: campaign.id },
      data: {
        mediaOrder: [media.id],
      },
    });

    // Add campaign updates for realism (3-8 updates per campaign)
    const updateCount = Math.floor(Math.random() * 6) + 3; // 3-8 updates
    for (let updateIndex = 1; updateIndex <= updateCount; updateIndex++) {
      const updateTitles = [
        'Project Kickoff and Initial Planning',
        'Community Engagement Sessions Completed',
        'First Milestone Achievement',
        'Partnership Agreements Signed',
        'Equipment Procurement Update',
        'Training Program Launch',
        'Mid-Project Progress Report',
        'Community Impact Assessment',
        'Final Phase Implementation',
        'Project Completion and Next Steps',
      ];

      const updateContents = [
        `We've successfully launched ${campaign.title} and completed our initial planning phase. The community response has been overwhelmingly positive, and we're on track to meet our first milestone objectives.`,
        `Great progress this month! We've completed several community engagement sessions and gathered valuable feedback that will help us refine our approach. The local partnerships are proving invaluable.`,
        `Exciting news - we've reached our first major milestone ahead of schedule! This achievement demonstrates the strong community support and effective implementation strategies we've developed.`,
        `We've formalized key partnerships that will ensure the long-term sustainability of this project. These collaborations will provide ongoing support and resources for the community.`,
        `Equipment procurement is proceeding smoothly, and we expect delivery within the next two weeks. This will allow us to begin the hands-on implementation phase of the project.`,
        `Our training programs have officially launched with excellent participation rates. Community members are showing great enthusiasm and engagement in developing new skills.`,
        `We're halfway through the project timeline and making excellent progress on all fronts. The impact on the community is already becoming visible and measurable.`,
        `Recent assessments show significant positive impact in the target areas. We're documenting these outcomes to share with the broader community and inform future projects.`,
        `We're entering the final implementation phase with strong momentum. All major components are on track for completion within the planned timeframe.`,
        `Project completion is near! We're preparing comprehensive documentation and transition plans to ensure continued success after the formal project period ends.`,
      ];

      await db.campaignUpdate.create({
        data: {
          title: selectRandom(updateTitles),
          content: selectRandom(updateContents),
          creatorAddress: creator.address,
          createdAt: subDays(new Date(), Math.floor(Math.random() * 60) + 1), // Random date within last 60 days
          campaign: { connect: { id: campaign.id } },
        },
      });
    }

    // Add comments for engagement (2-15 comments per campaign)
    const commentCount = Math.floor(Math.random() * 14) + 2; // 2-15 comments
    const commenters = [...donorUsers, ...allCreatorUsers].slice(0, 20); // Use first 20 users as potential commenters

    for (let commentIndex = 0; commentIndex < commentCount; commentIndex++) {
      const commenter = selectRandom(commenters);
      const comments = [
        'This is such an important initiative! Thank you for making a real difference in the community.',
        "Amazing work! I've seen similar projects succeed and this one looks very promising.",
        'The transparency and regular updates are greatly appreciated. Keep up the excellent work!',
        'This project addresses a critical need in our region. Grateful for your dedication.',
        'Wonderful to see community-driven solutions like this. The impact will be lasting.',
        "The partnership approach you've taken is really smart. Collaboration is key to success.",
        'Looking forward to seeing the final results. This could be a model for other communities.',
        'The detailed planning and execution is impressive. Professional and impactful work.',
        'Thank you for prioritizing sustainability and long-term community benefit.',
        'This project fills a significant gap in available services. Much needed initiative.',
        'The community engagement aspect is particularly well done. Great approach.',
        'Excited to see the positive changes this will bring to the area.',
        "The regular communication and updates build confidence in the project's success.",
        "This type of grassroots initiative is exactly what's needed. Thank you!",
        'The measurable impact approach shows real commitment to accountability.',
      ];

      await db.comment.create({
        data: {
          content: selectRandom(comments),
          userAddress: commenter.address,
          createdAt: subDays(new Date(), Math.floor(Math.random() * 45) + 1), // Random date within last 45 days
          campaign: { connect: { id: campaign.id } },
        },
      });
    }

    // Add payments/transactions for campaigns to show funding progress
    // Add more payments for ACTIVE campaigns, some for PENDING_APPROVAL
    if (
      campaignData.status === CampaignStatus.ACTIVE ||
      (campaignData.status === CampaignStatus.PENDING_APPROVAL &&
        Math.random() < 0.6)
    ) {
      console.log(
        `\n💰 Adding payments to campaign "${campaign.title}" (${campaignData.status})`,
      );

      // Varied payment counts and amounts based on campaign index for realistic funding levels
      let basePaymentCount: number;
      let maxPaymentCount: number;
      let paymentAmounts: string[];

      if (campaignData.status === CampaignStatus.ACTIVE) {
        // Create 8 different funding scenarios for 8 ACTIVE campaigns (one per campaign)
        // Only campaigns 7 and 8 (i=6,7) will be over-funded
        switch (i) {
          case 0: // Campaign 1 - Early stage (15-25% of goal)
            basePaymentCount = 2;
            maxPaymentCount = 3;
            paymentAmounts = ['5', '10', '15', '20'];
            console.log(`   📊 Funding scenario: Early stage (15-25% of goal)`);
            break;
          case 1: // Campaign 2 - Getting started (25-35% of goal)
            basePaymentCount = 2;
            maxPaymentCount = 4;
            paymentAmounts = ['8', '12', '18', '25'];
            console.log(
              `   📊 Funding scenario: Getting started (25-35% of goal)`,
            );
            break;
          case 2: // Campaign 3 - Mid progress (40-55% of goal)
            basePaymentCount = 3;
            maxPaymentCount = 5;
            paymentAmounts = ['15', '25', '35', '45'];
            console.log(
              `   📊 Funding scenario: Mid progress (40-55% of goal)`,
            );
            break;
          case 3: // Campaign 4 - Good momentum (60-75% of goal)
            basePaymentCount = 4;
            maxPaymentCount = 6;
            paymentAmounts = ['20', '30', '40', '60'];
            console.log(
              `   📊 Funding scenario: Good momentum (60-75% of goal)`,
            );
            break;
          case 4: // Campaign 5 - Strong progress (70-85% of goal)
            basePaymentCount = 5;
            maxPaymentCount = 8;
            paymentAmounts = ['25', '40', '50', '75'];
            console.log(
              `   📊 Funding scenario: Strong progress (70-85% of goal)`,
            );
            break;
          case 5: // Campaign 6 - Nearly funded (85-95% of goal)
            basePaymentCount = 6;
            maxPaymentCount = 9;
            paymentAmounts = ['30', '50', '60', '80'];
            console.log(
              `   📊 Funding scenario: Nearly funded (85-95% of goal)`,
            );
            break;
          case 6: // Campaign 7 - Over-funded (105-120% of goal) - FIRST SUCCESS STORY
            basePaymentCount = 8;
            maxPaymentCount = 12;
            paymentAmounts = ['40', '60', '80', '100', '120'];
            console.log(
              `   📊 Funding scenario: Over-funded SUCCESS (105-120% of goal)`,
            );
            break;
          case 7: // Campaign 8 - Over-funded (110-130% of goal) - SECOND SUCCESS STORY
            basePaymentCount = 9;
            maxPaymentCount = 13;
            paymentAmounts = ['50', '75', '100', '125', '150'];
            console.log(
              `   📊 Funding scenario: Over-funded SUCCESS (110-130% of goal)`,
            );
            break;
          default:
            basePaymentCount = 5;
            maxPaymentCount = 10;
            paymentAmounts = ['25', '50', '75', '100'];
        }
      } else {
        // PENDING_APPROVAL campaigns get moderate funding
        basePaymentCount = 3;
        maxPaymentCount = 8;
        paymentAmounts = ['20', '35', '50', '75', '100'];
        console.log(
          `   📊 Funding scenario: PENDING_APPROVAL - moderate funding`,
        );
      }

      const paymentCount =
        Math.floor(Math.random() * (maxPaymentCount - basePaymentCount + 1)) +
        basePaymentCount;
      // Ensure test creators are always included as donors for cross-campaign donations
      const donors = [
        testCreatorUser,
        testCreatorUser2,
        ...donorUsers,
        ...allCreatorUsers,
      ].slice(0, 22); // Use more users as donors

      let totalCampaignAmount = 0;
      const createdPayments = [];

      for (let paymentIndex = 0; paymentIndex < paymentCount; paymentIndex++) {
        const donor = selectRandom(donors);

        // Payment amounts are set by funding scenario above
        const amount = selectRandom(paymentAmounts);
        totalCampaignAmount += parseInt(amount);

        // Generate realistic transaction hash for display (even though on-chain balance is 0)
        const mockTransactionHash = `0x${Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join('')}`;

        // Mix of payment providers
        const providers = ['stripe', 'coinbase', 'metamask', 'walletconnect'];
        const provider = selectRandom(providers);
        const isOnChain = provider !== 'stripe';

        const paymentData = {
          amount,
          token: 'USDC',
          status: 'confirmed',
          type: 'BUY' as const,
          transactionHash: isOnChain ? mockTransactionHash : null,
          isAnonymous: Math.random() < 0.15,
          createdAt: subDays(new Date(), Math.floor(Math.random() * 45) + 1),
          campaignId: campaign.id, // Explicitly set foreign key
          userId: donor.id,
          provider,
          metadata: {
            fundingBalance: amount,
            // Mark off-chain transactions for app visibility
            isOffChain: !isOnChain,
            isDummy: true,
            // Add mock blockchain data for on-chain transactions
            ...(isOnChain && {
              blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
              gasUsed: Math.floor(Math.random() * 50000) + 21000,
              gasPrice: Math.floor(Math.random() * 20) + 10,
              networkFee: (Math.random() * 0.01 + 0.001).toFixed(6),
              chainId: 42220, // Celo mainnet
              network: 'celo',
            }),
          },
        };

        try {
          const createdPayment = await db.payment.create({
            data: paymentData,
          });

          createdPayments.push(createdPayment);
        } catch (error) {
          console.error(
            `   ❌ Failed to create payment ${paymentIndex + 1}:`,
            error,
          );
          throw error; // Re-throw to stop seeding on payment creation failure
        }
      }

      console.log(
        `   ✅ Created ${createdPayments.length} payments totaling $${totalCampaignAmount}`,
      );

      // Verify payments are properly linked to campaign
      try {
        const campaignWithPayments = await db.campaign.findUnique({
          where: { id: campaign.id },
          include: {
            payments: {
              select: {
                id: true,
                amount: true,
                transactionHash: true,
                provider: true,
              },
            },
          },
        });

        if (campaignWithPayments?.payments.length !== paymentCount) {
          console.error(
            `   ⚠️  Payment count mismatch! Expected: ${paymentCount}, Found: ${campaignWithPayments?.payments.length || 0}`,
          );
        } else {
          console.log(
            `   ✅ Verified: Campaign ${campaign.id} has ${campaignWithPayments.payments.length} linked payments`,
          );
        }
      } catch (verificationError) {
        console.error(
          `   ❌ Failed to verify campaign payments:`,
          verificationError,
        );
      }
    } else {
      console.log(
        `   ⏭️  Skipping payments for campaign "${campaign.title}" (Status: ${campaignData.status})`,
      );
    }
  }

  // Add favorites for test creators so they have campaigns in their favorites list
  console.log('\n⭐ Adding favorites for test creators...');

  // Get all created campaigns
  const allCreatedCampaigns = await db.campaign.findMany({
    select: { id: true, title: true, creatorAddress: true },
  });

  // Test Creator 1 favorites: 3-4 campaigns they don't own
  const testCreator1Favorites = allCreatedCampaigns
    .filter((c) => c.creatorAddress !== testCreatorUser.address)
    .slice(0, 4);

  for (const campaign of testCreator1Favorites) {
    await db.favorite.create({
      data: {
        userAddress: testCreatorUser.address,
        campaignId: campaign.id,
      },
    });
    console.log(`   ⭐ Added favorite: "${campaign.title}" for test creator 1`);
  }

  // Test Creator 2 favorites: 3-4 different campaigns they don't own
  const testCreator2Favorites = allCreatedCampaigns
    .filter((c) => c.creatorAddress !== testCreatorUser2.address)
    .slice(2, 6); // Different selection than creator 1

  for (const campaign of testCreator2Favorites) {
    await db.favorite.create({
      data: {
        userAddress: testCreatorUser2.address,
        campaignId: campaign.id,
      },
    });
    console.log(`   ⭐ Added favorite: "${campaign.title}" for test creator 2`);
  }

  // Test Creator 3 favorites: 3-4 different campaigns they don't own
  const testCreator3Favorites = allCreatedCampaigns
    .filter((c) => c.creatorAddress !== testCreatorUser3.address)
    .slice(4, 8); // Different selection than creators 1 and 2

  for (const campaign of testCreator3Favorites) {
    await db.favorite.create({
      data: {
        userAddress: testCreatorUser3.address,
        campaignId: campaign.id,
      },
    });
    console.log(`   ⭐ Added favorite: "${campaign.title}" for test creator 3`);
  }

  console.log(
    `✅ Added ${testCreator1Favorites.length} favorites for test creator 1`,
  );
  console.log(
    `✅ Added ${testCreator2Favorites.length} favorites for test creator 2`,
  );
  console.log(
    `✅ Added ${testCreator3Favorites.length} favorites for test creator 3`,
  );

  // Add extra donations from test creators to campaigns they don't own
  // This ensures they appear in donor dashboards with donation history
  console.log('\n💸 Adding cross-donations from test creators...');

  const campaignsForDonations = allCreatedCampaigns.filter(
    (c) =>
      c.creatorAddress !== testCreatorUser.address &&
      c.creatorAddress !== testCreatorUser2.address,
  );

  // Test Creator 1 makes donations to 5 campaigns they don't own (increased for better dashboard data)
  const creator1DonationCampaigns = campaignsForDonations.slice(0, 5);
  for (const campaign of creator1DonationCampaigns) {
    const donationAmounts = ['25', '50', '75', '100', '150'];
    const amount = selectRandom(donationAmounts);

    await db.payment.create({
      data: {
        amount,
        token: 'USDC',
        status: 'confirmed',
        type: 'BUY',
        transactionHash: `0x${Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join('')}`,
        isAnonymous: false,
        createdAt: subDays(new Date(), Math.floor(Math.random() * 20) + 1),
        campaignId: campaign.id,
        userId: testCreatorUser.id,
        provider: 'metamask',
        metadata: {
          fundingBalance: amount,
          isDummy: true,
          blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
          chainId: 42220,
          network: 'celo',
        },
      },
    });
    console.log(
      `   💸 Test creator 1 donated $${amount} to "${campaign.title}"`,
    );
  }

  // Test Creator 2 makes donations to 3 different campaigns they don't own
  const creator2DonationCampaigns = campaignsForDonations.slice(1, 4);
  for (const campaign of creator2DonationCampaigns) {
    const donationAmounts = ['30', '60', '90', '120', '200'];
    const amount = selectRandom(donationAmounts);

    await db.payment.create({
      data: {
        amount,
        token: 'USDC',
        status: 'confirmed',
        type: 'BUY',
        transactionHash: `0x${Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join('')}`,
        isAnonymous: false,
        createdAt: subDays(new Date(), Math.floor(Math.random() * 25) + 1),
        campaignId: campaign.id,
        userId: testCreatorUser2.id,
        provider: 'coinbase',
        metadata: {
          fundingBalance: amount,
          isDummy: true,
          blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
          chainId: 42220,
          network: 'celo',
        },
      },
    });
    console.log(
      `   💸 Test creator 2 donated $${amount} to "${campaign.title}"`,
    );
  }

  // Test Creator 3 makes donations to 3 different campaigns they don't own
  const creator3DonationCampaigns = campaignsForDonations.slice(2, 5);
  for (const campaign of creator3DonationCampaigns) {
    const donationAmounts = ['40', '70', '100', '140', '180'];
    const amount = selectRandom(donationAmounts);

    await db.payment.create({
      data: {
        amount,
        token: 'USDC',
        status: 'confirmed',
        type: 'BUY',
        transactionHash: `0x${Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join('')}`,
        isAnonymous: false,
        createdAt: subDays(new Date(), Math.floor(Math.random() * 20) + 1),
        campaignId: campaign.id,
        userId: testCreatorUser3.id,
        provider: 'stripe',
        metadata: {
          fundingBalance: amount,
          isDummy: true,
          isOffChain: true,
        },
      },
    });
    console.log(
      `   💸 Test creator 3 donated $${amount} to "${campaign.title}"`,
    );
  }

  console.log(
    `✅ Test creator 1 made ${creator1DonationCampaigns.length} cross-donations`,
  );
  console.log(
    `✅ Test creator 2 made ${creator2DonationCampaigns.length} cross-donations`,
  );
  console.log(
    `✅ Test creator 3 made ${creator3DonationCampaigns.length} cross-donations`,
  );

  // Create EventFeed entries to simulate real user activity notifications
  console.log('\n📢 Creating event feed notifications...');

  // Get campaigns owned by test creators to ensure they get event feed data
  const testCreatorCampaigns = await db.campaign.findMany({
    where: {
      OR: [
        { creatorAddress: testCreatorUser.address },
        { creatorAddress: testCreatorUser2.address },
      ],
    },
    include: {
      payments: {
        take: 5, // Limit to 5 payments per campaign
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      },
      comments: {
        take: 3, // Limit to 3 comments per campaign
        orderBy: { createdAt: 'asc' },
      },
      updates: {
        take: 2, // Limit to 2 updates per campaign
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  // Get a few additional campaigns for variety (but limit total to prevent loops)
  const additionalCampaigns = await db.campaign.findMany({
    where: {
      AND: [
        { creatorAddress: { not: testCreatorUser.address } },
        { creatorAddress: { not: testCreatorUser2.address } },
      ],
    },
    take: 3, // Just 3 additional campaigns
    include: {
      payments: {
        take: 3, // Fewer payments for non-test campaigns
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      },
      comments: {
        take: 2, // Fewer comments for non-test campaigns
        orderBy: { createdAt: 'asc' },
      },
      updates: {
        take: 1, // Fewer updates for non-test campaigns
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  // Combine test creator campaigns with a few additional ones
  const allCampaignsWithDetails = [
    ...testCreatorCampaigns,
    ...additionalCampaigns,
  ];

  console.log(
    `   📊 Processing ${testCreatorCampaigns.length} test creator campaigns + ${additionalCampaigns.length} additional campaigns`,
  );
  console.log(
    `   👤 Test Creator 1 campaigns: ${testCreatorCampaigns
      .filter((c) => c.creatorAddress === testCreatorUser.address)
      .map((c) => `"${c.title}"`)
      .join(', ')}`,
  );
  console.log(
    `   👤 Test Creator 2 campaigns: ${testCreatorCampaigns
      .filter((c) => c.creatorAddress === testCreatorUser2.address)
      .map((c) => `"${c.title}"`)
      .join(', ')}`,
  );

  let eventCount = 0;
  const maxEventCount = 200; // Increased limit to ensure comprehensive event feed data

  // Create payment notifications
  for (const campaign of allCampaignsWithDetails) {
    if (eventCount >= maxEventCount) {
      console.log(
        `   ⚠️ Reached maximum event count (${maxEventCount}), stopping...`,
      );
      break;
    }

    const creator = await db.user.findUnique({
      where: { address: campaign.creatorAddress },
    });
    if (!creator) continue;

    // Payment notifications - donors notify campaign creators (limited)
    for (const payment of campaign.payments.slice(0, 5)) {
      // Max 5 payments per campaign
      if (payment.userId === creator.id) continue; // Skip self-donations
      if (eventCount >= maxEventCount) break;

      const donorName =
        payment.user.username ||
        payment.user.firstName ||
        payment.user.address?.slice(0, 8) ||
        'Anonymous';

      await notify({
        receiverId: creator.id,
        creatorId: payment.userId,
        data: {
          type: 'CampaignPayment',
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          paymentId: payment.id,
          formattedAmount: `$${payment.amount}`,
          donorName,
        },
      });
      eventCount++;
    }

    // Comment notifications - commenters notify campaign creators (limited)
    for (const comment of campaign.comments.slice(0, 3)) {
      // Max 3 comments per campaign
      if (eventCount >= maxEventCount) break;

      const commenter = await db.user.findUnique({
        where: { address: comment.userAddress },
      });
      if (!commenter || commenter.id === creator.id) continue; // Skip self-comments

      const commenterName =
        commenter.username ||
        commenter.firstName ||
        commenter.address?.slice(0, 8) ||
        'Anonymous';

      await notify({
        receiverId: creator.id,
        creatorId: commenter.id,
        data: {
          type: 'CampaignComment',
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          action: 'posted' as const,
          userName: commenterName,
          comment: comment.content.slice(0, 100), // First 100 chars
        },
      });
      eventCount++;
    }

    // Update notifications - creators notify their donors/commenters (limited)
    for (const update of campaign.updates.slice(0, 2)) {
      // Max 2 updates per campaign
      if (eventCount >= maxEventCount) break;

      // Limit to first 5 interacted users to prevent explosion
      const interactedUsers = new Set<number>();

      campaign.payments
        .slice(0, 5)
        .forEach((p) => interactedUsers.add(p.userId));

      // Remove the creator from the notification list
      interactedUsers.delete(creator.id);

      // Limit to max 5 users per update
      const limitedUsers = Array.from(interactedUsers).slice(0, 5);

      for (const userId of limitedUsers) {
        if (eventCount >= maxEventCount) break;

        await notify({
          receiverId: userId,
          creatorId: creator.id,
          data: {
            type: 'CampaignUpdate',
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            updateText: update.content.slice(0, 100), // First 100 chars
          },
        });
        eventCount++;
      }
    }

    // Campaign approval notifications - admin notifies creators for ACTIVE campaigns
    if (campaign.status === 'ACTIVE' && eventCount < maxEventCount) {
      const adminUser = protocolAdminUser; // Use our protocol admin

      await notify({
        receiverId: creator.id,
        creatorId: adminUser.id,
        data: {
          type: 'CampaignApprove',
          campaignId: campaign.id,
          campaignTitle: campaign.title,
        },
      });
      eventCount++;
    }
  }

  console.log(`✅ Created ${eventCount} event feed notifications`);

  // Define specific sponsor logos for each round
  const roundSponsorLogos = [
    {
      // Kenya Education & Development Round - Ethereum Main logo
      url: 'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeiahqmv44vmm4oorfi7q565xfnwpadtjcvki2mszo4qqchaazqqvim/345351662ea35292-ethereum-main.jpg',
      mimeType: 'image/jpeg',
      caption: 'Ethereum Foundation Sponsor Logo',
    },
    {
      // East Africa Climate Resilience Round - Celo Camp logo
      url: 'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeiahqmv44vmm4oorfi7q565xfnwpadtjcvki2mszo4qqchaazqqvim/a41bb1ae87c99ce0-celo-camp.webp',
      mimeType: 'image/webp',
      caption: 'Celo Camp Sponsor Logo',
    },
    {
      // West Africa Climate Resilience Round - Celo Camp logo
      url: 'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeiahqmv44vmm4oorfi7q565xfnwpadtjcvki2mszo4qqchaazqqvim/a41bb1ae87c99ce0-celo-camp.webp',
      mimeType: 'image/webp',
      caption: 'Celo Camp Sponsor Logo',
    },
    {
      // Uganda Economic Development Round - Ethereum Main logo
      url: 'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeiahqmv44vmm4oorfi7q565xfnwpadtjcvki2mszo4qqchaazqqvim/345351662ea35292-ethereum-main.jpg',
      mimeType: 'image/jpeg',
      caption: 'Ethereum Foundation Sponsor Logo',
    },
    {
      // Emergency Response Preparedness Round - Celo Camp logo
      url: 'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeiahqmv44vmm4oorfi7q565xfnwpadtjcvki2mszo4qqchaazqqvim/a41bb1ae87c99ce0-celo-camp.webp',
      mimeType: 'image/webp',
      caption: 'Celo Camp Sponsor Logo',
    },
  ];

  // Create the 5 rounds and assign campaigns strategically
  for (let i = 0; i < rounds.length; i++) {
    const admin = selectRandom(allAdminUsers);
    const round = await db.round.create({
      data: { ...rounds[i], managerAddress: admin.address },
    });

    // Assign campaigns to rounds based on their category
    let assignedCampaigns = [];

    if (i === 0) {
      // Kenya Education & Development Round - assign education campaigns
      assignedCampaigns = campaigns
        .filter((c) => c.category === 'education')
        .slice(0, 3); // First 3 education campaigns
    } else if (i === 1) {
      // East Africa Climate Resilience Round - assign climate resilience campaigns
      assignedCampaigns = campaigns
        .filter((c) => c.category === 'climate-resilience')
        .slice(0, 3); // First 3 climate campaigns
    } else if (i === 2) {
      // West Africa Climate Resilience Round - assign more climate resilience campaigns
      assignedCampaigns = campaigns
        .filter((c) => c.category === 'climate-resilience')
        .slice(1, 3); // Some climate campaigns (overlap with previous round)
    } else if (i === 3) {
      // Uganda Economic Development Round - assign economic development campaigns
      assignedCampaigns = campaigns
        .filter((c) => c.category === 'economic-development')
        .slice(0, 3); // First 3 economic campaigns
    } else {
      // Emergency Response Preparedness Round - assign emergency response campaigns
      assignedCampaigns = campaigns
        .filter((c) => c.category === 'emergency-response')
        .slice(0, 3); // First 3 emergency campaigns
    }

    // Create round-campaign associations
    for (const campaign of assignedCampaigns) {
      await db.roundCampaigns.create({
        data: {
          Round: { connect: { id: round.id } },
          Campaign: { connect: { id: campaign.id } },
          status: selectRandom(['APPROVED', 'APPROVED', 'PENDING', 'APPROVED']), // Mostly approved for testing
        },
      });
    }

    // Add specific sponsor logo for each round
    const sponsorLogo = roundSponsorLogos[i];
    const roundMedia = await db.media.create({
      data: {
        url: sponsorLogo.url,
        mimeType: sponsorLogo.mimeType,
        caption: sponsorLogo.caption,
        state: 'UPLOADED',
        createdBy: {
          connect: { id: admin.id },
        },
        round: { connect: { id: round.id } },
      },
    });

    // Link the media to the round via mediaOrder
    await db.round.update({
      where: { id: round.id },
      data: {
        mediaOrder: [roundMedia.id],
      },
    });
  }

  console.log(
    `\nSeeded ${campaigns.length} campaigns with enhanced data, ${rounds.length} matching rounds with specific sponsor logos`,
  );
  console.log(
    'Enhanced seed data includes: campaign updates (3-8 per campaign), comments (2-15 per campaign), funding progress, and event feed notifications',
  );
  console.log(
    'Campaign categories: ALL 4 categories distributed - Education, Economic Development, Climate Resilience, Emergency Response',
  );
  console.log(
    `Campaign statuses: 8 ACTIVE campaigns (2 per category), 2 PENDING_APPROVAL, 2 DRAFT`,
  );
  console.log(
    'Enhanced transactions: 8-22 payments per ACTIVE campaign with mock transaction hashes and varied providers',
  );
  console.log(
    'All campaigns maintain zero on-chain balance but show funding progress via payment metadata',
  );

  // Final verification: Query and log all created campaigns with their transactions
  console.log('\n=== FINAL VERIFICATION: CAMPAIGNS WITH TRANSACTIONS ===');

  try {
    const campaignsWithTransactions = await db.campaign.findMany({
      include: {
        payments: {
          select: {
            id: true,
            amount: true,
            transactionHash: true,
            provider: true,
            status: true,
            createdAt: true,
            metadata: true,
          },
        },
        _count: {
          select: {
            payments: true,
            comments: true,
            updates: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { id: 'asc' }],
    });

    console.log(
      `📊 Total campaigns created: ${campaignsWithTransactions.length}`,
    );

    // Group by status for summary
    const statusGroups = campaignsWithTransactions.reduce(
      (acc, campaign) => {
        const status = campaign.status;
        if (!acc[status]) acc[status] = [];
        acc[status].push(campaign);
        return acc;
      },
      {} as Record<string, typeof campaignsWithTransactions>,
    );

    Object.entries(statusGroups).forEach(([status, campaigns]) => {
      const totalPayments = campaigns.reduce(
        (sum, c) => sum + c._count.payments,
        0,
      );
      const totalAmount = campaigns.reduce(
        (sum, c) =>
          sum + c.payments.reduce((pSum, p) => pSum + parseInt(p.amount), 0),
        0,
      );

      console.log(`\n📋 ${status} Campaigns: ${campaigns.length}`);
      console.log(
        `   💰 Total payments: ${totalPayments}, Total amount: $${totalAmount}`,
      );

      campaigns.forEach((campaign) => {
        const paymentSummary =
          campaign.payments.length > 0
            ? `${campaign.payments.length} payments ($${campaign.payments.reduce((sum, p) => sum + parseInt(p.amount), 0)})`
            : 'No payments';

        console.log(
          `   📝 ID ${campaign.id}: "${campaign.title}" (${campaign.category})`,
        );
        console.log(
          `      💳 ${paymentSummary} | 💬 ${campaign._count.comments} comments | 📢 ${campaign._count.updates} updates`,
        );

        // Log transaction hashes for campaigns with payments
        if (campaign.payments.length > 0) {
          const onChainTxs = campaign.payments.filter(
            (p) => p.transactionHash,
          ).length;
          const offChainTxs = campaign.payments.filter(
            (p) => !p.transactionHash,
          ).length;
          console.log(
            `      🔗 Transactions: ${onChainTxs} on-chain, ${offChainTxs} off-chain`,
          );

          // Show first few transaction hashes as examples
          const exampleTxs = campaign.payments.slice(0, 3);
          exampleTxs.forEach((payment) => {
            const txHash = payment.transactionHash
              ? payment.transactionHash.substring(0, 10) + '...'
              : 'off-chain';
            console.log(
              `         • $${payment.amount} via ${payment.provider} (${txHash})`,
            );
          });
        }
      });
    });

    // Verify category distribution
    const categoryDistribution = campaignsWithTransactions.reduce(
      (acc, campaign) => {
        const category = campaign.category || 'unknown';
        if (!acc[category])
          acc[category] = { total: 0, active: 0, withPayments: 0 };
        acc[category].total++;
        if (campaign.status === 'ACTIVE') acc[category].active++;
        if (campaign.payments.length > 0) acc[category].withPayments++;
        return acc;
      },
      {} as Record<
        string,
        { total: number; active: number; withPayments: number }
      >,
    );

    console.log('\n📊 Category Distribution:');
    Object.entries(categoryDistribution).forEach(([category, stats]) => {
      console.log(
        `   ${category}: ${stats.total} total (${stats.active} active, ${stats.withPayments} with payments)`,
      );
    });

    console.log('\n✅ Verification completed successfully!');

    // Show media assignments
    console.log('\n📸 Media Assignment Summary:');
    const campaignsWithMedia = await db.campaign.findMany({
      include: {
        media: {
          select: { url: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    const activeCampaigns = campaignsWithMedia.filter(
      (c) => c.status === 'ACTIVE',
    );
    const otherCampaigns = campaignsWithMedia.filter(
      (c) => c.status !== 'ACTIVE',
    );

    console.log('   📷 ACTIVE Campaigns (unique images):');
    activeCampaigns.forEach((campaign) => {
      const imageFileName =
        campaign.media[0]?.url.split('/').pop()?.split('-')[0] || 'no-image';
      console.log(
        `      Campaign ${campaign.id}: "${campaign.title}" → ${imageFileName}`,
      );
    });

    console.log('   📷 Other Campaigns (shared images allowed):');
    otherCampaigns.forEach((campaign) => {
      const imageFileName =
        campaign.media[0]?.url.split('/').pop()?.split('-')[0] || 'no-image';
      console.log(
        `      Campaign ${campaign.id}: "${campaign.title}" → ${imageFileName}`,
      );
    });

    console.log(`\n🎨 Unique images for ACTIVE campaigns: ${usedImages.size}`);
    console.log('✅ All ACTIVE campaigns have unique media assignments!');
  } catch (verificationError) {
    console.error('❌ Final verification failed:', verificationError);
  }

  // Comprehensive deployment report
  console.log('\n=== DEPLOYMENT REPORT ===');
  console.log(`Mode: ${isDummyMode ? 'DUMMY MODE' : 'STAGING MODE'}`);
  console.log(`Total Campaigns: ${deploymentStats.totalCampaigns}`);

  if (!isDummyMode) {
    // Only show deployment statistics for real blockchain interactions
    const totalAttemptedDeployments =
      deploymentStats.successfulCampaignDeployments +
      deploymentStats.failedCampaignDeployments;
    const totalAttemptedTreasuryDeployments =
      deploymentStats.successfulTreasuryDeployments +
      deploymentStats.failedTreasuryDeployments;

    console.log(`\nContract Deployment Results:`);
    console.log(
      `  Campaign Contracts: ${deploymentStats.successfulCampaignDeployments}/${totalAttemptedDeployments} successful`,
    );
    if (totalAttemptedTreasuryDeployments > 0) {
      console.log(
        `  Treasury Contracts: ${deploymentStats.successfulTreasuryDeployments}/${totalAttemptedTreasuryDeployments} successful`,
      );
    }

    // Error analysis and recommendations
    if (Object.keys(deploymentStats.errorsByType).length > 0) {
      console.log(`\nErrors Encountered:`);
      Object.entries(deploymentStats.errorsByType).forEach(
        ([errorType, count]) => {
          console.log(`  ${errorType}: ${count} occurrences`);
        },
      );

      console.log(`\nRecommendations:`);

      if (deploymentStats.errorsByType.INSUFFICIENT_FUNDS) {
        console.log(
          `  - INSUFFICIENT_FUNDS (${deploymentStats.errorsByType.INSUFFICIENT_FUNDS} errors):`,
        );
        console.log(`    * Add more funds to your platform admin wallet`);
        console.log(
          `    * Required: ~0.023 CELO per transaction (you need CELO tokens, not ETH)`,
        );
        console.log(
          `    * Current balance appears insufficient for deployment costs`,
        );
        console.log(
          `    * For testnet: Use https://faucet.celo.org/ to get free CELO`,
        );
        console.log(
          `    * For mainnet: Buy CELO on Coinbase, Binance, or other exchanges`,
        );
      }

      if (deploymentStats.errorsByType.GAS_LIMIT) {
        console.log(
          `  - GAS_LIMIT (${deploymentStats.errorsByType.GAS_LIMIT} errors):`,
        );
        console.log(
          `    * Increase gas limit in your deployment configuration`,
        );
        console.log(
          `    * Check if the network is congested and try again later`,
        );
      }

      if (deploymentStats.errorsByType.NETWORK_ERROR) {
        console.log(
          `  - NETWORK_ERROR (${deploymentStats.errorsByType.NETWORK_ERROR} errors):`,
        );
        console.log(`    * Check your internet connection and RPC endpoint`);
        console.log(
          `    * Verify the RPC URL in your environment configuration`,
        );
        console.log(
          `    * Consider using a different RPC provider if issues persist`,
        );
      }

      if (deploymentStats.errorsByType.CONTRACT_ERROR) {
        console.log(
          `  - CONTRACT_ERROR (${deploymentStats.errorsByType.CONTRACT_ERROR} errors):`,
        );
        console.log(`    * Review contract parameters and blockchain state`);
        console.log(`    * Ensure factory contracts are properly deployed`);
        console.log(`    * Verify platform configuration parameters`);
      }

      console.log(`\nFailed Deployments Details:`);
      deploymentStats.errorDetails.slice(0, 5).forEach((detail) => {
        console.log(`  - ${detail.campaignTitle}: ${detail.errorType}`);
      });
      if (deploymentStats.errorDetails.length > 5) {
        console.log(
          `  ... and ${deploymentStats.errorDetails.length - 5} more`,
        );
      }
    }

    // Success rate calculation
    const successRate =
      totalAttemptedDeployments > 0
        ? Math.round(
            (deploymentStats.successfulCampaignDeployments /
              totalAttemptedDeployments) *
              100,
          )
        : 0;

    if (successRate === 100) {
      console.log(`\n✅ SUCCESS: All deployments completed successfully!`);
    } else if (successRate >= 50) {
      console.log(`\n⚠️  PARTIAL SUCCESS: ${successRate}% success rate`);
      console.log(
        `   Most deployments succeeded, but some issues encountered.`,
      );
    } else if (successRate > 0) {
      console.log(`\n❌ MAJOR ISSUES: Only ${successRate}% success rate`);
      console.log(
        `   Significant deployment problems detected. Review recommendations above.`,
      );
    } else {
      console.log(`\n❌ COMPLETE FAILURE: No deployments succeeded`);
      console.log(
        `   All deployment attempts failed. Check wallet funds and network connectivity.`,
      );
    }
  } else {
    console.log(
      '\nDUMMY MODE: All contract addresses and transaction hashes are simulated',
    );
    console.log(
      '   To run with real blockchain interactions, use: pnpm dev:db:seed (without --dummy flag)',
    );
  }

  console.log(`\nContract deployment status:`);
  console.log(
    '   - DRAFT campaigns: No contracts deployed (use admin tooling)',
  );
  console.log(
    `   - PENDING_APPROVAL campaigns: Campaign contracts deployed ${isDummyMode ? '(simulated)' : 'automatically'}`,
  );
  console.log(
    `   - ACTIVE campaigns: Both campaign and treasury contracts deployed ${isDummyMode ? '(simulated)' : 'automatically'}`,
  );

  if (isDummyMode) {
    console.log(
      '\nUse the dummy-web3 connector to sign in as one of these users:',
    );
    console.log(`🔑 Protocol Admin: ${protocolAdminUser.address}`);
    console.log(
      `👤 Test Creator 1: ${testCreatorUser.address} (owns campaigns 1-4)`,
    );
    console.log(
      `👤 Test Creator 2: ${testCreatorUser2.address} (owns campaigns 5-8)`,
    );
    console.log(
      `👤 Test Creator 3: ${testCreatorUser3.address} (owns campaigns 9-12)`,
    );
    allAdminUsers
      .slice(1)
      .map(({ address }) => console.log(`admin ${address}`));
    allCreatorUsers
      .slice(2, 5)
      .map(({ address }) => console.log(`creator ${address}`));
    donorUsers
      .slice(0, 3)
      .map(({ address }) => console.log(`donor ${address}`));
  } else {
    console.log('\n=== VERIFICATION: Test Creator Data ===');
    console.log(`Verifying test creator 1 (${testCreatorUser.address}):`);

    // Verify campaigns owned by test creator 1
    const creator1Campaigns = await db.campaign.findMany({
      where: { creatorAddress: testCreatorUser.address },
      select: { id: true, title: true, status: true },
    });
    console.log(`  📋 Owns ${creator1Campaigns.length} campaigns:`);
    creator1Campaigns.forEach((c) =>
      console.log(`     • ID ${c.id}: "${c.title}" (${c.status})`),
    );

    // Verify donations made by test creator 1
    const creator1Donations = await db.payment.findMany({
      where: {
        userId: testCreatorUser.id,
        status: 'confirmed',
        type: 'BUY',
      },
      include: { campaign: { select: { title: true } } },
    });
    console.log(`  💸 Made ${creator1Donations.length} donations:`);
    creator1Donations.forEach((d) =>
      console.log(`     • $${d.amount} to "${d.campaign.title}"`),
    );

    // Verify favorites by test creator 1
    const creator1Favorites = await db.favorite.findMany({
      where: { userAddress: testCreatorUser.address },
      include: { campaign: { select: { title: true } } },
    });
    console.log(`  ⭐ Has ${creator1Favorites.length} favorites:`);
    creator1Favorites.forEach((f) =>
      console.log(`     • "${f.campaign.title}"`),
    );

    console.log(`\nVerifying test creator 2 (${testCreatorUser2.address}):`);

    // Verify campaigns owned by test creator 2
    const creator2Campaigns = await db.campaign.findMany({
      where: { creatorAddress: testCreatorUser2.address },
      select: { id: true, title: true, status: true },
    });
    console.log(`  📋 Owns ${creator2Campaigns.length} campaigns:`);
    creator2Campaigns.forEach((c) =>
      console.log(`     • ID ${c.id}: "${c.title}" (${c.status})`),
    );

    // Verify donations made by test creator 2
    const creator2Donations = await db.payment.findMany({
      where: {
        userId: testCreatorUser2.id,
        status: 'confirmed',
        type: 'BUY',
      },
      include: { campaign: { select: { title: true } } },
    });
    console.log(`  💸 Made ${creator2Donations.length} donations:`);
    creator2Donations.forEach((d) =>
      console.log(`     • $${d.amount} to "${d.campaign.title}"`),
    );

    // Verify favorites by test creator 2
    const creator2Favorites = await db.favorite.findMany({
      where: { userAddress: testCreatorUser2.address },
      include: { campaign: { select: { title: true } } },
    });
    console.log(`  ⭐ Has ${creator2Favorites.length} favorites:`);
    creator2Favorites.forEach((f) =>
      console.log(`     • "${f.campaign.title}"`),
    );

    console.log(`✅ Verification completed!\n`);

    console.log('🔍 AUTHENTICATION DEBUG INFO:');
    console.log('When logging in with test creator wallets, ensure:');
    console.log('1. Wallet address matches EXACTLY (case-sensitive):');
    console.log(`   • Test Creator 1: ${testCreatorUser.address}`);
    console.log(`   • Test Creator 2: ${testCreatorUser2.address}`);
    console.log(`   • Test Creator 3: ${testCreatorUser3.address}`);
    console.log('2. User must exist in database with correct address');
    console.log('3. API calls use session.user.address for filtering');
    console.log('4. Campaign ownership uses creatorAddress field');
    console.log('5. Donations use userId (foreign key to User.id)');
    console.log('6. Favorites use userAddress (string field)');
    console.log('');

    console.log('Created users for testing:');
    console.log(`🔑 Protocol Admin: ${protocolAdminUser.address}`);
    console.log(
      `👤 Test Creator 1: ${testCreatorUser.address} (owns campaigns 1-4)`,
    );
    console.log(
      `👤 Test Creator 2: ${testCreatorUser2.address} (owns campaigns 5-8)`,
    );
    console.log(
      `👤 Test Creator 3: ${testCreatorUser3.address} (owns campaigns 9-12)`,
    );
    console.log(`  ${allAdminUsers.length} total admin users`);
    console.log(`  ${allCreatorUsers.length} total creator users`);
    console.log(`  ${donorUsers.length} donor users`);
    console.log(
      '  Use real wallet connections or authentication for these users',
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
