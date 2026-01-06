import Script from 'next/script';

interface StructuredDataProps {
  data: object;
  id: string;
}

/**
 * Component for rendering JSON-LD structured data
 * Uses Next.js Script component's strategy for safe JSON injection
 * Avoids dangerouslySetInnerHTML entirely
 */
export function StructuredData({ data, id }: StructuredDataProps) {
  return (
    <Script id={id} type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(data)}
    </Script>
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
