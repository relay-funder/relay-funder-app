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
    title: 'Your Round Creation',
    description: (
      <>
        <p>
          Welcome to the round creation page! Configure the campaign round and
          sets the stage for the information you will provide. Understanding the
          purpose and goals of this round is crucial for aligning campaigns with
          funding opportunities. This form will guide you through the essential
          steps to set up your round, including providing a captivating title, a
          detailed description, relevant metadata, funding specifics, media
          uploads, and a timeline.
        </p>
      </>
    ),
    next: { label: 'Lets Go', submit: false, target: 'description' },
    prev: null,
    fields: [],
  },
  description: {
    title: 'Title and Description',
    description: (
      <div>
        <p>
          In this first step, you will provide a <b>title</b> and a{' '}
          <b>description</b> for your round. The title of your round should be
          concise yet descriptive, capturing the essence of the funding
          opportunity. A strong title helps attract the right campaigns
        </p>

        <h3>Title</h3>
        <p>
          Your title should be <b>concise</b> and <b>catchy</b>, capturing the
          essence of the round in just a few words. Aim for something that
          sparks curiosity and encourages people to learn more.
        </p>

        <h4>Descriptive Patterns for Titles:</h4>
        <ul>
          <li>
            Use action words: &quot;Launch,&quot; &quot;Create,&quot;
            &quot;Build&quot;
          </li>
          <li>
            Include the main benefit or goal: &quot;Help Us Build a Community
            Garden&quot;
          </li>
          <li>
            Make it personal: &quot;Join Me in My Journey to Publish My First
            Book&quot;
          </li>
        </ul>

        <h4>Examples:</h4>
        <ul>
          <li>&quot;Empower Local Artists: A Community Art Project&quot;</li>
          <li>
            &quot;Help Us Save Endangered Species: A Wildlife Conservation
            Initiative&quot;
          </li>
        </ul>

        <h3>Description</h3>
        <p>
          The description allows you to elaborate on your project, explaining
          what it is, why it matters, and how backers can help. Aim for clarity
          and passion, and consider the following structure:
        </p>

        <ol>
          <li>
            <b>Introduction</b>: Briefly introduce your project and its purpose.
          </li>
          <li>
            <b>The Problem</b>: Explain the issue or need your project
            addresses.
          </li>
          <li>
            <b>Your Solution</b>: Describe how your project will solve this
            problem.
          </li>
          <li>
            <b>Call to Action</b>: Encourage potential backers to support your
            campaign.
          </li>
        </ol>

        <h4>Descriptive Patterns for Descriptions:</h4>
        <ul>
          <li>Start with a hook: &quot;Imagine a world where...&quot;</li>
          <li>
            Use storytelling: Share a personal anecdote related to your project.
          </li>
          <li>
            Highlight the impact: Explain how their support will make a
            difference.
          </li>
        </ul>

        <h4>Examples:</h4>
        <ul>
          <li>
            &quot;Imagine a world where every child has access to quality
            education. Our project aims to build a library in an underserved
            community, providing resources and a safe space for learning. With
            your support, we can make this dream a reality!&quot;
          </li>
          <li>
            &quot;Every year, millions of plastic bottles end up in our oceans,
            harming marine life. Our initiative seeks to create a recycling
            program that not only reduces waste but also educates the community
            on sustainability. Join us in making a positive change!&quot;
          </li>
        </ul>

        <p>
          By following these guidelines, you can create a compelling title and
          description that resonate with potential backers and inspire them to
          support your campaign.
        </p>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'funding' },
    prev: { label: 'Back', target: 'introduction' },
    fields: ['title', 'description'],
  },
  funding: {
    title: 'Funding',
    description: (
      <div>
        <p>
          In this step, you will define the <b>funding</b> details for your
          round. Specify the total funding amount available for this round. This
          helps applicants gauge the scale of their campaigns and plan
          accordingly.
        </p>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'timeline' },
    prev: { label: 'Back', target: 'description' },
    fields: ['matchingPool'],
  },

  timeline: {
    title: 'Timeline',
    description: (
      <div>
        <p>
          In this step, you will establish the <b>timeline</b> for your round by
          selecting a <b>start date</b> and an <b>end date</b>. Setting a clear
          timeline is essential for planning promotional efforts for applicants.
          You will also be asked to configure a <b>application start date</b>{' '}
          and a <b>application end date</b> which will expose the round to
          possible applicants.
        </p>
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
      <div>
        <p>
          In this step, you will select a <b>logo image</b> for your round. This
          image will be prominently displayed across the platform in various
          sizes, making it a crucial element for attracting potential backers. A
          compelling visual can significantly enhance the appeal of your
          campaign and draw more attention.
        </p>

        <h3>Image Selection</h3>
        <p>When choosing your loog, consider the following:</p>
        <ul>
          <li>
            <b>Quality</b>: High-quality images are essential. They not only
            look more professional but also convey the seriousness and
            credibility of your round. A well-chosen image can evoke emotions
            and create a connection with potential backers.
          </li>
          <li>
            <b>Relevance</b>: Ensure that the image represents your round
            accurately. It should reflect the essence of what you are trying to
            achieve and resonate with your target audience.
          </li>
        </ul>

        <h3>Cropping the Image</h3>
        <p>
          Once you upload your image, you will have the option to crop it. This
          feature allows you to select the best portion of the image that
          captures the most important aspects of your project. Here are some
          tips for effective cropping:
        </p>
        <ul>
          <li>
            <b>Focus on the Subject</b>: Make sure the main subject of your
            image is clearly visible and centered.
          </li>
          <li>
            <b>Avoid Clutter</b>: Remove any distracting elements from the edges
            of the image that may take attention away from the main focus.
          </li>
          <li>
            <b>Aspect Ratio</b>: Keep in mind the aspect ratio required for the
            platform to ensure your image displays correctly in all formats.
          </li>
        </ul>

        <p>
          By selecting a high-quality image and cropping it thoughtfully, you
          will enhance your campaign&apos;s visual appeal and increase the
          likelihood of attracting campaigns.
        </p>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'summary' },
    prev: { label: 'Back', target: 'timeline' },
    fields: ['logo'],
  },

  summary: {
    title: 'Summary',
    description: (
      <div>
        <p>
          In this final step, you will review a comprehensive <b>summary</b> of
          your round as it will be displayed on the platform. This is your
          opportunity to ensure that all the details are accurate and compelling
          before submitting your campaign for review.
        </p>

        <h3>Review and Modify</h3>
        <p>
          Take a moment to carefully review each section of your round summary.
          Ensure that:
        </p>
        <ul>
          <li>All information is accurate and free of errors.</li>
          <li>
            The title and description effectively convey your round&apos;s
            purpose and appeal.
          </li>
          <li>The funding details align with your round needs.</li>
        </ul>
        <p>
          If you notice any areas that need adjustment, you can easily go back
          and modify the values. Make sure you are completely satisfied with
          your round before submitting it.
        </p>
      </div>
    ),
    next: { label: 'Submit', submit: true },
    prev: { label: 'Back', target: 'media' },
    fields: [],
  },
};
