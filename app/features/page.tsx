'use client';
import {
  UserCircle,
  CreditCard,
  Store,
  MessageCircle,
  Search,
  Star,
  File,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const features = [
  {
    icon: UserCircle,
    title: 'Web3 Integration',
    description:
      'Seamless integration with Privy wallet and Celo network for secure blockchain transactions.',
    color: 'blue',
  },
  {
    icon: CreditCard,
    title: 'Donate with Credit Card',
    description:
      'Multiple payment options including cryptocurrency and credit card integration via Stripe.',
    color: 'yellow',
  },
  {
    icon: Store,
    title: 'Campaign Management',
    description:
      'Create, manage, and track fundraising campaigns with comprehensive dashboard and image support.',
    color: 'green',
  },
  {
    icon: MessageCircle,
    title: 'Social Features',
    description:
      'Engage with campaigns through comments, social sharing, and interactive features.',
    color: 'purple',
  },
  {
    icon: Search,
    title: 'Collections',
    description:
      'Powerful search functionality and ability to organize campaigns into collections.',
    color: 'indigo',
  },
  {
    icon: Star,
    title: 'Quadratic Funding',
    description:
      'Let your community vote on which campaigns should receive funding.',
    color: 'red',
  },
  {
    icon: File,
    title: 'Numbers Protocol',
    description:
      'Integration with Numbers Protocol for storing NFTs & on-chain data archives using Filecoin.',
    color: 'red',
  },
];

const getColorClasses = (color: string) => {
  switch (color) {
    case 'blue':
      return 'bg-blue-500/10 text-blue-500';
    case 'yellow':
      return 'bg-yellow-500/10 text-yellow-500';
    case 'green':
      return 'bg-green-500/10 text-green-500';
    case 'purple':
      return 'bg-purple-500/10 text-purple-500';
    case 'indigo':
      return 'bg-indigo-500/10 text-indigo-500';
    case 'red':
      return 'bg-red-500/10 text-red-500';
    default:
      return 'bg-gray-500/10 text-gray-500';
  }
};

export default function Features() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-4xl font-bold text-transparent">
          Features
        </h1>
        <div className="flex justify-center">
          <p className="max-w-4xl px-4 text-center text-xl text-muted-foreground">
            Relay Funder allows creators to create campaigns and receive
            donations from their community.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="bg-[#1a1b1e]">
            <CardHeader className="p-0 pb-4">
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-md ${getColorClasses(feature.color)}`}
              >
                <feature.icon size={24} />
              </div>
              <CardTitle className="mb-3 text-xl font-medium">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CardDescription className="text-sm text-muted-foreground">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
