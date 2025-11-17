'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ImageIcon, Sparkles } from 'lucide-react';
import Link from "next/link";

export default function AddBookPage() {
    return (
        <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          내 서재로 돌아가기
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">새 책 추가</h1>
          <p className="text-muted-foreground">
            읽고 싶은 책이나 읽고 있는 책을 추가해보세요.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Left Section - Book Cover */}
          <div className="space-y-4">
            <div>
              <h2 className="mb-3 text-lg font-semibold">책 표지</h2>
              <div className="flex aspect-[3/4] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
                <div className="text-center">
                  <ImageIcon className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">표지 이미지</p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="coverUrl" className="text-sm font-medium">
                표지 URL
              </Label>
              <Input
                id="coverUrl"
                type="url"
                placeholder="이미지 URL을 입력하세요"
                className="mt-1.5"
              />
            </div>

            <Button variant="outline" className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              AI로 표지 생성
            </Button>
          </div>

          {/* Right Section - Book Information */}
          <div className="space-y-6 rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">책 정보</h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  책 제목
                </Label>
                <Input
                  id="title"
                  placeholder="책 제목을 입력하세요"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="author" className="text-sm font-medium">
                  저자
                </Label>
                <Input
                  id="author"
                  placeholder="저자명을 입력하세요"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="category" className="text-sm font-medium">
                  카테고리
                </Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self-help">자기계발</SelectItem>
                    <SelectItem value="dev">개발</SelectItem>
                    <SelectItem value="history">역사</SelectItem>
                    <SelectItem value="novel">소설</SelectItem>
                    <SelectItem value="psychology">심리학</SelectItem>
                    <SelectItem value="business">비즈니스</SelectItem>
                    <SelectItem value="science">과학</SelectItem>
                    <SelectItem value="essay">에세이</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pages" className="text-sm font-medium">
                  총 페이지
                </Label>
                <Input
                  id="pages"
                  type="number"
                  placeholder="총 페이지 수"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                책 설명
              </Label>
              <Textarea
                id="description"
                placeholder="책에 대한 간단한 설명을 입력하세요"
                className="mt-1.5 min-h-[120px] resize-none"
                maxLength={500}
              />
              <p className="mt-1.5 text-sm text-muted-foreground">0/500자</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/">취소</Link>
          </Button>
          <Button>
            <span className="mr-1">+</span>
            책 추가하기
          </Button>
        </div>
      </div>
    </div>
    )
}