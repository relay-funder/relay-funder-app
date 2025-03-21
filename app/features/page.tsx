"use client";
import { Container, Title, Text, SimpleGrid, Card, ThemeIcon } from "@mantine/core";
import { IconUserCircle, IconBuildingStore, IconMessage, IconCreditCard, IconSearch, IconStar } from "@tabler/icons-react";

const features = [
  {
    icon: IconUserCircle,
    title: "Web3 Integration",
    description: "Seamless integration with Privy wallet and Celo network for secure blockchain transactions.",
    color: "blue"
  },
  {
    icon: IconCreditCard,
    title: "Donate with Credit Card",
    description: "Multiple payment options including cryptocurrency and credit card integration via Stripe.",
    color: "yellow"
  },
  {
    icon: IconBuildingStore,
    title: "Campaign Management",
    description: "Create, manage, and track fundraising campaigns with comprehensive dashboard and image support.",
    color: "green"
  },
  {
    icon: IconMessage,
    title: "Social Features",
    description: "Engage with campaigns through comments, social sharing, and interactive features.",
    color: "violet"
  },
  {
    icon: IconSearch,
    title: "Collections",
    description: "Powerful search functionality and ability to organize campaigns into collections.",
    color: "indigo"
  },
  {
    icon: IconStar,
    title: "Quadratic Funding",
    description: "Let your community vote on which campaigns should receive funding.",
    color: "red"
  }
//   {
//     icon: IconStar,
//     title: "Personalization",
//     description: "Favorite campaigns, track donations, and customize your fundraising experience.",
//     color: "red"
//   }
];

export default function Features() {
  return (
    <Container size="xl" py="xl">
      <div className="text-center mb-12">
        <Title
          className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-4"
        >
          Features
        </Title>
        <div className="flex justify-center">
          <Text 
            c="dimmed" 
            size="xl" 
            className="max-w-4xl text-center px-4"
            ta="justify"
          >
            Akashic allows creators to create campaigns and receive donations from their community.
          </Text>
        </div>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
        {features.map((feature) => (
          <Card 
            key={feature.title}
            className="bg-[#1a1b1e]"
            padding="xl"
          >
            <ThemeIcon
              size={48}
              radius="md"
              variant="light"
              color={feature.color}
              className="mb-4"
            >
              <feature.icon size={24} stroke={1.5} />
            </ThemeIcon>
            <Text size="xl" fw={500} className="mb-3">
              {feature.title}
            </Text>
            <Text size="sm" c="dimmed">
              {feature.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}