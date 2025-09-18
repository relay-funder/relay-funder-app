import { config } from 'dotenv';
import { PrismaClient } from '../.generated/prisma/client';
import { CampaignStatus } from '../types/campaign';
import shortUUID from 'short-uuid';
import crypto from 'crypto';
import { subDays, addDays } from 'date-fns';
import { uniqueName, uniqueDescription } from '../lib/generate-strings';
import { deployCampaignContract, deployAllContracts } from '../lib/seed/contract-deployment';

// Load environment variables
config({ path: '.env.local' });

const db = new PrismaClient({
  log: ['error'],
});
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
    200, 300, 450, 500, 650, 750, 850, 1000, 1200, 1500, 1800, 2000
  ];
  return selectRandom(goals).toString();
}

// Generate realistic campaign descriptions based on campaign type
function generateDescription(title: string): string {
  const isEducation = title.toLowerCase().includes('education') || title.toLowerCase().includes('school') || title.toLowerCase().includes('learning') || title.toLowerCase().includes('teacher') || title.toLowerCase().includes('child');
  const isEconomic = title.toLowerCase().includes('microfinance') || title.toLowerCase().includes('entrepreneur') || title.toLowerCase().includes('cooperative') || title.toLowerCase().includes('mobile money') || title.toLowerCase().includes('artisan');
  const isClimate = title.toLowerCase().includes('solar') || title.toLowerCase().includes('drought') || title.toLowerCase().includes('reforestation') || title.toLowerCase().includes('climate') || title.toLowerCase().includes('rainwater');
  const isHealth = title.toLowerCase().includes('medical') || title.toLowerCase().includes('health') || title.toLowerCase().includes('nutrition') || title.toLowerCase().includes('clinic');
  const isWater = title.toLowerCase().includes('water') || title.toLowerCase().includes('wells');

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
  const isEducation = title.toLowerCase().includes('education') || title.toLowerCase().includes('school') || title.toLowerCase().includes('learning') || title.toLowerCase().includes('teacher') || title.toLowerCase().includes('child');
  const isEconomic = title.toLowerCase().includes('microfinance') || title.toLowerCase().includes('entrepreneur') || title.toLowerCase().includes('cooperative') || title.toLowerCase().includes('mobile money') || title.toLowerCase().includes('artisan');
  const isClimate = title.toLowerCase().includes('solar') || title.toLowerCase().includes('drought') || title.toLowerCase().includes('reforestation') || title.toLowerCase().includes('climate') || title.toLowerCase().includes('rainwater');
  const isHealth = title.toLowerCase().includes('medical') || title.toLowerCase().includes('health') || title.toLowerCase().includes('nutrition') || title.toLowerCase().includes('clinic');

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
  const isEducation = title.toLowerCase().includes('education') || title.toLowerCase().includes('school') || title.toLowerCase().includes('learning') || title.toLowerCase().includes('teacher');
  const isEconomic = title.toLowerCase().includes('microfinance') || title.toLowerCase().includes('entrepreneur') || title.toLowerCase().includes('cooperative') || title.toLowerCase().includes('mobile money') || title.toLowerCase().includes('artisan');
  const isClimate = title.toLowerCase().includes('solar') || title.toLowerCase().includes('drought') || title.toLowerCase().includes('reforestation') || title.toLowerCase().includes('climate') || title.toLowerCase().includes('rainwater');
  const isHealth = title.toLowerCase().includes('medical') || title.toLowerCase().includes('health') || title.toLowerCase().includes('nutrition') || title.toLowerCase().includes('clinic');
  const isWater = title.toLowerCase().includes('water') || title.toLowerCase().includes('wells');
  const isAgriculture = title.toLowerCase().includes('crops') || title.toLowerCase().includes('farming');
  const isEmergency = title.toLowerCase().includes('emergency') || title.toLowerCase().includes('distribution');
  const isChild = title.toLowerCase().includes('child') || title.toLowerCase().includes('nutrition') || title.toLowerCase().includes('feeding');

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
      endTime: new Date(Date.now() + (15 + Math.random() * 45) * 24 * 60 * 60 * 1000), // 15-60 days from now
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
      description: 'Supporting educational initiatives and community development projects across Kenya. This matching round focuses on sustainable impact through education, economic empowerment, and infrastructure development.',
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
      description: 'Addressing climate challenges across East Africa through renewable energy, water conservation, and sustainable agriculture projects. This round emphasizes community-led climate adaptation solutions.',
      descriptionUrl: 'https://relayfunder.com', 
      matchingPool: 75000,
      startDate: addDays(new Date(), 10), // Starts in 10 days (upcoming)
      endDate: addDays(new Date(), 40), // Ends in 40 days
      applicationStart: addDays(new Date(), 5),
      applicationClose: addDays(new Date(), 8),
      blockchain: 'CELO',
      managerAddress: selectRandom(adminUsers),
      fundWalletAddress: `0xround2matchingpool000000000000000000000000`,
    }
  ];

  // Create campaigns with automatic contract deployment based on status
  for (let i = 0; i < campaigns.length; i++) {
    const creator = selectRandom(creatorUsers);
    const campaignData = { ...campaigns[i], id: undefined, creatorAddress: creator.address };
    
    console.log(`\n📝 Creating campaign ${i + 1}/${campaigns.length}: ${campaignData.title}`);
    console.log(`   Status: ${campaignData.status}`);
    
    // Create campaign in database first
    const campaign = await db.campaign.create({
      data: campaignData,
    });
    campaigns[i].id = campaign.id;

    // Deploy contracts based on campaign status
    let campaignAddress: string | null = null;
    let treasuryAddress: string | null = null;
    let transactionHash: string | null = null;

    if (campaignData.status === CampaignStatus.PENDING_APPROVAL) {
      // PENDING_APPROVAL campaigns should have campaign contract deployed
      console.log(`   🚀 Deploying campaign contract (status: PENDING_APPROVAL)`);
      const deployResult = await deployCampaignContract({
        id: campaign.id,
        title: campaign.title,
        creatorAddress: campaign.creatorAddress,
        fundingGoal: campaign.fundingGoal,
        startTime: campaign.startTime,
        endTime: campaign.endTime,
      });

      if (deployResult.success) {
        campaignAddress = deployResult.campaignAddress;
        transactionHash = deployResult.transactionHash;
        console.log(`   ✅ Campaign contract deployed successfully`);
      } else {
        console.log(`   ❌ Campaign contract deployment failed: ${deployResult.error}`);
      }
    } else if (campaignData.status === CampaignStatus.ACTIVE) {
      // ACTIVE campaigns should have both contracts deployed
      console.log(`   🚀 Deploying both contracts (status: ACTIVE)`);
      const deployResult = await deployAllContracts({
        id: campaign.id,
        title: campaign.title,
        creatorAddress: campaign.creatorAddress,
        fundingGoal: campaign.fundingGoal,
        startTime: campaign.startTime,
        endTime: campaign.endTime,
      });

      if (deployResult.campaignContract.success) {
        campaignAddress = deployResult.campaignContract.campaignAddress;
        transactionHash = deployResult.campaignContract.transactionHash;
        console.log(`   ✅ Campaign contract deployed successfully`);

        if (deployResult.treasuryContract?.success) {
          treasuryAddress = deployResult.treasuryContract.treasuryAddress;
          console.log(`   ✅ Treasury contract deployed successfully`);
        } else {
          console.log(`   ❌ Treasury deployment failed: ${deployResult.treasuryContract?.error}`);
        }
      } else {
        console.log(`   ❌ Campaign contract deployment failed: ${deployResult.campaignContract.error}`);
      }
    } else {
      // DRAFT campaigns have no contracts deployed
      console.log(`   📋 No contracts deployed (status: DRAFT)`);
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

    console.log(`   💾 Campaign saved with contract addresses`);

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
      assignedCampaigns = campaigns.filter(c => 
        c.category === 'education' || 
        c.category === 'economic-development' || 
        c.category === 'general-aid' ||
        c.category === 'health'
      ).slice(0, 8); // First 8 matching campaigns
    } else {
      // East Africa Climate Resilience Round - assign climate, agriculture, and water campaigns  
      assignedCampaigns = campaigns.filter(c => 
        c.category === 'climate-resilience' || 
        c.category === 'agriculture' || 
        c.category === 'water-sanitation' ||
        c.category === 'infrastructure'
      ).slice(0, 6); // First 6 matching campaigns
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

    // Add remote image for round
    const roundMedia = await db.media.create({
      data: {
        url: selectRandom(remoteImageFiles.general),
        mimeType: 'image/jpeg',
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
    `\n🎉 Seeded ${campaigns.length} campaigns with ZERO balances, ${rounds.length} matching rounds with remote IPFS images`,
  );
  console.log(
    '💰 All campaigns start at $0 - ready for end-to-end testing with real pledges',
  );
  console.log(
    '🚀 Contract deployment status:',
  );
  console.log(
    '   - DRAFT campaigns: No contracts deployed (use admin tooling)',
  );
  console.log(
    '   - PENDING_APPROVAL campaigns: Campaign contracts deployed automatically',
  );
  console.log(
    '   - ACTIVE campaigns: Both campaign and treasury contracts deployed automatically',
  );
  console.log(
    '\n👤 Use the dummy-web3 connector to sign in as one of these users:',
  );
  adminUsers.map(({ address }) => console.log(`admin ${address}`));
  creatorUsers
    .slice(0, 3)
    .map(({ address }) => console.log(`creator ${address}`));
  donorUsers.slice(0, 3).map(({ address }) => console.log(`donor ${address}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
