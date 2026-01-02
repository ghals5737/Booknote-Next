'use client';

interface BookmarkFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function BookmarkFilter({ categories, activeCategory, onCategoryChange }: BookmarkFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isActive = category === activeCategory;
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`
              relative overflow-hidden rounded-lg px-4 py-2 transition-all duration-200
              ${isActive 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-card text-foreground shadow-sm hover:bg-secondary'
              }
            `}
          >
            {/* 책갈피 모양을 위한 삼각형 노치 효과 */}
            {isActive && (
              <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 bg-primary" />
            )}
            <span className="relative">{category}</span>
          </button>
        );
      })}
    </div>
  );
}

