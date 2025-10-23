"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'

interface UserProfile {
  id: string
  email: string
  name: string
  profileImage?: string
  provider: string
  createdAt: string
  lastLoginAt: string
}

interface UserStats {
  totalBooks: number
  readingBooks: number
  finishedBooks: number
  totalNotes: number
  totalQuotes: number
  readingStreak: number
  totalReadingTime: number
}

export default function ProfileClient() {
  //const { logout } = useNextAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    profileImage: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.error('No auth token found')
        return
      }

      const response = await fetch('/api/v1/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProfile(data.data.user)
          setStats(data.data.stats)
          setEditForm({
            name: data.data.user.name,
            profileImage: data.data.user.profileImage || ''
          })
        }
      } else {
        console.error('Failed to fetch profile')
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      let response: Response

      if (selectedFile) {
        // 파일이 존재하면 multipart/form-data로 전송
        const compressed = await compressImage(selectedFile, { maxSize: 1024 * 1024, maxWidth: 512, maxHeight: 512, quality: 0.8 })
        const formData = new FormData()
        formData.append('name', editForm.name)
        formData.append('avatar', compressed)

        response = await fetch('/api/v1/users/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        })
      } else {
        // 파일 없으면 JSON 업데이트
        response = await fetch('/api/v1/users/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editForm),
        })
      }

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProfile(data.data.user)
          setIsEditing(false)
          setSelectedFile(null)
          setPreviewUrl(null)
          // TODO: 토스트 메시지 표시
        }
      }
    } catch (error) {
      console.error('Profile update error:', error)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 기본 용량 제한: 5MB 하드 제한 (업로드 전 거르기)
    const HARD_LIMIT = 5 * 1024 * 1024
    if (file.size > HARD_LIMIT) {
      alert('파일이 너무 큽니다. 5MB 이하 이미지를 선택해주세요.')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function compressImage(file: File, options: { maxSize: number; maxWidth: number; maxHeight: number; quality: number }): Promise<File> {
    // 이미지가 이미 충분히 작으면 그대로 사용
    if (file.size <= options.maxSize) {
      return file
    }

    const bitmap = await createImageBitmap(file)
    const { width, height } = fitSize(bitmap.width, bitmap.height, options.maxWidth, options.maxHeight)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', options.quality))

    // 여전히 너무 크다면 품질을 낮춰 한 번 더 시도 (최대 두 번)
    if (blob.size > options.maxSize) {
      const blob2: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', 0.7))
      if (blob2.size < blob.size) {
        return new File([blob2], renameToJpeg(file.name), { type: 'image/jpeg' })
      }
    }

    return new File([blob], renameToJpeg(file.name), { type: 'image/jpeg' })
  }

  function fitSize(srcW: number, srcH: number, maxW: number, maxH: number) {
    let w = srcW
    let h = srcH
    const ratio = Math.min(maxW / w, maxH / h, 1)
    w = Math.round(w * ratio)
    h = Math.round(h * ratio)
    return { width: w, height: h }
  }

  function renameToJpeg(name: string) {
    if (name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.jpeg')) return name
    const base = name.replace(/\.[^/.]+$/, '')
    return `${base}.jpg`
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch('/api/v1/users/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIsChangingPassword(false)
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
          alert('비밀번호가 변경되었습니다.')
        }
      }
    } catch (error) {
      console.error('Password change error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">프로필을 불러올 수 없습니다</h1>
          <Button onClick={fetchProfile}>다시 시도</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">프로필</h1>
          <p className="text-gray-600">사용자 정보를 관리하고 통계를 확인하세요</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">프로필 정보</TabsTrigger>
            <TabsTrigger value="statistics">읽기 통계</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>기본 정보</CardTitle>
                    <CardDescription>프로필 정보를 수정할 수 있습니다</CardDescription>
                  </div>
                  <Button 
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "취소" : "편집"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.profileImage} />
                    <AvatarFallback className="text-lg">
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{profile.name}</h3>
                    <p className="text-gray-600">{profile.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      {profile.provider === 'email' ? '이메일' : profile.provider}
                    </Badge>
                  </div>
                </div>

                {isEditing && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">이름</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profileImage">프로필 이미지</Label>
                        <div className="space-y-2">
                          <Input
                            id="profileImage"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                          <div className="text-xs text-muted-foreground">최대 5MB, 업로드 시 512x512 이내로 압축됩니다.</div>
                          {(previewUrl || editForm.profileImage) && (
                            <div className="mt-2">
                              <img
                                src={previewUrl || editForm.profileImage}
                                alt="미리보기"
                                className="w-24 h-24 object-cover rounded-full border"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleProfileUpdate}>저장</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        취소
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">가입일</Label>
                    <p className="text-sm">{new Date(profile.createdAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">마지막 로그인</Label>
                    <p className="text-sm">{new Date(profile.lastLoginAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>보안</CardTitle>
                <CardDescription>비밀번호를 변경할 수 있습니다</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                  <DialogTrigger asChild>
                    <Button variant="outline">비밀번호 변경</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>비밀번호 변경</DialogTitle>
                      <DialogDescription>
                        현재 비밀번호를 입력하고 새로운 비밀번호를 설정하세요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">현재 비밀번호</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">새 비밀번호</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                        취소
                      </Button>
                      <Button onClick={handlePasswordChange}>변경</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            {stats && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">총 읽은 책</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.finishedBooks}권</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">읽고 있는 책</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.readingBooks}권</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">총 책 수</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalBooks}권</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">작성한 노트</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalNotes}개</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">저장한 인용구</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalQuotes}개</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">연속 읽기</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.readingStreak}일</div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">총 읽기 시간</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalReadingTime}시간</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
