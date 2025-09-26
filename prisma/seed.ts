import { config } from 'dotenv';
import { PrismaClient } from '../.generated/prisma/client';
import { CampaignStatus } from '../types/campaign';
import shortUUID from 'short-uuid';
import { subDays, addDays } from 'date-fns';
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
  ],
  economic: [
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/emmanuel-appiah-dABvwWlKwOE-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/victor-birai-NVRywFR9CBw-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/mohnish-landge-6kqXbEdog60-unsplash.jpg',
  ],
  climate: [
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/salah-darwish-7RLkhT9awgk-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/salah-darwish-rfcUPkJfMIs-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/salah-darwish-su0rUMNakdA-unsplash.jpg',
  ],
  health: [
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/ffeeccde2afa88f6-UN0345662.jpg.jpeg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/ali-gundogdu-MEW55ogmEtU-unsplash.jpg',
  ],
  general: [
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/derek-lamar-rr6jwU21VoE-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/jabber-visuals-PlUQQyIMO8U-unsplash.jpg',
    // Extra images for rounds and fallback
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/emmanuel-appiah-dABvwWlKwOE-unsplash.jpg',
    'https://amethyst-kind-cheetah-202.mypinata.cloud/ipfs/bafybeie3birywzrgrp2xlhgm7s5bhq7kqphfhcv5deop25p7fepoms2cje/tobie-eniafe-7EZfQdvDAl8-unsplash.jpg',
  ],
};

// Function to select appropriate remote image based on campaign title/type
function selectCampaignImage(title: string): string {
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

  if (isEducation && remoteImageFiles.education.length > 0) {
    return selectRandom(remoteImageFiles.education);
  } else if (isEconomic && remoteImageFiles.economic.length > 0) {
    return selectRandom(remoteImageFiles.economic);
  } else if (isClimate && remoteImageFiles.climate.length > 0) {
    return selectRandom(remoteImageFiles.climate);
  } else if (isEmergency && remoteImageFiles.general.length > 0) {
    // Use general images for emergency response campaigns
    return selectRandom(remoteImageFiles.general);
  } else {
    return selectRandom(remoteImageFiles.general);
  }
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
  }

  // Clear existing data
  await db.user.deleteMany();
  await db.campaign.deleteMany();
  await db.round.deleteMany();
  // Create 25 users instead of 100 (more realistic for debugging)
  const creatorUsers = await createUsers(25, ['user']);
  const donorUsers = await createUsers(25, ['user']);
  const adminUsers = await createUsers(
    2,
    ['user', 'admin'],
    USER_FLAGS as string[],
  );

  const campaigns = Array.from({ length: 40 }, (_, i) => {
    const title = campaignTitles[i % campaignTitles.length];
    // Mix of statuses for comprehensive testing: 10 PENDING_APPROVAL, 12 DRAFT, 16 ACTIVE, 2 EDIT
    // Ensure ACTIVE campaigns cover all 4 categories evenly (4 campaigns per category)
    let campaignStatus;
    if (i < 10) {
      campaignStatus = CampaignStatus.PENDING_APPROVAL; // Will have campaign contracts deployed
    } else if (i < 22) {
      campaignStatus = CampaignStatus.DRAFT; // No contracts deployed
    } else if (i < 38) {
      campaignStatus = CampaignStatus.ACTIVE; // Will have both contracts deployed (16 ACTIVE campaigns)
    } else {
      // Use DRAFT status for campaigns in "edit" state - these will be marked differently in the database
      campaignStatus = CampaignStatus.DRAFT; // These represent campaigns being edited
    }

    return {
      id: 0,
      title,
      description: generateDescription(title),
      fundingGoal: generateFundingGoal(),
      startTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random start within last week
      endTime: new Date(
        Date.now() + (15 + Math.random() * 45) * 24 * 60 * 60 * 1000,
      ), // 15-60 days from now
      creatorAddress: selectRandom(creatorUsers),
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
    const creator = selectRandom(creatorUsers);
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
          console.log(`   Treasury contract deployed successfully`);
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
    const media = await db.media.create({
      data: {
        url: selectCampaignImage(campaign.title),
        mimeType: 'image/jpeg',
        state: 'UPLOADED',
        createdBy: {
          connect: { id: creator.id }, // Use the same creator as the campaign
        },
        campaign: { connect: { id: campaign.id } },
      },
    });

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
    const commenters = [...donorUsers, ...creatorUsers].slice(0, 20); // Use first 20 users as potential commenters

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
      // More payments for ACTIVE campaigns to show significant progress
      const basePaymentCount =
        campaignData.status === CampaignStatus.ACTIVE ? 8 : 3;
      const paymentCount = Math.floor(Math.random() * 15) + basePaymentCount; // 8-22 for ACTIVE, 3-17 for PENDING
      const donors = [...donorUsers, ...creatorUsers].slice(0, 20); // Use more users as donors

      let totalCampaignAmount = 0;

      for (let paymentIndex = 0; paymentIndex < paymentCount; paymentIndex++) {
        const donor = selectRandom(donors);

        // More varied payment amounts including larger donations
        const paymentAmounts = [
          '5',
          '10',
          '15',
          '20',
          '25',
          '30',
          '40',
          '50',
          '60',
          '75',
          '100',
          '125',
          '150',
          '175',
          '200',
          '250',
          '300',
          '400',
          '500',
        ];
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

        await db.payment.create({
          data: {
            amount,
            token: 'USDC',
            status: 'completed',
            type: 'BUY',
            transactionHash: isOnChain ? mockTransactionHash : null, // Simulate blockchain transactions
            isAnonymous: Math.random() < 0.15, // 15% anonymous donations
            createdAt: subDays(new Date(), Math.floor(Math.random() * 45) + 1), // Random date within last 45 days
            campaignId: campaign.id,
            userId: donor.id,
            provider,
            metadata: {
              fundingBalance: amount,
              // Add mock blockchain data for on-chain transactions
              ...(isOnChain && {
                blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
                gasUsed: Math.floor(Math.random() * 50000) + 21000,
                gasPrice: Math.floor(Math.random() * 20) + 10,
                networkFee: (Math.random() * 0.01 + 0.001).toFixed(6),
              }),
            },
          },
        });
      }

      console.log(
        `   Added ${paymentCount} payments totaling $${totalCampaignAmount} for campaign: ${campaign.title}`,
      );
    }
  }
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
    const admin = selectRandom(adminUsers);
    const round = await db.round.create({
      data: { ...rounds[i], managerAddress: admin.address },
    });

    // Assign campaigns to rounds based on their category
    let assignedCampaigns = [];

    if (i === 0) {
      // Kenya Education & Development Round - assign education campaigns
      assignedCampaigns = campaigns
        .filter((c) => c.category === 'education')
        .slice(0, 8); // First 8 education campaigns
    } else if (i === 1) {
      // East Africa Climate Resilience Round - assign climate resilience campaigns
      assignedCampaigns = campaigns
        .filter((c) => c.category === 'climate-resilience')
        .slice(0, 8); // First 8 climate campaigns
    } else if (i === 2) {
      // West Africa Climate Resilience Round - assign more climate resilience campaigns
      assignedCampaigns = campaigns
        .filter((c) => c.category === 'climate-resilience')
        .slice(8, 16); // Next 8 climate campaigns
    } else if (i === 3) {
      // Uganda Economic Development Round - assign economic development campaigns
      assignedCampaigns = campaigns
        .filter((c) => c.category === 'economic-development')
        .slice(0, 8); // First 8 economic campaigns
    } else {
      // Emergency Response Preparedness Round - assign emergency response campaigns
      assignedCampaigns = campaigns
        .filter((c) => c.category === 'emergency-response')
        .slice(0, 8); // First 8 emergency campaigns
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
    'Enhanced seed data includes: more campaign updates (3-8 per campaign), more comments (2-15 per campaign), and funding progress displays',
  );
  console.log(
    'Campaign categories: ALL 4 categories evenly distributed - Education, Economic Development, Climate Resilience, Emergency Response',
  );
  console.log(
    `Campaign statuses: 16 ACTIVE campaigns (4 per category), 10 PENDING_APPROVAL, 12 DRAFT, 2 EDIT`,
  );
  console.log(
    'Enhanced transactions: 8-22 payments per ACTIVE campaign with mock transaction hashes and varied providers',
  );
  console.log(
    'All campaigns maintain zero on-chain balance but show funding progress via payment metadata',
  );

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
    adminUsers.map(({ address }) => console.log(`admin ${address}`));
    creatorUsers
      .slice(0, 3)
      .map(({ address }) => console.log(`creator ${address}`));
    donorUsers
      .slice(0, 3)
      .map(({ address }) => console.log(`donor ${address}`));
  } else {
    console.log('\nCreated users for testing:');
    console.log(`  ${adminUsers.length} admin users`);
    console.log(`  ${creatorUsers.length} creator users`);
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
