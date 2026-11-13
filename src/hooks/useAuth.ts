import { useSession, signIn } from 'next-auth/react';

export const useAuth = () => {
  const { data: session, status } = useSession();

  // 세션에서 바로 계산한다(별도 state·effect 로 복사하지 않는다).
  const isLogin = status === 'authenticated' && !!session;
  const userImg = isLogin ? (session?.user?.image ?? '') : '';

  const handleGitLogin = async () => {
    await signIn('github', { callbackUrl: '/my' });
  };

  return { session, isLogin, userImg, handleGitLogin };
};
