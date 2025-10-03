import { CampaignFormSchemaType } from './form';

interface CreateFormState {
  title: string;
  description: React.ReactNode;
  next: {
    label: string;
    target?: keyof typeof CampaignCreateFormStates;
    submit: boolean;
  } | null;
  prev: {
    label: string;
    target: keyof typeof CampaignCreateFormStates;
  } | null;
  fields: (keyof CampaignFormSchemaType)[];
}
export const CampaignCreateFormStates: Record<string, CreateFormState> = {
  introduction: {
    title: "Let's Get Started",
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Create a compelling campaign to attract supporters and funding for
          your project.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">
            Quick Process Overview:
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Fill out campaign details</li>
            <li>Submit for review</li>
            <li>Get approved and go live</li>
            <li>Share and receive funding</li>
          </ul>
        </div>
      </div>
    ),
    next: { label: "Let's Go", submit: false, target: 'description' },
    prev: null,
    fields: [],
  },
  description: {
    title: 'Title and Description',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Create a compelling title and description that will be the first
          impression for potential supporters.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Title Tips:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Keep it concise and use action words</li>
            <li>Include your main goal or benefit</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-foreground">
            Description Structure:
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Start with the problem and explain your solution</li>
            <li>Show impact and end with a clear call to action</li>
          </ul>
        </div>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'meta' },
    prev: { label: 'Back', target: 'introduction' },
    fields: ['title', 'description'],
  },
  meta: {
    title: 'Location and Category',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Help supporters find your campaign by specifying your location and
          selecting the most relevant category.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">
            Why This Matters:
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Location helps local supporters connect with your project</li>
            <li>
              Category improves discoverability and targets the right audience
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Choose Wisely:</h4>
          <p className="text-sm text-muted-foreground">
            Select the category that best represents your project&apos;s main
            focus area.
          </p>
        </div>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'media' },
    prev: { label: 'Back', target: 'description' },
    fields: ['location', 'category'],
  },
  media: {
    title: 'Media',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload a compelling main image that will represent your campaign
          across the platform.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">
            Image Guidelines:
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Use high-quality images that represent your project</li>
            <li>Avoid cluttered backgrounds and focus on your main subject</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Pro Tip:</h4>
          <p className="text-sm text-muted-foreground">
            A compelling image can significantly increase engagement and attract
            more supporters to your campaign.
          </p>
        </div>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'funding' },
    prev: { label: 'Back', target: 'meta' },
    fields: ['bannerImage'],
  },
  funding: {
    title: 'Funding',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Set a realistic funding goal that covers all your project costs.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">
            Consider These Costs:
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Production, materials, and marketing costs</li>
            <li>Platform fees, taxes, and contingency buffer (10-20%)</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-foreground">
            Flexible Funding:
          </h4>
          <p className="text-sm text-muted-foreground">
            You&apos;ll receive all funds raised, even if you don&apos;t reach
            your goal.
          </p>
        </div>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'timeline' },
    prev: { label: 'Back', target: 'media' },
    fields: ['fundingGoal', 'fundingModel'],
  },
  timeline: {
    title: 'Timeline',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Set your campaign start and end dates. Most successful campaigns run
          for 30-60 days.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Start Date Tips:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Allow time to prepare promotional materials</li>
            <li>Ensure you&apos;re ready to actively promote your campaign</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-foreground">
            Duration Guidelines:
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>30 days: Good for simple projects</li>
            <li>45-60 days: Better for complex campaigns</li>
          </ul>
        </div>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'summary' },
    prev: { label: 'Back', target: 'funding' },
    fields: ['startTime', 'endTime'],
  },
  summary: {
    title: 'Review & Submit',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Review your campaign preview and choose how to proceed.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Your Options:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="dark:[&>strong]:text-white">
              <strong>Save as Draft:</strong> Keep working on your campaign
              later
            </li>
            <li className="dark:[&>strong]:text-white">
              <strong>Submit for Approval:</strong> Send for review to go live
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Quick Check:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Title and description are clear and compelling</li>
            <li>Image and funding goal are appropriate</li>
          </ul>
        </div>
      </div>
    ),
    next: { label: 'Choose Action', submit: false },
    prev: { label: 'Back', target: 'timeline' },
    fields: [],
  },
};
