'use client';

interface LibraryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string }[];
}

export function LibraryTabs({ activeTab, onTabChange, tabs }: LibraryTabsProps) {
  return (
    <div className="mb-6 flex gap-6 border-b border-[#EAEAEA]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative pb-3 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'text-[#2C2622]'
              : 'text-[#8C8C8C] hover:text-[#4A4A4A]'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4E4036]" />
          )}
        </button>
      ))}
    </div>
  );
}
