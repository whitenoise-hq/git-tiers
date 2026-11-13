import GitHubProvider from "next-auth/providers/github";
import NextAuth from 'next-auth';
import { upsertUserOnLogin } from '../../../../../firebase/users';

interface GithubProfile {
  id: number;
  login: string;
  company?: string | null;
  location?: string | null;
  bio?: string | null;
}

const fetchGithubProfile = async (accessToken: string): Promise<GithubProfile | null> => {
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.id === 'number' && typeof data?.login === 'string' ? data : null;
  } catch {
    return null;
  }
};

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: "read:user",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      const isSignIn = !!account?.access_token;
      if (isSignIn) {
        token.accessToken = account.access_token;
      }

      // 로그인할 때, 그리고 숫자 ID 도입 전에 만들어진 세션(githubId 없음)은 한 번 더 GitHub 정보를 채운다.
      const needsProfile = isSignIn || (!token.githubId && !!token.accessToken);
      if (!needsProfile) {
        return token;
      }

      const profile = await fetchGithubProfile(token.accessToken as string);
      if (!profile) {
        return token;
      }

      const githubId = String(profile.id);
      token.githubId = githubId;
      token.loginId = profile.login;
      token.company = profile.company ?? null;
      token.location = profile.location ?? null;
      token.bio = profile.bio ?? null;

      if (isSignIn) {
        try {
          await upsertUserOnLogin({ githubId, login: profile.login });
        } catch {
          // 저장에 실패해도 로그인은 계속한다.
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.loginId = token.loginId as string;
      session.user = {
        ...session.user,
        company: token.company as string | null,
        location: token.location as string | null,
        bio: token.bio as string | null,
      };
      return session;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
  }
})

export { handler as GET, handler as POST }
