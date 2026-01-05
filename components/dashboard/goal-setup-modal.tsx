'use client';

import { BookOpen, Calendar, Target, X } from 'lucide-react';
import { useState } from 'react';

interface GoalSetupModalProps {
  onClose: () => void;
  onSave: (goalData: {
    type: 'monthly' | 'yearly';
    targetValue: number;
  }) => void;
}

export function GoalSetupModal({ onClose, onSave }: GoalSetupModalProps) {
  const [goalType, setGoalType] = useState<'monthly' | 'yearly'>('monthly');
  const [targetValue, setTargetValue] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (targetValue < 1) {
      alert('목표는 최소 1권 이상이어야 합니다.');
      return;
    }

    onSave({
      type: goalType,
      targetValue,
    });
  };

  const presetValues = goalType === 'monthly' 
    ? [3, 5, 10, 15] 
    : [12, 24, 36, 52];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-border/50 bg-background/95 shadow-2xl backdrop-blur-md">
        {/* 헤더 */}
        <div className="relative border-b border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 px-8 py-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold">
                독서 목표 설정
              </h2>
              <p className="text-sm text-muted-foreground">
                꾸준한 독서 습관을 만들어보세요
              </p>
            </div>
          </div>
        </div>

        {/* 바디 */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* 목표 타입 선택 */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-medium">
              목표 기간
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGoalType('monthly')}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  goalType === 'monthly'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card'
                }`}
              >
                <Calendar className={`h-6 w-6 ${
                  goalType === 'monthly' ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <div className="text-center">
                  <div className="font-medium">월간 목표</div>
                  <div className="text-xs text-muted-foreground">
                    매달 새로운 시작
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGoalType('yearly')}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  goalType === 'yearly'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card'
                }`}
              >
                <BookOpen className={`h-6 w-6 ${
                  goalType === 'yearly' ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <div className="text-center">
                  <div className="font-medium">연간 목표</div>
                  <div className="text-xs text-muted-foreground">
                    1년 동안의 도전
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 목표 권수 선택 */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-medium">
              목표 권수
            </label>
            
            {/* 프리셋 버튼 */}
            <div className="mb-4 grid grid-cols-4 gap-2">
              {presetValues.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTargetValue(value)}
                  className={`rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${
                    targetValue === value
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card'
                  }`}
                >
                  {value}권
                </button>
              ))}
            </div>

            {/* 직접 입력 */}
            <div className="relative">
              <input
                type="number"
                min="1"
                max="999"
                value={targetValue}
                onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border-2 border-border/50 bg-card/50 px-4 py-3 text-center font-serif text-2xl font-semibold transition-colors focus:border-primary focus:bg-card focus:outline-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                권
              </div>
            </div>

            {/* 예상 안내 */}
            <div className="mt-3 rounded-lg bg-secondary/30 p-3">
              <p className="text-xs text-muted-foreground">
                {goalType === 'monthly' && (
                  <>
                    한 달 동안 <span className="font-semibold text-foreground">{targetValue}권</span>을 읽으면,{' '}
                    <span className="font-semibold text-foreground">
                      {Math.ceil(30 / targetValue)}일마다 1권
                    </span>
                    씩 완독해야 해요.
                  </>
                )}
                {goalType === 'yearly' && (
                  <>
                    1년 동안 <span className="font-semibold text-foreground">{targetValue}권</span>을 읽으면,{' '}
                    <span className="font-semibold text-foreground">
                      {Math.ceil(365 / targetValue)}일마다 1권
                    </span>
                    씩 완독해야 해요.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-border/50 bg-card/50 px-6 py-3 font-medium transition-colors hover:bg-card"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              목표 설정하기
            </button>
          </div>
        </form>

        {/* 격려 메시지 */}
        <div className="border-t border-border/50 bg-gradient-to-br from-primary/5 to-transparent px-8 py-4">
          <p className="text-center text-sm text-muted-foreground">
            "작은 목표라도 괜찮아요. 꾸준함이 가장 중요합니다." 📚
          </p>
        </div>
      </div>
    </div>
  );
}

