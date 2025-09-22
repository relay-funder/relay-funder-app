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
    title: 'Your Campaign Creation',
    description: (
      <>
        <p>
          Welcome to the campaign creation page! Here, you have the opportunity
          to bring your project to life by creating a compelling campaign that
          can attract funding from supporters. This form will guide you through
          the essential steps to set up your campaign, including providing a
          captivating title, a detailed description, relevant metadata, funding
          specifics, media uploads, and a timeline for your project.
        </p>

        <p>How the Campaign Process Works</p>
        <ul>
          <li>
            Submit: Once you fill out the form and submit your campaign, it will
            enter the review stage.
          </li>
          <li>
            Pending: Your campaign will be reviewed by our team to ensure it
            meets our guidelines and standards.
          </li>
          <li>
            Approved: Upon approval, your campaign will be live and visible to
            potential backers.
          </li>
          <li>
            Shared by You: Promote your campaign through your networks to reach
            a wider audience and gather support.
          </li>
          <li>
            Receive Funding: As backers contribute to your campaign, you will
            see the funds accumulate.
          </li>
          <li>
            Campaign Ends: Once the campaign period concludes, we will finalize
            the funding process.
          </li>
          <li>
            Payout: After the campaign ends, the funds will be disbursed to you,
            allowing you to start working on your project!
          </li>
        </ul>
        <p>
          We’re excited to see your ideas come to life and support you on this
          journey!
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
          <b>description</b> for your campaign. These elements are crucial as
          they will be the first impression potential backers have of your
          project. A compelling title and a clear description can significantly
          impact your campaign&apos;s success.
        </p>

        <h3>Title</h3>
        <p>
          Your title should be <b>concise</b> and <b>catchy</b>, capturing the
          essence of your project in just a few words. Aim for something that
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
    next: { label: 'Next', submit: false, target: 'meta' },
    prev: { label: 'Back', target: 'introduction' },
    fields: ['title', 'description'],
  },
  meta: {
    title: 'Location and Category',
    description: (
      <div>
        <p>
          In this step, you will provide essential <b>metadata</b>, specify the{' '}
          <b>location</b>, and select a <b>category</b> for your campaign. This
          information is vital as it helps our platform filter and display your
          campaign in the appropriate channels, making it easier for potential
          backers to find and support your project.
        </p>

        <h3>Metadata</h3>
        <p>
          Metadata includes key details that describe your campaign and enhance
          its visibility. This may include:
        </p>
        <ul>
          <li>
            <b>Funding Goal</b>: The total amount you aim to raise.
          </li>
          <li>
            <b>Campaign Duration</b>: The length of time your campaign will be
            active.
          </li>
          <li>
            <b>Rewards</b>: Any incentives you plan to offer backers for their
            support.
          </li>
        </ul>
        <p>
          Providing accurate and detailed metadata will help potential backers
          understand your campaign better and encourage them to contribute.
        </p>

        <h3>Location</h3>
        <p>
          Specifying a location for your campaign is important for several
          reasons:
        </p>
        <ul>
          <li>
            It helps backers understand the geographical context of your
            project.
          </li>
          <li>
            It allows you to connect with local supporters who may be more
            inclined to contribute.
          </li>
          <li>
            It can enhance the visibility of your campaign in location-based
            searches.
          </li>
        </ul>

        <h3>Category</h3>
        <p>
          Selecting the right category for your campaign is crucial for
          effective filtering and discovery. Categories help potential backers
          find projects that align with their interests. Consider the following
          common categories:
        </p>
        <ul>
          <li>
            <b>Art & Music</b>: Projects related to creative arts, performances,
            or music production.
          </li>
          <li>
            <b>Technology</b>: Innovations, gadgets, or software development.
          </li>
          <li>
            <b>Community</b>: Initiatives aimed at improving local communities
            or social causes.
          </li>
          <li>
            <b>Education</b>: Projects focused on learning, teaching, or
            educational resources.
          </li>
        </ul>
        <p>
          By accurately filling out the metadata, location, and category, you
          will increase the chances of your campaign being discovered by the
          right audience, ultimately leading to greater support and funding.
        </p>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'media' },
    prev: { label: 'Back', target: 'description' },
    fields: ['location', 'category'],
  },
  media: {
    title: 'Media',
    description: (
      <div>
        <p>
          In this step, you will select a <b>main image</b> for your campaign.
          This image will be prominently displayed across the platform in
          various sizes, making it a crucial element for attracting potential
          backers. A compelling visual can significantly enhance the appeal of
          your campaign and draw more attention.
        </p>

        <h3>Image Selection</h3>
        <p>When choosing your main image, consider the following:</p>
        <ul>
          <li>
            <b>Quality</b>: High-quality images are essential. They not only
            look more professional but also convey the seriousness and
            credibility of your project. A well-chosen image can evoke emotions
            and create a connection with potential backers.
          </li>
          <li>
            <b>Relevance</b>: Ensure that the image represents your project
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
          likelihood of attracting backers.
        </p>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'funding' },
    prev: { label: 'Back', target: 'meta' },
    fields: ['bannerImage'],
  },
  funding: {
    title: 'Funding',
    description: (
      <div>
        <p>
          In this step, you will define the <b>funding goal</b> for your
          campaign. This should reflect the total funding needed to successfully
          complete your campaign.
        </p>

        <p>
          Be realistic and consider all costs involved, including production,
          marketing, and any rewards you plan to offer backers.
        </p>

        <h3>Flexible Funding</h3>
        <p>
          Your campaign uses <b>flexible funding</b>, which means you&apos;ll
          receive all funds raised at the end of your campaign, regardless of
          whether you reach your funding goal. This allows your campaign to
          benefit from any amount of support you receive.
        </p>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'timeline' },
    prev: { label: 'Back', target: 'media' },
    fields: ['fundingGoal', 'fundingModel'],
  },
  timeline: {
    title: 'Timeline',
    description: (
      <div>
        <p>
          In this step, you will establish the <b>timeline</b> for your campaign
          by selecting a <b>start date</b> and an <b>end date</b>. Setting a
          clear timeline is essential for planning your promotional efforts and
          ensuring that you have the resources to engage with your backers
          throughout the campaign.
        </p>

        <h3>Start Date</h3>
        <p>
          Choose a <b>start date</b> that allows you enough time to prepare for
          the launch of your campaign. Consider the following factors:
        </p>
        <ul>
          <li>
            <b>Preparation Time</b>: Ensure you have adequate time to finalize
            your campaign details, create promotional materials, and set up your
            channels for outreach.
          </li>
          <li>
            <b>Resource Availability</b>: Make sure you have the necessary
            resources, such as time, personnel, and budget, to effectively
            promote your campaign once it goes live.
          </li>
        </ul>

        <h3>End Date</h3>
        <p>
          Select an <b>end date</b> that aligns with your project goals and
          promotional strategy. Here are some points to consider:
        </p>
        <ul>
          <li>
            <b>Campaign Duration</b>: Determine how long you want your campaign
            to run. A typical duration ranges from 30 to 60 days, but this can
            vary based on your project and audience.
          </li>
          <li>
            <b>Engagement Strategy</b>: Plan how you will keep your contributors
            engaged throughout the campaign. Regular updates, milestones, and
            communication are key to maintaining interest and support.
          </li>
        </ul>

        <h3>Keeping Contributors Engaged</h3>
        <p>
          Throughout the campaign, it’s important to provide updates to your
          backers. This can include:
        </p>
        <ul>
          <li>Progress reports on your project.</li>
          <li>Sharing milestones achieved during the campaign.</li>
          <li>Engaging with backers through comments and messages.</li>
        </ul>

        <p>
          By carefully selecting your start and end dates and planning your
          engagement strategy, you can create a successful timeline that
          maximizes your campaign&apos;s potential.
        </p>
      </div>
    ),
    next: { label: 'Next', submit: false, target: 'summary' },
    prev: { label: 'Back', target: 'funding' },
    fields: ['startTime', 'endTime'],
  },
  summary: {
    title: 'Summary',
    description: (
      <div>
        <p>
          In this final step, you will review a comprehensive <b>summary</b> of
          your campaign as it will be displayed on the platform once approved.
          This is your opportunity to ensure that all the details are accurate
          and compelling before submitting your campaign for review.
        </p>

        <h3>Campaign Overview</h3>
        <p>The summary will include the following key elements:</p>
        <ul>
          <li>
            <b>Title</b>: The catchy title you created for your campaign.
          </li>
          <li>
            <b>Description</b>: A detailed overview of your project, including
            the problem it addresses and your proposed solution.
          </li>
          <li>
            <b>Metadata</b>: Information such as your funding goal, campaign
            duration, and any rewards you plan to offer.
          </li>
          <li>
            <b>Media</b>: The main image you selected, which will represent your
            campaign visually.
          </li>
          <li>
            <b>Funding Model</b>: The chosen funding model for your campaign.
          </li>
          <li>
            <b>Timeline</b>: The start and end dates you set for your campaign.
          </li>
        </ul>

        <h3>Review and Modify</h3>
        <p>
          Take a moment to carefully review each section of your campaign
          summary. Ensure that:
        </p>
        <ul>
          <li>All information is accurate and free of errors.</li>
          <li>
            The title and description effectively convey your project&apos;s
            purpose and appeal.
          </li>
          <li>The funding details align with your project needs.</li>
        </ul>
        <p>
          If you notice any areas that need adjustment, you can easily go back
          and modify the values. Make sure you are completely satisfied with
          your campaign before submitting it for approval.
        </p>

        <h3>Final Thoughts</h3>
        <p>
          Once you are confident that everything is in order, you can proceed to
          submit your campaign. We look forward to supporting you on this
          exciting journey and helping you bring your project to life!
        </p>
      </div>
    ),
    next: { label: 'Submit', submit: true },
    prev: { label: 'Back', target: 'timeline' },
    fields: [],
  },
};
