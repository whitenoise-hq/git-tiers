import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  // Next.js 권장(React·Hooks·접근성·Core Web Vitals) + TypeScript 규칙
  ...nextVitals,
  ...nextTs,
  // 포맷은 Prettier 가 맡으므로 겹치는 규칙은 끈다(마지막에 둔다)
  prettier,
  {
    rules: {
      eqeqeq: 'error',
      'no-var': 'error',
      // react-hooks 7 에서 새로 생긴 규칙. 기존 화면 코드(useScrollFadeIn ref 사용, effect 안 setState)가
      // 걸려 있어 일단 경고로 두고, 컴포넌트를 고친 뒤 error 로 올린다.
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts']),
]);
