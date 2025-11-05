import Script from 'next/script';

interface StructuredDataProps {
  data: object;
  id: string;
}

/**
 * Component for rendering JSON-LD structured data
 * Keeps structured data logic separate from page components
 */
export function StructuredData({ data, id }: StructuredDataProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

interface OrganizationStructuredDataProps {
  data: object;
}

/**
 * Specific component for organization structured data
 */
export function OrganizationStructuredData({
  data,
}: OrganizationStructuredDataProps) {
  return <StructuredData data={data} id="organization-structured-data" />;
}

interface CampaignStructuredDataProps {
  data: object;
}

/**
 * Specific component for campaign structured data
 */
export function CampaignStructuredData({ data }: CampaignStructuredDataProps) {
  return <StructuredData data={data} id="campaign-structured-data" />;
}
