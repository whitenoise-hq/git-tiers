import "next-auth";

declare module "next-auth" {
  interface Session {
    loginId: string;
    /** 관리자 여부(서버에서 GitHub 숫자 ID 로 판정). 관리자 ID 목록 자체는 내려보내지 않는다. */
    isAdmin?: boolean;
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
