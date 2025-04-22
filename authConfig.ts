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
      async authorize(credentials) {
        try {
          const { mobile, password } = await loginSchema.parseAsync(credentials);
          const user = await prisma.user.findUnique({
            where: { mobile },
            select: {
              id: true,
              isBlocked:true,
              name: true,
              password: true,
              mobile: true,
              isAdmin: true
            }
          });

          if (!user) return null;
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) return null;
          if(user.isBlocked){
            return null
          }
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          });
          return {
            id: user.id,
            name: user.name,
            mobile: user.mobile,
            isAdmin: user.isAdmin  // Ensure this is returned
          };
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
        token.isAdmin = user.isAdmin;  // Add isAdmin to JWT
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user = {
          ...session.user,
          id: token.id,
          isAdmin: token.isAdmin  // Add isAdmin to session
        };
      }
      return session;
    }
  }
} satisfies NextAuthOptions

