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
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts']),
]);
