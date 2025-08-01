import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';

export function CopyText({
  title = 'Copied',
  description = 'Text has been copied to your clipboard',
  tooltip,
  text,
}: {
  title?: string;
  description?: string;
  tooltip?: string;
  text: string;
}) {
  const { toast } = useToast();
  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    toast({
      title,
      description,
    });
  }, [toast, text, title, description]);
  return (
    <button
      onClick={onCopy}
      className="rounded-full p-1 transition-colors hover:bg-gray-100"
      title={tooltip}
    >
      <Copy className="h-4 w-4" />
    </button>
  );
}
