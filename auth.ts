import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from "zod";
import { authConfig } from './auth.config';

//import { getUser } from "@/app/server/api/auth/auth";
import GoogleProvider from "next-auth/providers/google";


export const {handlers: {GET, POST}, auth, signIn, signOut} = NextAuth({
    ...authConfig,
    providers: [Credentials({
        async authorize(credentials) {
            const parsedCredentials = z
                .object({email: z.string().email(), password: z.string().min(6)})
                .safeParse(credentials);

            if (parsedCredentials.success) {
                const {email, password} = parsedCredentials.data;

                // 간단한 데모용 인증: 비밀번호 규칙만 통과하면 로그인 허용
                // 실제 서비스에서는 DB 조회 및 해시 검증이 필요합니다.
                if (typeof password === 'string' && password.length >= 6) {
                    return {
                        id: email,
                        name: email.split('@')[0] || 'User',
                        email,
                        image: undefined,
                    };
                }
            }
            console.log('Invalid credentials');
            return null;
        },
    }),
        ...(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET ? [
            GoogleProvider({
                clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
            })
        ] : []),

    ],
    secret: process.env.NEXTAUTH_SECRET || (() => {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('NEXTAUTH_SECRET must be set in production');
        }
        return 'development-secret-key-change-in-production';
    })(),


});