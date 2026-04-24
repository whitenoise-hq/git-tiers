import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const [isLogin, setIsLogin] = useState(false);
  const [userImg, setUserImg] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session) {
      setIsLogin(true);
      setUserImg(session?.user?.image ?? '');
    } else {
      setIsLogin(false);
      setUserImg('');
    }
  }, [status, session]);

  const handleGitLogin = async () => {
    await signIn('github', { callbackUrl: '/my' });
  };

  return { session, isLogin, userImg, handleGitLogin };
};