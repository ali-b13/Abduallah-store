import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    mobile: string;
    isAdmin:boolean
  }

  interface Session {
    user: {
      id: string;
      mobile: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    mobile: string;
  }
}