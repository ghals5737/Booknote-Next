import { authOptions } from '@/lib/auth';
import { ActivityResponse } from '@/lib/types/dashboard/dashboard';
import { PageResponse } from '@/lib/types/pagenation/pagenation';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ActivitiesClient } from './ActivitiesClient';

async function getActivities(
  page: number = 0,
  size: number = 20,
  type?: string,
  sort: string = 'createdDate,desc'
): Promise<PageResponse<ActivityResponse> | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return null;
    }
    
    // 서버 컴포넌트에서 직접 백엔드 API 호출
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
      ...(type && { type }),
    });
    
    const url = `${baseUrl}/api/v1/user-activities?${queryParams.toString()}`;
    console.log('[getActivities] 호출 URL:', url);
    
    const response = await fetch(url,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch activities:', response.status, response.statusText);
      // 404 에러는 활동이 없는 경우일 수 있으므로 null 반환
      if (response.status === 404) {
        console.warn('활동 데이터를 찾을 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.');
        return null;
      }
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    // 네트워크 오류 등
    if (error instanceof Error) {
      console.error('에러 상세:', error.message);
    }
    return null;
  }
}

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; size?: string; type?: string; sort?: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    redirect('/auth');
  }

  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 0;
  const size = params.size ? parseInt(params.size, 10) : 20;
  const type = params.type;
  const sort = params.sort || 'createdDate,desc';

  const activitiesData = await getActivities(page, size, type, sort);
  
  if (!activitiesData) {
    // 기본값으로 빈 데이터 제공
    const emptyData: PageResponse<ActivityResponse> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 20,
      number: 0,
      first: true,
      last: true,
      numberOfElements: 0,
      empty: true,
      pageable: {
        pageNumber: 0,
        pageSize: 20,
        sort: {
          empty: true,
          sorted: false,
          unsorted: true,
        },
        offset: 0,
        paged: true,
        unpaged: false,
      },
      sort: {
        empty: true,
        sorted: false,
        unsorted: true,
      },
    };
    return <ActivitiesClient activitiesData={emptyData} currentType={type} />;
  }
  
  return <ActivitiesClient activitiesData={activitiesData} currentType={type} />;
}

