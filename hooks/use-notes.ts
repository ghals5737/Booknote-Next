import { NoteResponse, NoteResponsePage } from '@/lib/types/note/note';
import useSWR from 'swr';
import { useNextAuth } from './use-next-auth';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

// SWR fetcher 함수 (타임아웃 및 에러 처리 강화)
const fetcher = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    const json = await response.json();
    return json.data;
  } finally {
    clearTimeout(timeout);
  }
};

export function useNotes(page: number, size: number) {
  const { user } = useNextAuth();

  const key = user?.id && NEXT_PUBLIC_API_URL
    ? `${NEXT_PUBLIC_API_URL}/api/v1/notes/users/${user.id}?page=${page}&size=${size}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<NoteResponsePage | NoteResponse[]>(
    key,
    fetcher
  );

  // 배열 응답(List)과 페이지 응답(Page) 모두 지원
  const notes: NoteResponse[] = Array.isArray(data)
    ? data
    : (data?.content || []);

  const pagination = !Array.isArray(data) && data
    ? {
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        size: data.size,
        number: data.number,
        first: data.first,
        last: data.last,
        numberOfElements: data.numberOfElements,
        empty: data.empty
      }
    : null;

  return {
    notes,
    pagination,
    isLoading,
    error,
    mutateNotes: mutate
  };
}

export function useAddNote() {
  const addNote = async (noteData: {
    bookId: number;
    title: string;
    content: string;
    tagList: string[];
  }) => {
    const response = await fetch('/api/v1/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      throw new Error('노트 추가에 실패했습니다.');
    }

    return response.json();
  };

  return { addNote };
}

export function useDeleteNote() {
  const deleteNote = async (noteId: number) => {
    const response = await fetch(`/api/v1/notes/${noteId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('노트 삭제에 실패했습니다.');
    }
  };

  return { deleteNote };
}
