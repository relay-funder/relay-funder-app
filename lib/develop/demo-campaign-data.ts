/**
 * Demo campaign data for development environment only.
 * This data is dynamically generated to ensure all values are always valid.
 * Contains realistic, varied campaign data that follows the same structure as production seed data.
 */

interface DemoCampaignData {
  title: string;
  description: string;
  fundingGoal: number;
  fundingModel: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
}

// Valid locations for demo data (subset of all countries for realistic scenarios)
const VALID_DEMO_LOCATIONS = [
  'Kenya',
  'Uganda',
  'Tanzania',
  'Rwanda',
  'Ethiopia',
];

// Valid campaign titles and descriptions with varied phrasing, tone, and structure
const CAMPAIGN_TEMPLATES = [
  // Climate Resilience - Formal, impact-focused
  {
    title: 'Solar Microgrids for Rural {location} Communities',
    description:
      'Deploying sustainable solar microgrids across remote {location} villages. This initiative provides reliable electricity to 500+ households, schools, and businesses while creating local employment in renewable energy infrastructure.',
    category: 'climate-resilience' as const,
    fundingRange: [800, 1500] as [number, number],
  },
  // Climate Resilience - Urgent, community-focused
  {
    title: 'Clean Energy Access - {location} Villages',
    description:
      'Bringing solar power to {location} communities that need it most. We install microgrids serving homes, schools, and clinics, creating sustainable energy solutions and local green jobs.',
    category: 'climate-resilience' as const,
    fundingRange: [900, 1400] as [number, number],
  },
  // Economic Development - Professional, business-oriented
  {
    title: 'Youth Entrepreneurship Center - {location}',
    description:
      'Establishing a comprehensive entrepreneurship hub in {location} for young innovators. Features mentorship programs, co-working spaces, and business development support serving 200+ entrepreneurs annually.',
    category: 'economic-development' as const,
    fundingRange: [600, 1200] as [number, number],
  },
  // Economic Development - Casual, opportunity-focused
  {
    title: 'Startup Hub for {location} Young Leaders',
    description:
      'Building a vibrant space where {location} youth can turn ideas into businesses. We provide mentorship, workspace, and connections to help 200+ entrepreneurs launch successful ventures.',
    category: 'economic-development' as const,
    fundingRange: [700, 1300] as [number, number],
  },
  // Emergency Response - Technical, service-oriented
  {
    title: 'Mobile Healthcare Units - {location}',
    description:
      'Delivering essential medical services to underserved {location} communities through mobile clinics. Comprehensive care includes maternal health, vaccinations, HIV testing, and telemedicine for 15,000+ people.',
    category: 'emergency-response' as const,
    fundingRange: [500, 1000] as [number, number],
  },
  // Emergency Response - Compassionate, human-focused
  {
    title: 'Healthcare on Wheels for {location}',
    description:
      'Bringing medical care directly to remote {location} villages. Our mobile clinics provide maternal care, vaccinations, HIV/AIDS support, and telemedicine to communities that need it most.',
    category: 'emergency-response' as const,
    fundingRange: [600, 1100] as [number, number],
  },
  // Education - Academic, structured approach
  {
    title: 'Digital Literacy Program - {location} Youth',
    description:
      'Comprehensive technology education initiative for {location} students. Curriculum covers computing fundamentals, digital design, mobile development, and entrepreneurship skills for future-ready careers.',
    category: 'education' as const,
    fundingRange: [300, 800] as [number, number],
  },
  // Education - Inspirational, future-focused
  {
    title: 'Future Tech Leaders from {location}',
    description:
      'Empowering {location} youth with digital skills for tomorrow. Our program teaches coding, design, app development, and online business to prepare the next generation of innovators.',
    category: 'education' as const,
    fundingRange: [400, 900] as [number, number],
  },
  // Economic Development - Agricultural focus
  {
    title: 'Climate-Smart Farming - {location} Farmers',
    description:
      'Supporting {location} smallholder farmers with sustainable agriculture techniques. Training in resilient crops, organic methods, and market access to improve food security and farmer incomes.',
    category: 'economic-development' as const,
    fundingRange: [700, 2000] as [number, number],
  },
  // Education - STEM specific
  {
    title: 'STEM Breakthrough Program - {location}',
    description:
      'Democratizing STEM education in {location} through intensive programs. Students participate in coding camps, robotics labs, science experiments, and mentorship from tech professionals.',
    category: 'education' as const,
    fundingRange: [400, 1000] as [number, number],
  },
  // Emergency Response - Disaster preparedness
  {
    title: 'Community Emergency Response - {location}',
    description:
      'Building local capacity for disaster response in {location}. Training volunteers in emergency preparedness, first aid, and coordination for floods, storms, and climate emergencies.',
    category: 'emergency-response' as const,
    fundingRange: [300, 800] as [number, number],
  },
  // Economic Development - Fisheries focus
  {
    title: 'Sustainable Fishing Cooperative - {location}',
    description:
      'Organizing {location} fishermen into sustainable cooperatives. Training in responsible fishing, value addition, and market development to protect fisheries while improving livelihoods.',
    category: 'economic-development' as const,
    fundingRange: [200, 600] as [number, number],
  },
  // Climate Resilience - Water/energy focus
  {
    title: 'Renewable Energy Village Project - {location}',
    description:
      'Transforming {location} villages with clean energy solutions. Solar installations provide electricity for homes and businesses, reducing carbon emissions while creating sustainable jobs.',
    category: 'climate-resilience' as const,
    fundingRange: [1000, 1800] as [number, number],
  },
  // Education - Skills training
  {
    title: 'Vocational Tech Academy - {location}',
    description:
      'Modern vocational training for {location} youth. Hands-on programs in digital tools, creative software, mobile technology, and digital entrepreneurship for immediate career opportunities.',
    category: 'education' as const,
    fundingRange: [350, 750] as [number, number],
  },
  // Emergency Response - Health emergency focus
  {
    title: 'Rural Health Emergency Network - {location}',
    description:
      'Strengthening health emergency response in {location} rural areas. Mobile units deliver critical care, vaccinations, and telemedicine to isolated communities facing health challenges.',
    category: 'emergency-response' as const,
    fundingRange: [450, 950] as [number, number],
  },
  // Economic Development - Women-focused
  {
    title: 'Women&apos;s Business Collective - {location}',
    description:
      'Empowering {location} women entrepreneurs through cooperative business development. Access to training, financing, and markets helps women build sustainable economic opportunities.',
    category: 'economic-development' as const,
    fundingRange: [500, 1100] as [number, number],
  },
  // Climate Resilience - Conservation focus
  {
    title: 'Forest Protection Initiative - {location}',
    description:
      'Safeguarding {location} forests through community conservation. Local training in sustainable practices, alternative livelihoods, and environmental monitoring protects vital ecosystems.',
    category: 'climate-resilience' as const,
    fundingRange: [600, 1200] as [number, number],
  },
  // Education - Community learning
  {
    title: 'Community Learning Hub - {location}',
    description:
      'Creating accessible learning centers in {location} communities. Technology training, digital literacy programs, and skill development serve diverse learners across all age groups.',
    category: 'education' as const,
    fundingRange: [250, 650] as [number, number],
  },
  // Emergency Response - Humanitarian aid
  {
    title: 'Humanitarian Aid Network - {location}',
    description:
      'Coordinating emergency humanitarian support in {location}. Mobile response teams provide immediate aid, medical care, and recovery support to communities in crisis.',
    category: 'emergency-response' as const,
    fundingRange: [400, 900] as [number, number],
  },
  // Economic Development - Tourism focus
  {
    title: 'Community Tourism Cooperative - {location}',
    description:
      'Developing sustainable tourism opportunities in {location}. Training local guides, preserving cultural heritage, and creating economic benefits for indigenous communities.',
    category: 'economic-development' as const,
    fundingRange: [550, 1150] as [number, number],
  },
];

// Valid duration ranges in days
const DURATION_RANGES = [
  [14, 21], // 2-3 weeks
  [21, 35], // 3-5 weeks
  [30, 60], // 1-2 months
  [45, 90], // 1.5-3 months
];

/**
 * Generate a random number between min and max (inclusive)
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random item from an array
 */
function randomFromArray<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate valid demo campaign data dynamically
 * This ensures all generated data is guaranteed to be valid
 */
function generateValidDemoCampaignData(): DemoCampaignData {
  const template = randomFromArray(CAMPAIGN_TEMPLATES);
  const location = randomFromArray(VALID_DEMO_LOCATIONS);
  const durationRange = randomFromArray(DURATION_RANGES);

  // Generate funding goal within template's range
  const fundingGoal = randomBetween(
    template.fundingRange[0],
    template.fundingRange[1],
  );

  // Generate duration within valid range
  const durationDays = randomBetween(durationRange[0], durationRange[1]);

  // Generate dates that meet validation requirements
  const now = new Date();

  // Calculate future start time based on environment
  const isDev = process.env.NODE_ENV === 'development';
  const baseMinutes = isDev ? 5 : 3 * 24 * 60; // 5 min dev, 3 days prod

  // For demo data, ensure we generate dates that are actually in the future
  // Since dates get formatted as YYYY-MM-DD (midnight), we need at least tomorrow
  // Add extra days to ensure the date is definitely in the future
  const extraDays = isDev ? 1 : 0; // Tomorrow for dev, today+3days for prod
  const totalMinutes = baseMinutes + extraDays * 24 * 60;

  const startDate = new Date(now.getTime() + totalMinutes * 60 * 1000);
  const endDate = new Date(
    startDate.getTime() + durationDays * 24 * 60 * 60 * 1000,
  );

  return {
    title: template.title.replace('{location}', location),
    description: template.description.replace('{location}', location),
    fundingGoal,
    fundingModel: 'flexible' as const, // Only valid funding model
    // Format as date input (YYYY-MM-DD) - transformation functions will set appropriate times
    startTime: startDate.toISOString().slice(0, 10),
    endTime: endDate.toISOString().slice(0, 10),
    location,
    category: template.category, // Guaranteed to be valid
  };
}

/**
 * Generate fresh demo campaign data (no caching to ensure validity)
 * Each call generates new data that meets current validation requirements
 */
function getFreshDemoData(): DemoCampaignData[] {
  // Only generate demo data when dev tools are explicitly enabled
  const isDevToolsEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true';

  if (!isDevToolsEnabled) {
    console.warn(
      '🚫 Demo data generation is only available when dev tools are enabled',
    );
    return [];
  }

  try {
    return Array.from({ length: 20 }, () => generateValidDemoCampaignData());
  } catch (error) {
    console.error('🚨 Error generating demo campaign data:', error);
    // Return empty array on error to prevent crashes
    return [];
  }
}

/**
 * Get random demo campaign data for development pre-filling
 * Always returns valid data with guaranteed enum/category compliance
 */
export function getRandomDemoCampaignData(): DemoCampaignData {
  const demoData = getFreshDemoData();
  if (demoData.length === 0) {
    throw new Error('No demo data available - check if in development mode');
  }
  const randomIndex = Math.floor(Math.random() * demoData.length);
  return demoData[randomIndex];
}

/**
 * Get specific demo campaign data by index (for consistent testing)
 * Always returns valid data with guaranteed enum/category compliance
 */
export function getDemoCampaignDataByIndex(index: number): DemoCampaignData {
  const demoData = getFreshDemoData();
  if (demoData.length === 0) {
    throw new Error('No demo data available - check if in development mode');
  }
  return demoData[index % demoData.length];
}

/**
 * Get demo campaign data optimized for preview generation (excludes banner image)
 * Always returns valid data with guaranteed enum/category compliance
 */
export function getDemoCampaignDataForPreview(): DemoCampaignData & {
  bannerImage: null;
} {
  try {
    const data = getRandomDemoCampaignData();
    return {
      ...data,
      // Explicitly exclude banner image for reliable preview generation
      bannerImage: null,
    };
  } catch (error) {
    console.error('🚨 Error getting demo data for preview:', error);
    // Return minimal valid data structure on error
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(tomorrow.getTime() + 7 * 24 * 60 * 60 * 1000);
    return {
      title: 'Demo Campaign',
      description: 'This is a demo campaign for testing purposes. It provides realistic sample data to help developers quickly populate forms and test functionality without having to manually enter all the required fields.',
      fundingGoal: 1000,
      fundingModel: 'flexible',
      startTime: tomorrow.toISOString().slice(0, 10), // Tomorrow
      endTime: nextWeek.toISOString().slice(0, 10), // Next week
      location: 'Kenya',
      category: 'education',
      bannerImage: null,
    };
  }
}
