import { authOptions } from '@/lib/auth';
import { UserBookResponsePage } from '@/lib/types/book/book';
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
        
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9500';
        console.log('baseUrl', baseUrl);
        console.log('session.accessToken', session.accessToken);
        const response = await fetch(`${baseUrl}/api/v1/user/books?page=0&size=10`,
          {
            headers: {
              'Authorization': `Bearer ${session.accessToken}`,
            },
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
        
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9500';
        const response = await fetch(`${baseUrl}/api/v1/stats/me`,
          {
            headers: {
              'Authorization': `Bearer ${session.accessToken}`,
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

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    redirect('/auth');
  }

  const booksData = await getBooksData();
  const statisticsData = await getStatisticsData();
  
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
    return <DashboardClient booksData={emptyData} statisticsData={statisticsData} />;
  }
  
  console.log('booksData', booksData);    
  return <DashboardClient booksData={booksData} statisticsData={statisticsData} />
}