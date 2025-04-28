import { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import {PrismaAdapter} from "@next-auth/prisma-adapter"
import prisma from "@/lib/database/prisma"
import bcrypt from "bcrypt"
import { loginSchema } from "@/lib/security/input-sanitizer"

export const authConfig ={
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),
    Credentials({
      name: "credentials",
      credentials: {
        mobile: { label: "Mobile Number", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials:any) {  // Add req parameter even if unused
        try {
          const { mobile, password } = await loginSchema.parseAsync(credentials);
          
          const user = await prisma.user.findUnique({
            where: { mobile }});
      
          if (!user) return null;
          
          const isValid = await bcrypt.compare(password, user.password);
          console.log(isValid,'vaild')
          if (!isValid || user.isBlocked) return null;
      
          return user
          
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.mobile=user.mobile
        token.isAdmin = user.isAdmin;  // Add isAdmin to JWT
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user = {
          ...session.user,
          id: token.id,
          mobile:token.mobile,
          isAdmin: token.isAdmin  // Add isAdmin to session
        };
      }
      return session;
    }
  }
} satisfies NextAuthOptions

