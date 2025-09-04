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
                // const user = await getUser(email);

                // if (!user) return null;

                // return user
                // const passwordsMatch = await bcrypt.compare(password, user.password);
                //
                // if (passwordsMatch) return user;

            }
            console.log('Invalid credentials');
            return null;
        },
    }),
        GoogleProvider({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        }),

    ],
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here-please-change-this-in-production",


});