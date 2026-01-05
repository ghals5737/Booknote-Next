'use client';

interface GreetingProps {
  userName?: string;
}

export function Greeting({ userName = '독서가' }: GreetingProps) {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return {
        greeting: '좋은 아침이에요',
        message: '오늘은 어떤 책을 읽으실 건가요?',
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        greeting: '좋은 오후에요',
        message: '잠시 책과 함께 여유로운 시간을 보내보세요.',
      };
    } else if (hour >= 18 && hour < 22) {
      return {
        greeting: '좋은 저녁이에요',
        message: '하루를 마무리하며 책 한 구절은 어떠세요?',
      };
    } else {
      return {
        greeting: '늦은 밤이네요',
        message: '조용한 밤, 독서하기 좋은 시간입니다.',
      };
    }
  };

  const { greeting, message } = getTimeBasedGreeting();

  return (
    <div className="mb-10">
      <h1 className="mb-2 font-serif text-3xl font-semibold text-foreground">
        {greeting}, {userName}님
      </h1>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

