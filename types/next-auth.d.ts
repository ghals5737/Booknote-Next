import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string
      provider: string
    }
  }
  
  interface User {
    id: string
    name: string
    email: string
    image?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string
    id?: string
  }
} 