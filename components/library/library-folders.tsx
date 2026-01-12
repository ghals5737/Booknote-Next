'use client';

import { Folder } from 'lucide-react';

interface FolderData {
  id: string;
  name: string;
  count: number;
  color: string;
}

interface LibraryFoldersProps {
  folders: FolderData[];
  onFolderClick?: (folderId: string) => void;
}

export function LibraryFolders({ folders, onFolderClick }: LibraryFoldersProps) {
  if (folders.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-[#2C2622]">폴더</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onFolderClick?.(folder.id)}
            className="group flex flex-col items-center gap-3 rounded-xl border border-[#EAEAEA] bg-white p-4 text-center transition-all hover:shadow-md"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg ${folder.color}`}
            >
              <Folder className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-medium text-[#2C2622]">{folder.name}</div>
              <div className="text-xs text-[#8C8C8C]">{folder.count}권</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
