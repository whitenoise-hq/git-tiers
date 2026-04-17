import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    loginId: string;
    expires: string;
    user: {
      email: string;
      image: string;
      name: string;
      company: string | null;
      location: string | null;
      bio: string | null;
    }
  }
}
