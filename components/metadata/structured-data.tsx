import Script from 'next/script';

interface StructuredDataProps {
  data: object;
  id: string;
}

/**
 * Sanitize JSON for safe injection into script tags
 * Prevents XSS by escaping HTML-sensitive characters
 */
function sanitizeJsonForScript(data: object): string {
  return JSON.stringify(data).replace(/[<>&]/g, (char) => {
    const escapeMap: Record<string, string> = {
      '<': '\\u003c',
      '>': '\\u003e',
      '&': '\\u0026',
    };
    return escapeMap[char];
  });
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
        __html: sanitizeJsonForScript(data),
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
