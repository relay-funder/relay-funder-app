import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui';

export function CopyText({
  children = <Copy className="h-4 w-4" />,
  title = 'Copied',
  description = 'Text has been copied to your clipboard',
  tooltip,
  text,
  className = 'rounded-full p-1 transition-colors hover:bg-gray-100',
  variant = 'default',
  size = 'icon',
}: {
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
}) {
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
