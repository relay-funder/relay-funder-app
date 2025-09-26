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
        <p className="text-sm text-gray-600">
          Update your campaign details to better connect with supporters and
          improve your presentation.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">
            Edit Process Overview:
          </h4>
          <ul className="space-y-1 text-sm text-gray-600">
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
        <p className="text-sm text-gray-600">
          Update your campaign title and description to better connect with
          potential supporters.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Title Tips:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>Keep it concise and use action words</li>
            <li>Include your main goal or benefit</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">
            Description Structure:
          </h4>
          <ul className="space-y-1 text-sm text-gray-600">
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
        <p className="text-sm text-gray-600">
          Update your campaign location and category to help supporters find
          your project.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Why This Matters:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>Location helps local supporters connect with your project</li>
            <li>
              Category improves discoverability and targets the right audience
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Choose Wisely:</h4>
          <p className="text-sm text-gray-600">
            Select the category that best represents your project's main focus
            area.
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
        <p className="text-sm text-gray-600">
          Update your campaign image to better represent your project.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Image Guidelines:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>Use high-quality images that represent your project</li>
            <li>Avoid cluttered backgrounds and focus on your main subject</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Pro Tip:</h4>
          <p className="text-sm text-gray-600">
            A compelling image can significantly increase engagement and attract
            more supporters to your campaign.
          </p>
        </div>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'summary' },
    prev: { label: 'Back', target: 'meta' },
    fields: ['bannerImage'],
  },
  summary: {
    title: 'Review & Submit',
    description: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Review your updated campaign preview and submit your changes.
        </p>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Before Submitting:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>Review all changes and ensure accuracy</li>
            <li>Go back to edit any section if needed</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Quick Check:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>Title and description are clear and compelling</li>
            <li>Image, location, and category are appropriate</li>
          </ul>
        </div>
      </div>
    ),
    next: { label: 'Submit', submit: true },
    prev: { label: 'Back', target: 'media' },
    fields: [],
  },
};
