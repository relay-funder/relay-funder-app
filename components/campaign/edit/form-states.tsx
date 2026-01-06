import { CampaignFormSchemaType } from './form';

interface EditFormState {
  title: string;
  description: React.ReactNode;
  next: {
    label: string;
    target?: keyof typeof CampaignEditFormStates;
    submit: boolean;
  } | null;
  prev: {
    label: string;
    target: keyof typeof CampaignEditFormStates;
  } | null;
  fields: (keyof CampaignFormSchemaType)[];
}
export const CampaignEditFormStates: Record<string, EditFormState> = {
  introduction: {
    title: 'Welcome to Campaign Editing',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Update your campaign details to better connect with supporters and
          improve your presentation.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">
            Edit Process Overview:
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Make your updates</li>
            <li>Submit changes for review</li>
            <li>Get approved and go live</li>
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
          Update your campaign title and description to better connect with
          potential supporters.
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
    prev: null,
    fields: ['title', 'description'],
  },
  meta: {
    title: 'Location and Category',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Update your campaign location and category to help supporters find
          your project.
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
    next: { label: 'Next', submit: false, target: 'funding' },
    prev: { label: 'Back', target: 'description' },
    fields: ['location', 'category'],
  },
  funding: {
    title: 'Funding Goal',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Set your funding goal and choose your funding model.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Funding Tips:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Set a realistic goal based on your project needs</li>
            <li>Consider all costs including materials and fees</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Important:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Funding goal cannot be changed after deployment</li>
            <li>Choose carefully based on your project requirements</li>
          </ul>
        </div>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'timeline' },
    prev: { label: 'Back', target: 'meta' },
    fields: ['fundingGoal', 'fundingModel'],
  },
  timeline: {
    title: 'Campaign Timeline',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Set your campaign start and end dates.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Timeline Tips:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Allow enough time to reach your funding goal</li>
            <li>Consider seasonal factors and holidays</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Important:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Dates cannot be changed after deployment</li>
            <li>Plan your timeline carefully</li>
          </ul>
        </div>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'media' },
    prev: { label: 'Back', target: 'funding' },
    fields: ['startTime', 'endTime'],
  },
  media: {
    title: 'Media',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Update your campaign image to better represent your project.
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
    next: { label: 'Next', submit: false, target: 'summary' },
    prev: { label: 'Back', target: 'timeline' },
    fields: ['bannerImage'],
  },
  summary: {
    title: 'Review & Submit',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Review your updated campaign preview and submit your changes.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Your Options:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <strong>Save (draft)</strong> - Save changes without submitting
              for review
            </li>
            <li>
              <strong>Submit for approval</strong> - Submit changes for review
              and approval
            </li>
            <li>
              <strong>Save</strong> - Save changes to already submitted campaign
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-foreground">Quick Check:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Review all changes and ensure accuracy</li>
            <li>Go back to edit any section if needed</li>
          </ul>
        </div>
      </div>
    ),
    next: { label: 'Submit', submit: true },
    prev: { label: 'Back', target: 'media' },
    fields: [],
  },
};
