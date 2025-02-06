import { cn } from "@/lib/utils";

interface TimelineItemProps {
    date: Date;
    title: string;
    content: string;
    isLast?: boolean;
}

export function TimelineItem({ date, title, content, isLast }: TimelineItemProps) {
    return (
        <div className="relative grid grid-cols-5 gap-4 py-6 group">
            {/* Vertical Line */}
            {!isLast && (
                <div className="absolute left-[50px] sm:left-[120px] top-[70px] h-[calc(100%-32px)] w-[2px] bg-gradient-to-b from-green-500/50 to-blue-500/10 group-hover:from-blue-600/50 group-hover:to-blue-600/10 transition-colors duration-500" />
            )}

            {/* Circle Marker */}
            {/* <div className="absolute left-0 sm:left-[52px] top-[24px] h-4 w-4 rounded-full border-2 border-blue-500 bg-white shadow-sm group-hover:border-blue-600 transition-colors duration-500" /> */}

            {/* Date */}
            <div className="col-span-1 text-sm font-medium text-gray-500 text-right pr-8 pt-[24px]">
                {new Date(date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
            </div>

            {/* Content */}
            <div className="col-span-4 rounded-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-lg">
                <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-500">
                        {title}
                    </h3>
                    <div className="prose max-w-none">
                        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                            {content}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface TimelineProps {
    items: Array<{
        id: string;
        title: string;
        content: string;
        createdAt: Date;
    }>;
    className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
    return (
        <div className={cn("relative", className)}>
            {items.map((item, index) => (
                <TimelineItem
                    key={item.id}
                    date={item.createdAt}
                    title={item.title}
                    content={item.content}
                    isLast={index === items.length - 1}
                />
            ))}
        </div>
    );
} 