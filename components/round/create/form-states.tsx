import { RoundFormSchemaType } from './form';

interface CreateFormState {
  title: string;
  description: React.ReactNode;
  next: {
    label: string;
    target?: keyof typeof RoundCreateFormStates;
    submit: boolean;
  } | null;
  prev: {
    label: string;
    target: keyof typeof RoundCreateFormStates;
  } | null;
  fields: (keyof RoundFormSchemaType)[];
}
export const RoundCreateFormStates: Record<string, CreateFormState> = {
  introduction: {
    title: "Let's Get Started",
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Create a round to organize and fund multiple campaigns through
          quadratic funding.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">
            Quick Process Overview:
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Set up round details and timeline</li>
            <li>Configure funding parameters</li>
            <li>Launch and manage the round</li>
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
          Create a compelling title and description that will attract the right
          campaigns to your round.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Title Tips:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Keep it concise and use action words</li>
            <li>Include your main goal or focus area</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-foreground">
            Description Structure:
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Start with the purpose and goals</li>
            <li>Explain eligibility and requirements</li>
            <li>End with clear call to action</li>
          </ul>
        </div>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'funding' },
    prev: { label: 'Back', target: 'introduction' },
    fields: ['title', 'description'],
  },
  funding: {
    title: 'Funding',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Set the total funding pool available for quadratic funding
          distribution.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Matching Pool:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>This amount will be matched to successful campaigns</li>
            <li>Consider your total budget and funding goals</li>
          </ul>
        </div>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'timeline' },
    prev: { label: 'Back', target: 'description' },
    fields: ['matchingPool'],
  },

  timeline: {
    title: 'Timeline',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Set the application period and funding round dates for your quadratic
          funding round.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">
            Application Period:
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>When campaigns can apply to join the round</li>
            <li>Allow sufficient time for review and promotion</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Round Period:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>When donations are collected and matched</li>
            <li>Typically 30-60 days for optimal participation</li>
          </ul>
        </div>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'media' },
    prev: { label: 'Back', target: 'funding' },
    fields: [
      'startTime',
      'endTime',
      'applicationStartTime',
      'applicationEndTime',
    ],
  },
  media: {
    title: 'Media',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload a logo image that represents your round and will be displayed
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
            A compelling logo can significantly increase engagement and attract
            more campaigns to your round.
          </p>
        </div>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'summary' },
    prev: { label: 'Back', target: 'timeline' },
    fields: ['logo'],
  },

  summary: {
    title: 'Review & Submit',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Review your round details and submit for creation.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Quick Check:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Title and description are clear and compelling</li>
            <li>Funding amount and timeline are appropriate</li>
            <li>Logo image represents your round well</li>
          </ul>
        </div>
      </div>
    ),
    next: { label: 'Create Round', submit: true },
    prev: { label: 'Back', target: 'media' },
    fields: [],
  },
};
