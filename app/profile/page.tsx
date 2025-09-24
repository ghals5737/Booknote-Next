import { Metadata } from 'next'
import ProfileClient from './ProfileClient'

export const metadata: Metadata = {
  title: '프로필 | 북노트',
  description: '사용자 프로필 관리',
}

export default function ProfilePage() {
  return <ProfileClient />
}
