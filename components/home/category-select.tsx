import { useState, useCallback } from 'react';
import { useActiveCategories } from '@/lib/hooks/useCategories';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

export function HomeCategorySelect({
  onSelected,
}: {
  onSelected: (category: string | null) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: categoriesData, isLoading, error } = useActiveCategories();

  const onSelect = useCallback(
    (categoryId: string | null) => {
      setSelectedCategory(categoryId ?? null);
      onSelected(categoryId ?? null);
    },
    [onSelected, setSelectedCategory],
  );

  // Show error state or loading fallback (fallback to no categories)
  if (error || isLoading) {
    return (
      <div className="mb-8 p-4">
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            key="all"
            variant="outline"
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2',
              'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
            onClick={() => onSelect(null)}
          >
            <div className="text-2xl">🌟</div>
            All Categories
          </Button>
        </div>
      </div>
    );
  }

  const categories = categoriesData?.categories || [];

  return (
    <div className="flex flex-wrap justify-center gap-3 p-4">
      <Button
        key="all"
        variant="outline"
        className={cn(
          'flex items-center gap-2 rounded-full px-4 py-2',
          !selectedCategory
            ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            : 'bg-card text-foreground hover:bg-secondary/50',
        )}
        onClick={() => onSelect(null)}
      >
        <div className="text-2xl">🌟</div>
        All Categories
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant="outline"
          className={cn(
            'flex items-center gap-2 rounded-full px-4 py-2',
            selectedCategory === category.id
              ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              : 'bg-card text-foreground hover:bg-secondary/50',
          )}
          onClick={() => onSelect(category.id)}
        >
          <div className="text-2xl">{category.icon}</div>
          {category.name}
        </Button>
      ))}
    </div>
  );
}
