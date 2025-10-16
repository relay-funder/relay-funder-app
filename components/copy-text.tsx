import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui';

interface CopyTextProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  tooltip?: string;
  className?: string;
  variant?:
    | 'link'
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  text?: string;
}

export function CopyText({
  children = <Copy className="h-4 w-4" />,
  title = 'Copied',
  description = 'Text has been copied to your clipboard',
  tooltip,
  text,
  className = 'rounded-full p-1 transition-colors hover:bg-primary/10',
  variant = 'outline',
  size = 'icon',
}: CopyTextProps) {
  const { toast } = useToast();
  const onCopy = useCallback(() => {
    if (!text) {
      return;
    }
    navigator.clipboard.writeText(text);
    toast({
      title,
      description,
    });
  }, [toast, text, title, description]);
  if (!text) {
    return null;
  }
  return (
    <Button
      onClick={onCopy}
      className={className}
      variant={variant}
      size={size}
      title={tooltip}
    >
      {children}
    </Button>
  );
}

export function CopyAddress({
  address,
  ...props
}: Omit<CopyTextProps, 'text' | 'tooltip' | 'description' | 'title'> & {
  address?: string;
}) {
  return (
    <CopyText
      text={address}
      tooltip="Copy address"
      title="Address copied"
      description="Address has been copied to your clipboard"
      {...props}
    />
  );
}
