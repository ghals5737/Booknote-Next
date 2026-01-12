'use client';

interface HomeGreetingProps {
  userName?: string;
}

export function HomeGreeting({ userName = '독서가' }: HomeGreetingProps) {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return '좋은 아침이에요';
    } else if (hour >= 12 && hour < 18) {
      return '좋은 오후에요';
    } else if (hour >= 18 && hour < 22) {
      return '좋은 저녁이에요';
    } else {
      return '늦은 밤이네요';
    }
  };

  const greeting = getTimeBasedGreeting();

  return (
    <div className="mb-8">
      <h1 className="mb-3 text-4xl font-bold text-[#2C2622]">
        {greeting}, {userName}님
      </h1>
      <p className="text-lg text-[#4A4A4A]">
        오늘은 어떤 책을 읽으실 건가요?
      </p>
    </div>
  );
}
