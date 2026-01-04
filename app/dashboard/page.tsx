import { authOptions } from '@/lib/auth';
import { UserBookResponsePage } from '@/lib/types/book/book';
import { ActivityResponse } from '@/lib/types/dashboard/dashboard';
import { GoalsResponse } from '@/lib/types/goal/goal';
import { StatisticsResponse } from '@/lib/types/statistics/statistics';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

async function getBooksData(): Promise<UserBookResponsePage | null> {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.accessToken) {
            return null;
        }
        
        // 서버 컴포넌트에서 직접 백엔드 API 호출
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';
        const response = await fetch(`${baseUrl}/api/v1/user/books?page=0&size=10`,
          {
            headers: {
              'Authorization': `Bearer ${session.accessToken}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );

        if (!response.ok) {
            console.error('Failed to fetch books data:', response.status, response.statusText);
            return null;
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching books data:', error);
        return null;
    }
}

async function getStatisticsData(): Promise<StatisticsResponse | null> {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.accessToken) {
            return null;
        }
        
        // 서버 컴포넌트에서 직접 백엔드 API 호출
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';
        const response = await fetch(`${baseUrl}/api/v1/stats/me`,
          {
            headers: {
              'Authorization': `Bearer ${session.accessToken}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );

        if (!response.ok) {
            console.error('Failed to fetch statistics data:', response.status, response.statusText);
            return null;
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching statistics data:', error);
        return null;
    }
}

async function getGoalsData(): Promise<GoalsResponse | null> {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.accessToken) {
            return null;
        }
        
        // 서버 컴포넌트에서 직접 백엔드 API 호출
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';
        const response = await fetch(`${baseUrl}/api/v1/goals`,
          {
            headers: {
              'Authorization': `Bearer ${session.accessToken}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );

        if (!response.ok) {
            // 404는 목표가 없는 경우이므로 null 반환 (에러 아님)
            if (response.status === 404) {
                return null;
            }
            console.error('Failed to fetch goals data:', response.status, response.statusText);
            return null;
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching goals data:', error);
        return null;
    }
}

async function getRecentActivities(): Promise<ActivityResponse[]> {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.accessToken) {
            return [];
        }
        
        // 서버 컴포넌트에서 직접 백엔드 API 호출
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';
        const response = await fetch(`${baseUrl}/api/v1/dashboard/activities?limit=3`,
          {
            headers: {
              'Authorization': `Bearer ${session.accessToken}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );

        if (!response.ok) {
            // 404는 활동이 없는 경우이므로 빈 배열 반환 (에러 아님)
            if (response.status === 404) {
                return [];
            }
            console.error('Failed to fetch recent activities:', response.status, response.statusText);
            return [];
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        return [];
    }
}

async function getUserName(): Promise<string | null> {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.accessToken) {
            return null;
        }
        
        // 서버 컴포넌트에서 직접 백엔드 API 호출
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';
        const response = await fetch(`${baseUrl}/api/v1/users/profile`,
          {
            headers: {
              'Authorization': `Bearer ${session.accessToken}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );

        if (!response.ok) {
            console.error('Failed to fetch profile:', response.status, response.statusText);
            return null;
        }

        const result = await response.json();
        if (result.success && result.data?.user) {
            const user = result.data.user;
            // nickname이 있으면 nickname을, 없으면 name을 반환
            return user.nickname || user.name || null;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching user name:', error);
        return null;
    }
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    redirect('/auth');
  }

  const booksData = await getBooksData();
  const statisticsData = await getStatisticsData();
  const goalsData = await getGoalsData();
  const recentActivities = await getRecentActivities();
  const userName = await getUserName();
  
  if (!booksData) {
    // 기본값으로 빈 데이터 제공
    const emptyData: UserBookResponsePage = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
      first: true,
      last: true,
      numberOfElements: 0,
      empty: true,
      pageable: {
        pageNumber: 0,
        pageSize: 10,
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
    return <DashboardClient booksData={emptyData} statisticsData={statisticsData} goalsData={goalsData} recentActivities={recentActivities || []} userName={userName} />;
  }
  
  console.log('booksData', booksData);    
  return <DashboardClient booksData={booksData} statisticsData={statisticsData} goalsData={goalsData} recentActivities={recentActivities} userName={userName} />
}