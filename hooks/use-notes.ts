import { NoteResponsePage } from '@/lib/types/note/note';
import useSWR from 'swr';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

// SWR fetcher 함수
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const data = await response.json();
  return data.data;
};

export function useNotes(page: number, size: number) {
  const { data, error, isLoading, mutate } = useSWR<NoteResponsePage>(
    `${NEXT_PUBLIC_API_URL}/api/v1/notes/users/1?page=${page}&size=${size}`,
    fetcher
  );

  return {
    notes: data?.content || [],
    pagination: data ? {
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      size: data.size,
      number: data.number,
      first: data.first,
      last: data.last,
      numberOfElements: data.numberOfElements,
      empty: data.empty
    } : null,
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
