import { authenticatedApiRequest } from '@/lib/api/auth';
import { NoteResponse, NoteResponsePage } from '@/lib/types/note/note';
import useSWR from 'swr';
import { useNextAuth } from './use-next-auth';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

// SWR fetcher 함수 (새로운 인증 API 사용)
const fetcher = async (url: string) => {
  try {
    const response = await authenticatedApiRequest<NoteResponsePage>(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 개별 노트 조회용 fetcher 함수
const noteFetcher = async (url: string) => {
  try {
    const response = await authenticatedApiRequest<NoteResponse>(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export function useNotes(page: number, size: number) {
  const { user } = useNextAuth();

  const key = user?.id 
    ? `/api/v1/notes/user?page=${page}&size=${size}`
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
    html?: string;
    isImportant?: boolean;
    tagList?: string[];
  }) => {
    const requestData = {
      bookId: noteData.bookId,
      title: noteData.title,
      content: noteData.content,
      html: noteData.html || '',
      isImportant: noteData.isImportant || false,
      tagList: noteData.tagList || []
    };

    try {
      const response = await authenticatedApiRequest<NoteResponse>('/api/v1/notes', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      return response.data;
    } catch (error) {
      throw new Error('노트 추가에 실패했습니다.');
    }
  };

  return { addNote };
}

// 인용구 추가 훅
export function useAddQuote() {
  const addQuote = async (quoteData: {
    bookId: number;
    text: string;
    page?: number;
  }) => {
    const requestData = {
      bookId: quoteData.bookId,
      text: quoteData.text,
      page: quoteData.page ?? null,
    };

    try {
      const response = await authenticatedApiRequest('/api/v1/quotes', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      return response.data;
    } catch (error) {
      throw new Error('인용구 추가에 실패했습니다.');
    }
  };

  return { addQuote };
}

export function useNote(noteId: string) {
  const { user } = useNextAuth();

  const key = user?.id && noteId 
    ? `/api/v1/notes/${noteId}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<NoteResponse>(
    key,
    noteFetcher
  );

  return {
    note: data,
    isLoading,
    error,
    mutateNote: mutate
  };
}

export function useDeleteNote() {
  const deleteNote = async (noteId: number) => {
    const requestData = {
      id: noteId
    };

    try {
      await authenticatedApiRequest('/api/v1/notes', {
        method: 'DELETE',
        body: JSON.stringify(requestData)
      });
      return true;
    } catch (error) {
      throw new Error('노트 삭제에 실패했습니다.');
    }
  };

  return { deleteNote };
}
