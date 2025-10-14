'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Calendar,
  Check,
  Clock,
  Eye,
  PlayCircle,
  Target,
  TrendingUp,
  X
} from "lucide-react";
import { useState } from "react";

const ReviewPage = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });

  const reviewCards = [
    {
      id: 1,
      question: "원자 습관에서 말하는 '1% 법칙'이란?",
      answer: "매일 1%씩 개선하면 1년 후 37배 더 나아진다는 복리의 개념. 작은 개선이 시간이 지나면서 놀라운 결과를 만든다.",
      source: "원자 습관 - 제임스 클리어",
      tags: ["자기계발", "습관"],
      difficulty: "medium",
      lastReviewed: "3일 전",
      nextReview: "오늘"
    },
    {
      id: 2,
      question: "인지 부하 이론의 세 가지 유형은?",
      answer: "1. 내재적 부하 (Intrinsic Load) - 과제 자체의 복잡성\n2. 외재적 부하 (Extraneous Load) - 불필요한 정보 처리\n3. 생성적 부하 (Germane Load) - 스키마 구성을 위한 부하",
      source: "교육 심리학 연구",
      tags: ["학습", "심리학"],
      difficulty: "hard",
      lastReviewed: "1주 전",
      nextReview: "오늘"
    },
    {
      id: 3,
      question: "React에서 useEffect의 의존성 배열의 역할은?",
      answer: "의존성 배열에 포함된 값이 변경될 때만 effect가 재실행되도록 제어한다. 빈 배열일 경우 컴포넌트 마운트 시에만 실행된다.",
      source: "React 공식 문서",
      tags: ["개발", "React"],
      difficulty: "easy",
      lastReviewed: "1일 전",
      nextReview: "오늘"
    }
  ];

  const upcomingReviews = [
    { date: "오늘", count: 8, urgent: true },
    { date: "내일", count: 12, urgent: false },
    { date: "모레", count: 5, urgent: false },
    { date: "이번 주", count: 23, urgent: false }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return '보통';
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    setSessionStats(prev => ({
      ...prev,
      [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1,
      total: prev.total + 1
    }));

    // Move to next card
    setTimeout(() => {
      if (currentCard < reviewCards.length - 1) {
        setCurrentCard(currentCard + 1);
        setShowAnswer(false);
      } else {
        setIsReviewing(false);
        // Session complete
      }
    }, 1000);
  };

  const startReview = () => {
    setIsReviewing(true);
    setCurrentCard(0);
    setShowAnswer(false);
    setSessionStats({ correct: 0, incorrect: 0, total: 0 });
  };

  const formatAnswer = (answer: string) => {
    return answer.split('\n').map((line, index) => (
      <div key={index} className="mb-1">{line}</div>
    ));
  };

  if (isReviewing) {
    const card = reviewCards[currentCard];
    const progress = ((currentCard + (showAnswer ? 0.5 : 0)) / reviewCards.length) * 100;

    return (
      <div className="min-h-screen bg-background">
        {/* Review Header */}
        <header className="bg-white border-b border-border sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsReviewing(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  종료
                </Button>
                <div>
                  <h1 className="text-xl font-semibold">복습 세션</h1>
                  <p className="text-sm text-muted-foreground">
                    {currentCard + 1} / {reviewCards.length} 카드
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  정답률: {sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0}%
                </div>
                <div className="w-32">
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Review Card */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card className="knowledge-card shadow-[var(--shadow-knowledge)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getDifficultyColor(card.difficulty)}>
                    {getDifficultyText(card.difficulty)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{card.source}</span>
                </div>
                <div className="flex space-x-1">
                  {card.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-6">
                {/* Question */}
                <div className="text-center py-8">
                  <h2 className="text-2xl font-medium text-foreground mb-4">
                    {card.question}
                  </h2>
                  
                  {!showAnswer ? (
                    <Button 
                      onClick={() => setShowAnswer(true)}
                      className="mt-6"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      답안 보기
                    </Button>
                  ) : (
                    <div className="mt-6">
                      <div className="bg-gradient-warm p-6 rounded-lg text-left">
                        <h3 className="font-medium text-foreground mb-3">답안</h3>
                        <div className="text-foreground leading-relaxed">
                          {formatAnswer(card.answer)}
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-center space-x-4">
                        <Button 
                          variant="outline"
                          onClick={() => handleAnswer(false)}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          틀렸음
                        </Button>
                        <Button 
                          onClick={() => handleAnswer(true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          맞았음
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">복습</h1>
              <Badge variant="secondary">간격 반복 시스템</Badge>
            </div>
            
            <Button onClick={startReview}>
              <PlayCircle className="h-4 w-4 mr-2" />
              복습 시작
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="knowledge-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">오늘 복습할 카드</p>
                  <p className="text-2xl font-bold text-foreground">8</p>
                </div>
                <Brain className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="knowledge-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">이번 주 정답률</p>
                  <p className="text-2xl font-bold text-foreground">87%</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="knowledge-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">연속 복습일</p>
                  <p className="text-2xl font-bold text-foreground">12일</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="knowledge-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">전체 카드</p>
                  <p className="text-2xl font-bold text-foreground">89</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Review */}
          <div className="lg:col-span-2">
            <Card className="knowledge-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>오늘의 복습</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviewCards.map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-1">{card.question}</h3>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <Badge className={getDifficultyColor(card.difficulty) + " text-xs"}>
                            {getDifficultyText(card.difficulty)}
                          </Badge>
                          <span>{card.source}</span>
                          <span>마지막 복습: {card.lastReviewed}</span>
                        </div>
                        <div className="flex space-x-1 mt-2">
                          {card.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full mt-6" onClick={startReview}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  복습 세션 시작 ({reviewCards.length}개 카드)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Review Schedule */}
          <div>
            <Card className="knowledge-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>복습 일정</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingReviews.map((review, index) => (
                    <div key={index} className={`p-3 rounded-lg ${review.urgent ? 'bg-gradient-warm' : 'bg-muted/30'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{review.date}</span>
                        <Badge variant={review.urgent ? "default" : "secondary"}>
                          {review.count}개
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Stats */}
            <Card className="knowledge-card mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>학습 통계</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>이번 주 진행률</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>정답률</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">156</p>
                        <p className="text-xs text-muted-foreground">정답</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">23</p>
                        <p className="text-xs text-muted-foreground">오답</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;