'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';

interface CreateCampaignPlaceholderProps {
  onCreate?: () => void;
  className?: string;
}

export function CreateCampaignPlaceholder({
  onCreate,
  className,
}: CreateCampaignPlaceholderProps) {
  return (
    <Card
      className={`flex h-full cursor-pointer flex-col overflow-hidden border-2 border-dashed border-gray-400 bg-gradient-to-br from-gray-50 to-gray-200 transition-all duration-300 hover:shadow-lg ${className || ''} `}
      onClick={onCreate}
    >
      <CardContent className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-6">
          {/* Icon with decorative elements */}
          <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200">
            <Plus className="h-8 w-8 text-gray-700" />
            <Sparkles className="absolute -right-2 -top-2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="max-w-sm space-y-3">
          <h3 className="text-xl font-semibold text-gray-900">
            Create Your Campaign
          </h3>

          <p className="text-sm leading-relaxed text-gray-600">
            Share your campaign with the world and raise funds from supporters
            who believe in your vision.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            size="lg"
            className="w-full text-white"
            onClick={(e) => {
              e.stopPropagation();
              onCreate?.();
            }}
          >
            <Plus className="mr-2 h-4 w-4 text-white" />
            Start Creating
          </Button>

          <p className="text-xs text-gray-500">
            It only takes a few minutes to get started
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
