import { config } from 'dotenv';
import { PrismaClient } from '../.generated/prisma/client';
import { CampaignStatus } from '../types/campaign';
import shortUUID from 'short-uuid';
import crypto from 'crypto';
import { subDays, addDays } from 'date-fns';
import { uniqueName, uniqueDescription } from '../lib/generate-strings';
import {
  deployCampaignContract,
  deployAllContracts,
} from '../lib/seed/contract-deployment';

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
  // Economic Development campaigns
  'Microfinance for Women Farmers - Kisumu',
  'Youth Entrepreneurship Hub - Kampala',
  'Cooperative Banking for Small Holders',
  'Mobile Money Access Points - Rural Kenya',
  'Artisan Craft Export Program - Mombasa',
  // Climate Resilience campaigns
  'Solar Water Pumping Systems - Turkana',
  'Drought-Resistant Crops Training',
  'Reforestation Project - Mount Elgon',
  'Community Climate Adaptation - Karamoja',
  'Rainwater Harvesting Initiative',
  // General Aid campaigns
  'Medical Clinic Expansion - Gulu',
  'Emergency Food Distribution - Dadaab',
  'Clean Water Wells for Rural Communities',
  'Maternal Health Support Program',
  'Child Nutrition Initiative - Kibera',
];

const campaignCategories = [
  { id: 'education', name: 'Education', icon: '🎓' },
  { id: 'economic-development', name: 'Economic Development', icon: '💼' },
  { id: 'climate-resilience', name: 'Climate Resilience', icon: '🌱' },
  { id: 'general-aid', name: 'General Aid', icon: '🤝' },
  { id: 'health', name: 'Health & Medical', icon: '🏥' },
  { id: 'water-sanitation', name: 'Water & Sanitation', icon: '💧' },
  { id: 'agriculture', name: 'Agriculture & Food', icon: '🌾' },
  { id: 'technology', name: 'Technology Access', icon: '💻' },
  { id: 'infrastructure', name: 'Infrastructure', icon: '🏗️' },
  { id: 'emergency-relief', name: 'Emergency Relief', icon: '🚨' },
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

const campaignStatuses = Object.values(CampaignStatus);

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
async function createUsers(amount: number, roles: string[]) {
  const userPromises = [];
  for (let i = 0; i < amount; i++) {
    userPromises.push(
      db.user.create({
        data: {
          address: randomAddress(),
          roles,
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
    title.toLowerCase().includes('child');
  const isEconomic =
    title.toLowerCase().includes('microfinance') ||
    title.toLowerCase().includes('entrepreneur') ||
    title.toLowerCase().includes('cooperative') ||
    title.toLowerCase().includes('mobile money') ||
    title.toLowerCase().includes('artisan');
  const isClimate =
    title.toLowerCase().includes('solar') ||
    title.toLowerCase().includes('drought') ||
    title.toLowerCase().includes('reforestation') ||
    title.toLowerCase().includes('climate') ||
    title.toLowerCase().includes('rainwater');
  const isHealth =
    title.toLowerCase().includes('medical') ||
    title.toLowerCase().includes('health') ||
    title.toLowerCase().includes('nutrition') ||
    title.toLowerCase().includes('clinic');
  const isWater =
    title.toLowerCase().includes('water') ||
    title.toLowerCase().includes('wells');

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
  } else if (isHealth) {
    descriptions = [
      `${title} improves health outcomes through accessible medical services. We support community health workers, medical supplies, and preventive care programs for underserved populations.`,
      `This health initiative focuses on maternal and child health, providing essential medical care and health education. ${title} works to reduce preventable diseases and improve nutrition.`,
      `${title} strengthens healthcare systems through infrastructure development and capacity building. Our approach ensures sustainable, community-led health solutions.`,
    ];
  } else if (isWater) {
    descriptions = [
      `${title} provides clean, safe water access to rural communities. Our sustainable approach includes well construction, water system maintenance, and hygiene education programs.`,
      `This water initiative addresses critical needs through community-managed water systems. ${title} ensures long-term access to clean water and improved sanitation facilities.`,
      `${title} transforms communities through reliable water access. We combine infrastructure development with local capacity building for sustainable water resource management.`,
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
    title.toLowerCase().includes('child');
  const isEconomic =
    title.toLowerCase().includes('microfinance') ||
    title.toLowerCase().includes('entrepreneur') ||
    title.toLowerCase().includes('cooperative') ||
    title.toLowerCase().includes('mobile money') ||
    title.toLowerCase().includes('artisan');
  const isClimate =
    title.toLowerCase().includes('solar') ||
    title.toLowerCase().includes('drought') ||
    title.toLowerCase().includes('reforestation') ||
    title.toLowerCase().includes('climate') ||
    title.toLowerCase().includes('rainwater');
  const isHealth =
    title.toLowerCase().includes('medical') ||
    title.toLowerCase().includes('health') ||
    title.toLowerCase().includes('nutrition') ||
    title.toLowerCase().includes('clinic');

  if (isEducation && remoteImageFiles.education.length > 0) {
    return selectRandom(remoteImageFiles.education);
  } else if (isEconomic && remoteImageFiles.economic.length > 0) {
    return selectRandom(remoteImageFiles.economic);
  } else if (isClimate && remoteImageFiles.climate.length > 0) {
    return selectRandom(remoteImageFiles.climate);
  } else if (isHealth && remoteImageFiles.health.length > 0) {
    return selectRandom(remoteImageFiles.health);
  } else {
    return selectRandom(remoteImageFiles.general);
  }
}

// Function to select appropriate category based on campaign title
function selectCampaignCategory(title: string): string {
  const isEducation =
    title.toLowerCase().includes('education') ||
    title.toLowerCase().includes('school') ||
    title.toLowerCase().includes('learning') ||
    title.toLowerCase().includes('teacher');
  const isEconomic =
    title.toLowerCase().includes('microfinance') ||
    title.toLowerCase().includes('entrepreneur') ||
    title.toLowerCase().includes('cooperative') ||
    title.toLowerCase().includes('mobile money') ||
    title.toLowerCase().includes('artisan');
  const isClimate =
    title.toLowerCase().includes('solar') ||
    title.toLowerCase().includes('drought') ||
    title.toLowerCase().includes('reforestation') ||
    title.toLowerCase().includes('climate') ||
    title.toLowerCase().includes('rainwater');
  const isHealth =
    title.toLowerCase().includes('medical') ||
    title.toLowerCase().includes('health') ||
    title.toLowerCase().includes('nutrition') ||
    title.toLowerCase().includes('clinic');
  const isWater =
    title.toLowerCase().includes('water') ||
    title.toLowerCase().includes('wells');
  const isAgriculture =
    title.toLowerCase().includes('crops') ||
    title.toLowerCase().includes('farming');
  const isEmergency =
    title.toLowerCase().includes('emergency') ||
    title.toLowerCase().includes('distribution');
  const isChild =
    title.toLowerCase().includes('child') ||
    title.toLowerCase().includes('nutrition') ||
    title.toLowerCase().includes('feeding');

  if (isEducation) return 'education';
  if (isEconomic) return 'economic-development';
  if (isClimate) return 'climate-resilience';
  if (isHealth) return 'health';
  if (isWater) return 'water-sanitation';
  if (isAgriculture) return 'agriculture';
  if (isEmergency) return 'emergency-relief';
  if (isChild) return 'general-aid';

  return 'general-aid'; // default fallback
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
  const adminUsers = await createUsers(2, ['user', 'admin']);

  const campaigns = Array.from({ length: 20 }, (_, i) => {
    const title = campaignTitles[i % campaignTitles.length];
    // Mix of statuses for comprehensive testing: 8 PENDING_APPROVAL, 8 DRAFT, 4 ACTIVE
    let campaignStatus;
    if (i < 8) {
      campaignStatus = CampaignStatus.PENDING_APPROVAL; // Will have campaign contracts deployed
    } else if (i < 16) {
      campaignStatus = CampaignStatus.DRAFT; // No contracts deployed
    } else {
      campaignStatus = CampaignStatus.ACTIVE; // Will have both contracts deployed
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
      category: selectCampaignCategory(title),
      location: locations[i % locations.length],
    };
  });
  // Create 2 rounds for matching - one active, one upcoming
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

    // Add a few campaign updates for realism
    for (let updateIndex = 1; updateIndex < 4; updateIndex++) {
      await db.campaignUpdate.create({
        data: {
          title: `Project Update ${updateIndex}`,
          content: `This is update #${updateIndex} for the campaign. We are making great progress on our objectives and will continue to update the community on our achievements.`,
          creatorAddress: creator.address,
          createdAt: subDays(new Date(), 15 - updateIndex * 3),
          campaign: { connect: { id: campaign.id } },
        },
      });
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
  ];

  // Create the 2 rounds and assign campaigns strategically
  for (let i = 0; i < rounds.length; i++) {
    const admin = selectRandom(adminUsers);
    const round = await db.round.create({
      data: { ...rounds[i], managerAddress: admin.address },
    });

    // Assign campaigns to rounds based on their category
    let assignedCampaigns = [];

    if (i === 0) {
      // Kenya Education & Development Round - assign education, economic, and general aid campaigns
      assignedCampaigns = campaigns
        .filter(
          (c) =>
            c.category === 'education' ||
            c.category === 'economic-development' ||
            c.category === 'general-aid' ||
            c.category === 'health',
        )
        .slice(0, 8); // First 8 matching campaigns
    } else {
      // East Africa Climate Resilience Round - assign climate, agriculture, and water campaigns
      assignedCampaigns = campaigns
        .filter(
          (c) =>
            c.category === 'climate-resilience' ||
            c.category === 'agriculture' ||
            c.category === 'water-sanitation' ||
            c.category === 'infrastructure',
        )
        .slice(0, 6); // First 6 matching campaigns
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
    `\nSeeded ${campaigns.length} campaigns with ZERO balances, ${rounds.length} matching rounds with specific sponsor logos`,
  );
  console.log(
    'All campaigns start at $0 - ready for end-to-end testing with real pledges',
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
