"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Book, LogIn, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

interface LoginRequiredProps {
  title?: string;
  description?: string;
  features?: string[];
}

export function LoginRequired({
  title = "로그인이 필요한 서비스입니다",
  description = "독서 통계와 개인화된 기능을 이용하려면 로그인해주세요.",
  features = [
    "독서 통계 및 분석",
    "개인 서재 관리",
    "독서 노트 및 인용구 저장",
    "독서 목표 설정 및 추적"
  ]
}: LoginRequiredProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">독서 통계</h1>
        <p className="text-muted-foreground">당신의 독서 여정을 한눈에 확인하세요</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="text-muted-foreground">{description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />
            
            {/* Features Preview */}
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-3">로그인하면 이용할 수 있는 기능</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Statistics Preview */}
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-3">예시 통계 화면</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <Book className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground">읽고 있는 책</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <Star className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground">중요 노트</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">0%</div>
                  <div className="text-xs text-muted-foreground">완독률</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <BarChart3 className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground">이번 달 노트</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link href="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  로그인하기
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/signup">
                  회원가입하기
                </Link>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                이미 계정이 있으신가요?{" "}
                <Link href="/auth" className="text-primary hover:underline">
                  로그인
                </Link>
                {" "}또는{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  회원가입
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
