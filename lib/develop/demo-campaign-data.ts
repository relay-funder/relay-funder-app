/**
 * Demo campaign data for development environment only.
 * This data is used to pre-fill campaign creation forms for faster development testing.
 * Contains realistic, varied campaign data that follows the same structure as production seed data.
 */

// Demo campaign data for development environment only

// Demo campaign data that mirrors the seed structure but is more varied for development testing
export const demoCampaignData = [
  {
    title: 'Community Solar Microgrid Project - Rural Kenya',
    description:
      'Installing solar microgrids in remote Kenyan villages to provide reliable electricity for homes, schools, and small businesses. This project will connect 500 households to clean, sustainable energy while creating local jobs in solar installation and maintenance.',
    fundingGoal: 1200,
    fundingModel: 'flexible',
    startTime: new Date().toISOString().slice(0, 10),
    endTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    location: 'Kenya',
    category: 'climate-resilience',
  },
  {
    title: 'Urban Youth Entrepreneurship Hub - Nairobi',
    description:
      'Creating a dedicated space for young entrepreneurs in Nairobi to access mentorship, co-working facilities, and business development training. The hub will support 200+ youth entrepreneurs annually with market linkages and seed funding.',
    fundingGoal: 850,
    fundingModel: 'flexible',
    startTime: new Date().toISOString().slice(0, 10),
    endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    location: 'Kenya',
    category: 'economic-development',
  },
  {
    title: 'Mobile Health Clinic for Maasai Communities',
    description:
      'Operating mobile health clinics serving remote Maasai communities in southern Kenya. Services include maternal care, child vaccinations, HIV/AIDS testing, and telemedicine consultations. Currently serving 15,000+ community members annually.',
    fundingGoal: 650,
    fundingModel: 'flexible',
    startTime: new Date().toISOString().slice(0, 10),
    endTime: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    location: 'Kenya',
    category: 'emergency-response',
  },
  {
    title: 'Digital Skills Training for Refugees - Kakuma',
    description:
      'Providing comprehensive digital literacy and vocational training to refugees and host community youth in Kakuma refugee camp. Programs include basic computing, graphic design, mobile app development, and online entrepreneurship courses.',
    fundingGoal: 500,
    fundingModel: 'flexible',
    startTime: new Date().toISOString().slice(0, 10),
    endTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    location: 'Kenya',
    category: 'education',
  },
  {
    title: 'Sustainable Agriculture Cooperative - Western Uganda',
    description:
      'Supporting 300+ smallholder farmers in western Uganda through cooperative farming initiatives. Focus on climate-resilient crops, organic farming techniques, and market access to improve food security and household incomes.',
    fundingGoal: 1500,
    fundingModel: 'flexible',
    startTime: new Date().toISOString().slice(0, 10),
    endTime: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    location: 'Uganda',
    category: 'agriculture',
  },
  {
    title: 'Girls STEM Education Initiative - Kampala',
    description:
      'Breaking gender barriers in STEM education through targeted programs for girls in Kampala. Includes coding bootcamps, robotics workshops, science clubs, and mentorship programs to prepare the next generation of female tech leaders.',
    fundingGoal: 750,
    fundingModel: 'flexible',
    startTime: new Date().toISOString().slice(0, 10),
    endTime: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    location: 'Uganda',
    category: 'education',
  },
  {
    title: 'Emergency Response Network - Coastal Tanzania',
    description:
      "Building community-based emergency response capacity along Tanzania's coast. Training local volunteers in disaster preparedness, first aid, and rapid response coordination for floods, cyclones, and other climate-related emergencies.",
    fundingGoal: 450,
    fundingModel: 'flexible',
    startTime: new Date().toISOString().slice(0, 10),
    endTime: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    location: 'Tanzania',
    category: 'emergency-response',
  },
  {
    title: 'Artisanal Fisheries Cooperative - Lake Victoria',
    description:
      "Organizing small-scale fishermen on Lake Victoria into sustainable cooperatives. Providing training in sustainable fishing practices, value addition, and market linkages to improve incomes and preserve the lake's fisheries.",
    fundingGoal: 300,
    fundingModel: 'flexible',
    startTime: new Date().toISOString().slice(0, 10),
    endTime: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    location: 'Tanzania',
    category: 'economic-development',
  },
];

/**
 * Get random demo campaign data for development pre-filling
 */
export function getRandomDemoCampaignData() {
  const randomIndex = Math.floor(Math.random() * demoCampaignData.length);
  return demoCampaignData[randomIndex];
}

/**
 * Get specific demo campaign data by index (for consistent testing)
 */
export function getDemoCampaignDataByIndex(index: number) {
  return demoCampaignData[index % demoCampaignData.length];
}
