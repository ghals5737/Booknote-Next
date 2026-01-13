import { ActionTabs } from '@/components/home/action-tabs';
import { BookClubTrends } from '@/components/home/book-club-trends';
import { HomeGreeting } from '@/components/home/home-greeting';
import { RecentActivityList } from '@/components/home/recent-activity-list';
import { TodayReviewCard } from '@/components/home/today-review-card';
import { authOptions } from '@/lib/auth';
import { UserBookResponsePage } from '@/lib/types/book/book';
import { ActivityResponse } from '@/lib/types/dashboard/dashboard';
import { getServerSession } from 'next-auth';

async function getTodayReviewCount(): Promise<number> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return 0;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';
    const response = await fetch(`${baseUrl}/api/v1/reviews/today`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': '*/*',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return 0;
    }

    const result = await response.json();
    // data가 단일 Review 객체인 경우 배열로 변환
    const reviewData = result.data;
    const reviews = reviewData ? [reviewData] : [];
    
    // Review 객체에서 실제 복습 항목 개수 추출
    if (reviews.length > 0 && reviews[0].items) {
      return reviews[0].items.length;
    }
    
    return reviews.length;
  } catch (error) {
    console.error('Failed to fetch today reviews:', error);
    return 0;
  }
}

async function getUserName(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return null;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';
    const response = await fetch(`${baseUrl}/api/v1/users/profile`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    if (result.success && result.data?.user) {
      const user = result.data.user;
      return user.nickname || user.name || null;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch user name:', error);
    return null;
  }
}

async function getRecentActivities(): Promise<ActivityResponse[]> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return [];
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';
    const response = await fetch(`${baseUrl}/api/v1/dashboard/activities?limit=4`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
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

async function getBooksData(): Promise<UserBookResponsePage | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return null;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';
    const response = await fetch(`${baseUrl}/api/v1/user/books?page=0&size=100`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

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

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userName = session ? await getUserName() : null;
  const reviewCount = session ? await getTodayReviewCount() : 0;
  const recentActivities = session ? await getRecentActivities() : [];
  const booksData = session ? await getBooksData() : null;

  const books = booksData?.content || [];

  return (
    <main className="min-h-screen bg-[#F4F2F0]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 인사말 섹션 */}
        <HomeGreeting userName={userName || undefined} />

        {/* 액션 탭 버튼 */}
        <ActionTabs books={books} />

        {/* 오늘의 복습 카드 */}
        {session && (
          <TodayReviewCard reviewCount={reviewCount} />
        )}

        {/* 북클럽 트렌드 섹션 */}
        <BookClubTrends />

        {/* 최근 활동 섹션 */}
        <RecentActivityList activities={recentActivities} />
      </div>
    </main>
  );
}
