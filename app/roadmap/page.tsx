'use client';

import {
  GitCommit,
  GitPullRequest,
  Star,
  Share,
  Search,
  CreditCard,
  MessageSquare,
  Image,
  UserCircle,
  Store,
  Rocket,
} from 'lucide-react';
import Link from 'next/link';

const launchDateString = '2025-04-15';

export default function RoadmapPage() {
  const launchDate = new Date(launchDateString);
  const today = new Date();
  const daysUntilLaunch = Math.ceil(
    (launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const progressPercentage = Math.max(
    0,
    Math.min(100, ((365 - daysUntilLaunch) / 365) * 100),
  );

  return (
    <div className="mx-auto max-w-4xl p-8">
      {/* Replaces Mantine Paper and Group */}
      <div className="mb-12 rounded-md bg-gradient-to-r from-blue-50 to-purple-50 p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-blue-900">Launch Countdown</p>
            <p className="mt-1 text-lg text-muted-foreground">
              {daysUntilLaunch === 0
                ? 'Launching today! 🚀'
                : daysUntilLaunch < 0
                  ? 'Project is live! 🎉'
                  : `${daysUntilLaunch} days until launch`}
            </p>
          </div>
          {/* Replaces RingProgress with a div, Rocket icon, and text for progress */}
          <div className="relative flex h-32 w-32 items-center justify-center">
            {/* The circular background and icon */}
            <div className="absolute flex h-full w-full items-center justify-center rounded-full bg-blue-100/50">
              <Rocket size={32} className="text-blue-800" />
            </div>
            {/* Display progress percentage text */}
            <p className="absolute text-sm font-medium text-blue-800">
              {Math.round(progressPercentage)}%
            </p>
          </div>
        </div>
      </div>

      <h1 className="mb-8 text-3xl font-bold">Project Roadmap</h1>

      {/* Replaces Mantine Timeline with a custom Tailwind CSS based timeline */}
      <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-gray-300">
        {renderTimelineItem(
          GitCommit,
          'Project Initialization',
          'November 22, 2024',
          'Initial project setup with Next.js and basic component structure',
        )}
        {renderTimelineItem(
          UserCircle,
          'Wallet Integration',
          'December 5-9, 2024',
          'Integrated Privy wallet and Celo network support',
        )}
        {renderTimelineItem(
          Store,
          'Campaign Dashboard',
          'December 23rd, 2024',
          'Display campaign dashboard for users to manage their campaigns',
        )}
        {renderTimelineItem(
          Store,
          'Campaign Management',
          'December 12-20, 2024',
          'Implemented campaign creation, listing, and management features',
        )}
        {renderTimelineItem(
          Store,
          'Campaign Persistence',
          'January 1st, 2025',
          'Save campaign meta-data in a database',
        )}
        {renderTimelineItem(
          Store,
          'Campaign Persistence',
          'January 6th, 2025',
          'Donate to a campaign',
        )}
        {renderTimelineItem(
          Store,
          'Admin page',
          'January 12th, 2025',
          'Admin can administer campaigns',
        )}
        {renderTimelineItem(
          Store,
          'Campaign images',
          'January 14th, 2025',
          'Campaign images can be uploaded',
        )}
        {renderTimelineItem(
          Store,
          'User dashboard',
          'January 14th, 2025',
          'User can view / edit their campaigns',
        )}
        {renderTimelineItem(
          MessageSquare,
          'Social Features',
          'January 21-23, 2025',
          'Added commenting system and campaign interaction features',
        )}
        {renderTimelineItem(
          MessageSquare,
          'Campaign details page',
          'January 22, 2025',
          'Campaign details page',
        )}
        {renderTimelineItem(
          MessageSquare,
          'Social commenting',
          'January 26, 2025',
          'Social commenting on campaigns',
        )}
        {renderTimelineItem(
          CreditCard,
          'Credit Card Payment Integration',
          'February 18-24, 2025',
          'Integrated payment systems with token support and Stripe integration',
        )}
        {renderTimelineItem(
          Search,
          'Search & Discovery',
          'February 19-21, 2025',
          'Implemented campaign search functionality',
        )}
        {renderTimelineItem(
          Share,
          'Social Sharing',
          'March 17, 2025',
          'Added social sharing capabilities and URL improvements',
        )}
        {renderTimelineItem(
          Image,
          <Link
            href="/collections"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Collections Feature
          </Link>,
          'March 18-19, 2025',
          'Implemented collections page and database integration',
        )}
        {renderTimelineItem(
          Star,
          'Favorites System',
          'March 20-21, 2025',
          'Added favorite campaign functionality',
        )}
        {renderTimelineItem(
          GitPullRequest,
          'Quadratic Funding',
          <span className="text-blue-600">Today</span>,
          'Currently deployed on staging',
        )}
        {renderTimelineItem(
          GitPullRequest,
          'MVP launch',
          <span className="text-blue-600">{launchDateString}</span>,
          'Currently deployed on staging',
        )}
      </div>
    </div>
  );
}

// Helper function to render a single timeline item
function renderTimelineItem(
  Icon: React.ElementType,
  title: React.ReactNode,
  date: React.ReactNode,
  description: string,
) {
  return (
    <div className="relative mb-8 pb-8 last:mb-0 last:pb-0">
      {/* Timeline bullet */}
      <div className="absolute -left-2 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
        <Icon size={12} className="text-white" />
      </div>
      {/* Content */}
      <div className="ml-6">
        <h3 className="mb-1 text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{date}</p>
        <p className="mt-2 text-sm text-gray-700">{description}</p>
      </div>
    </div>
  );
}
