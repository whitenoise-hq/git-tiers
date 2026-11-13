/**
 * 개인정보 처리방침 본문.
 * 실제 코드가 수집·저장하는 항목과 맞춰야 한다(firebase/users.ts, next-auth 세션, GoogleAdSense).
 * 내용을 바꾸면 EFFECTIVE_DATE 를 갱신하고 공지사항에 알린다.
 */

/** 시행일 */
export const EFFECTIVE_DATE = '2026-11-13';

/** 개인정보 보호책임자 연락 이메일. 비어 있으면 GitHub 프로필로 안내한다. */
export const PRIVACY_CONTACT_EMAIL = '';
export const PRIVACY_OFFICER = 'devwoodie';
export const PRIVACY_OFFICER_GITHUB = 'https://github.com/devwoodie';

export interface PolicyTable {
  readonly head: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

export interface PolicySection {
  readonly heading: string;
  readonly paragraphs?: readonly string[];
  readonly items?: readonly string[];
  readonly table?: PolicyTable;
  /** 이 절 아래에 개인정보 보호책임자 연락처를 표시한다 */
  readonly showOfficer?: boolean;
}

export interface PolicyContent {
  readonly label: string;
  readonly title: string;
  readonly intro: string;
  readonly effectiveLabel: string;
  readonly contactLabel: string;
  readonly sections: readonly PolicySection[];
}

const ko: PolicyContent = {
  label: 'Privacy',
  title: '개인정보 처리방침',
  intro:
    'Git TIERS(이하 「서비스」)는 이용자의 개인정보를 소중히 다루며, 「개인정보 보호법」 등 관련 법령을 지킵니다. 이 방침은 서비스가 어떤 정보를 왜 처리하고, 언제 파기하는지 알려 드립니다.',
  effectiveLabel: '시행일',
  contactLabel: '연락처',
  sections: [
    {
      heading: '1. 처리하는 개인정보 항목과 수집 방법',
      paragraphs: ['서비스는 GitHub 계정으로 로그인할 때 필요한 최소한의 정보만 처리합니다. 별도 회원가입 양식은 없습니다.'],
      table: {
        head: ['구분', '항목', '수집 방법·저장 위치'],
        rows: [
          ['회원 정보', 'GitHub 사용자 고유번호(숫자 ID), GitHub 아이디', 'GitHub 로그인 시 자동 수집 · 서비스 데이터베이스'],
          ['서비스 이용 정보', '첫·마지막 로그인 시각, 뱃지 표시 설정(유형·텍스트·배경색), 최근 1년 GitHub 기여 수', '서비스 이용 과정에서 생성 · 서비스 데이터베이스'],
          ['세션 정보', '이름, 이메일, 프로필 이미지, 회사, 지역, 소개, GitHub 접근 토큰', 'GitHub 로그인 시 수집 · 이용자 브라우저의 암호화된 로그인 쿠키(서버 데이터베이스에 저장하지 않음)'],
          ['브라우저 설정', '화면 언어', '이용자 브라우저 저장소(localStorage)'],
        ],
      },
    },
    {
      heading: '2. 개인정보의 처리 목적',
      items: [
        'GitHub 계정을 이용한 로그인과 본인 확인',
        'GitHub 기여 수에 따른 티어 산정과 README 뱃지 이미지 제공',
        '마이페이지에서 프로필과 뱃지 설정 표시',
        '랭킹 화면 제공(상위 순위에는 일부를 가린 GitHub 아이디와 티어만 표시하며 기여 수는 공개하지 않음)',
      ],
      paragraphs: ['위 목적 외의 용도(마케팅, 프로필 분석 등)로는 이용하지 않습니다.'],
    },
    {
      heading: '3. 보유 기간과 파기',
      items: [
        '회원 정보와 서비스 이용 정보는 회원 탈퇴 시 지체 없이(즉시) 데이터베이스에서 삭제합니다.',
        '탈퇴 시 GitHub 계정과 서비스의 연결(OAuth 권한)도 함께 해제합니다.',
        '세션 정보는 로그아웃하면 삭제되며, 로그아웃하지 않아도 최대 30일 뒤 만료됩니다.',
        '전자적 파일은 복구할 수 없는 방법으로 삭제하며, 관련 법령에 따라 따로 보관해야 하는 정보는 없습니다.',
      ],
    },
    {
      heading: '4. 개인정보의 제3자 제공',
      paragraphs: [
        '서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다.',
        '다만 이용자가 README에 넣은 뱃지 이미지는 GitHub 아이디로 누구나 볼 수 있으며, 뱃지에는 티어와 최근 1년 기여 수(GitHub에 이미 공개된 정보)가 표시됩니다.',
        '랭킹 화면에는 상위 3명의 일부를 가린 GitHub 아이디(예: dev***ie)와 티어가 표시되며, 누구나 볼 수 있습니다.',
      ],
    },
    {
      heading: '5. 개인정보 처리 위탁과 국외 이전',
      paragraphs: [
        '서비스 운영을 위해 아래 사업자의 클라우드 서비스를 이용하며, 이 과정에서 개인정보가 국외 서버에 저장·처리될 수 있습니다. 정보는 서비스 이용 시 네트워크를 통해 전송됩니다.',
      ],
      table: {
        head: ['받는 자', '국가', '항목', '목적', '보유 기간'],
        rows: [
          ['Google LLC (Firebase Cloud Firestore)', '미국 등 Google Cloud 데이터센터', '회원 정보, 서비스 이용 정보', '데이터 저장', '회원 탈퇴 시까지'],
          ['Vercel Inc.', '미국 등', '요청 처리 중 회원·세션 정보', '웹 서비스 운영(서버 실행)', '요청 처리 중 일시적'],
          ['GitHub, Inc.', '미국', 'GitHub 아이디, 접근 토큰', '로그인 인증, 기여 수 조회', '서비스는 별도 보관하지 않음'],
        ],
      },
      items: [
        '국외 이전을 원하지 않으면 서비스 이용을 중단하고 회원 탈퇴할 수 있습니다. 이 경우 서비스를 이용할 수 없습니다.',
      ],
    },
    {
      heading: '6. 쿠키와 광고',
      items: [
        '로그인 상태를 유지하기 위해 필수 쿠키(암호화된 세션 쿠키)를 사용합니다.',
        '마이페이지에는 Google AdSense 광고가 표시되며, Google은 광고 제공을 위해 쿠키를 사용할 수 있습니다. 맞춤 광고는 Google 광고 설정(adssettings.google.com)에서 끌 수 있습니다.',
        '브라우저 설정에서 쿠키를 차단할 수 있으나, 이 경우 로그인이 필요한 기능을 이용할 수 없습니다.',
      ],
    },
    {
      heading: '7. 이용자의 권리와 행사 방법',
      items: [
        '열람: 마이페이지에서 서비스가 보유한 정보를 확인할 수 있습니다.',
        '삭제·처리 정지: 마이페이지의 「회원 탈퇴」로 즉시 삭제할 수 있습니다.',
        'GitHub 연결 해제: GitHub 설정 > Applications(github.com/settings/applications)에서도 직접 해제할 수 있습니다.',
        '그 밖의 요청은 아래 개인정보 보호책임자에게 연락하면 지체 없이 처리합니다.',
      ],
    },
    {
      heading: '8. 개인정보의 안전성 확보 조치',
      items: [
        '데이터베이스는 서버에서만 서비스 계정으로 접근하며, 브라우저에서의 직접 접근은 보안 규칙으로 모두 차단합니다.',
        '로그인 세션과 GitHub 접근 토큰은 암호화된 쿠키에 담아 전달하며, 모든 통신은 HTTPS로 암호화합니다.',
        '서비스 운영에 필요한 최소한의 정보만 저장합니다.',
      ],
    },
    {
      heading: '9. 개인정보 보호책임자',
      showOfficer: true,
      paragraphs: ['개인정보 관련 문의, 불만, 피해 구제 요청은 아래로 연락해 주세요.'],
    },
    {
      heading: '10. 처리방침의 변경',
      paragraphs: ['이 방침을 바꾸는 경우 시행 7일 전부터 공지사항으로 알립니다.'],
    },
  ],
};

const en: PolicyContent = {
  label: 'Privacy',
  title: 'Privacy Policy',
  intro:
    'Git TIERS ("the Service") values your privacy and complies with applicable laws, including the Personal Information Protection Act of Korea. This policy explains what information we process, why, and when we delete it.',
  effectiveLabel: 'Effective date',
  contactLabel: 'Contact',
  sections: [
    {
      heading: '1. Information we process and how we collect it',
      paragraphs: ['We only process the minimum information needed to sign you in with GitHub. There is no separate sign-up form.'],
      table: {
        head: ['Category', 'Items', 'Collection · Storage'],
        rows: [
          ['Account', 'GitHub user ID (numeric), GitHub username', 'Collected on GitHub sign-in · Service database'],
          ['Usage', 'First/last sign-in time, badge settings (type, text, background), GitHub contributions in the last year', 'Created while using the Service · Service database'],
          ['Session', 'Name, email, profile image, company, location, bio, GitHub access token', 'Collected on GitHub sign-in · Encrypted sign-in cookie in your browser (not stored in our database)'],
          ['Browser settings', 'Display language', 'Your browser storage (localStorage)'],
        ],
      },
    },
    {
      heading: '2. Purposes',
      items: [
        'Signing in and identifying you with your GitHub account',
        'Calculating your tier from GitHub contributions and serving your README badge',
        'Showing your profile and badge settings on My Page',
        'Providing the Ranking page (top ranks show only a partially hidden GitHub username and tier; contribution counts are not shown)',
      ],
      paragraphs: ['We do not use your information for any other purpose, such as marketing or profiling.'],
    },
    {
      heading: '3. Retention and deletion',
      items: [
        'Account and usage information is deleted from our database immediately when you delete your account.',
        'Deleting your account also revokes the connection (OAuth authorization) between your GitHub account and the Service.',
        'Session information is removed when you sign out, and expires after at most 30 days.',
        'Data is deleted in a way that cannot be recovered. No information is retained for legal obligations.',
      ],
    },
    {
      heading: '4. Sharing with third parties',
      paragraphs: [
        'We do not provide your personal information to third parties.',
        'Badge images you add to your README can be viewed by anyone via your GitHub username. Badges show your tier and contributions in the last year, which GitHub already makes public.',
        'The Ranking page shows the partially hidden GitHub username (e.g. dev***ie) and tier of the top 3 users, and anyone can view it.',
      ],
    },
    {
      heading: '5. Processors and international transfer',
      paragraphs: [
        'We use the cloud services below to operate the Service, and your information may be stored or processed on servers outside Korea. Data is transferred over the network while you use the Service.',
      ],
      table: {
        head: ['Recipient', 'Country', 'Items', 'Purpose', 'Retention'],
        rows: [
          ['Google LLC (Firebase Cloud Firestore)', 'United States and other Google Cloud regions', 'Account and usage information', 'Data storage', 'Until account deletion'],
          ['Vercel Inc.', 'United States and others', 'Account and session information during requests', 'Running the web service', 'Temporarily while handling requests'],
          ['GitHub, Inc.', 'United States', 'GitHub username, access token', 'Sign-in, fetching contributions', 'Not stored by the Service'],
        ],
      },
      items: ['If you do not agree to the transfer, you can stop using the Service and delete your account.'],
    },
    {
      heading: '6. Cookies and advertising',
      items: [
        'We use an essential, encrypted session cookie to keep you signed in.',
        'My Page shows Google AdSense ads, and Google may use cookies to serve them. You can turn off personalized ads in Google Ad Settings (adssettings.google.com).',
        'You can block cookies in your browser, but features that require sign-in will not work.',
      ],
    },
    {
      heading: '7. Your rights',
      items: [
        'Access: you can see the information we hold on My Page.',
        'Deletion: use "Delete account" on My Page to delete it immediately.',
        'Disconnecting GitHub: you can also revoke access in GitHub Settings > Applications (github.com/settings/applications).',
        'For any other request, contact the privacy officer below and we will respond without delay.',
      ],
    },
    {
      heading: '8. Security measures',
      items: [
        'The database is accessed only from our servers with a service account; direct access from browsers is blocked by security rules.',
        'Sessions and GitHub access tokens are carried in encrypted cookies, and all traffic is encrypted with HTTPS.',
        'We store only the minimum information needed to run the Service.',
      ],
    },
    {
      heading: '9. Privacy officer',
      showOfficer: true,
      paragraphs: ['Please contact us for privacy questions, complaints, or requests for remedies.'],
    },
    {
      heading: '10. Changes to this policy',
      paragraphs: ['We will announce changes on the Notice page at least 7 days before they take effect.'],
    },
  ],
};

export const PRIVACY_CONTENT = { ko, en } as const;
