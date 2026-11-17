<div align="center">

<img src="public/tiers/9_challenger.png" width="96" alt="Challenger" />

# Git TIERS

### Your GitHub. Your Tier.

GitHub 기여를 **Iron**부터 **Challenger**까지 티어로 바꿔 드립니다.<br/>
README에 태그 하나만 넣어 두면, 기여할 때마다 **티어가 알아서 바뀝니다.**

<br/>

<a href="https://git-tiers.devwoodie.com"><img src="https://img.shields.io/badge/%EB%82%B4_%ED%8B%B0%EC%96%B4_%ED%99%95%EC%9D%B8%ED%95%98%EA%B8%B0-0071e3?style=for-the-badge" alt="내 티어 확인하기" /></a>
<a href="https://git-tiers.devwoodie.com/ranking"><img src="https://img.shields.io/badge/%EB%9E%AD%ED%82%B9-1c1c1e?style=for-the-badge" alt="랭킹" /></a>
<a href="https://git-tiers.devwoodie.com/tiers"><img src="https://img.shields.io/badge/%ED%8B%B0%EC%96%B4_%ED%91%9C-1c1c1e?style=for-the-badge" alt="티어 표" /></a>

<br/><br/>

<a href="https://github.com/whitenoise-hq/git-tiers/actions/workflows/ci.yml"><img src="https://github.com/whitenoise-hq/git-tiers/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
<img src="https://img.shields.io/github/package-json/v/whitenoise-hq/git-tiers?color=0071e3&label=version" alt="version" />

[English](./README.md) · **한국어**

</div>

<br/>

<div align="center">

<a href="https://git-tiers.devwoodie.com"><img src="https://git-tiers.devwoodie.com/api/tier/devwoodie" alt="Git TIERS 배지 예시" /></a>

<sub>실제로 동작하는 배지예요. 지금 이 순간 GitHub에서 받아 온 숫자입니다.</sub>

</div>

<br/>

## 왜 Git TIERS인가요?

| | |
| --- | --- |
| 🔄 **알아서 최신 상태** | 배지가 보일 때마다 GitHub에서 기여 수를 가져옵니다. 한 번 넣어 두면 다시 와서 저장할 필요가 없어요. |
| 🎨 **내 스타일대로** | 카드형 · 엠블럼형, 텍스트 표시 여부, 기본 색 또는 **원하는 배경색**까지. 바꾸면 바로 저장됩니다. |
| 🏆 **랭킹** | Git TIERS 사용자 중 내 순위와, 다음 단계까지 남은 기여 수를 확인하세요. |
| 🔒 **개인정보 우선** | 공개 랭킹에는 기여 수도, 전체 인원도 없습니다. 일부를 가린 아이디와 티어만 보여 드려요. |

기여 수는 **최근 1년(12개월)** 기준이며, GitHub 프로필에 표시되는 숫자와 같습니다(커밋, 이슈, PR, 코드 리뷰 등).

<br/>

## 사용 방법

**1. 로그인** — [git-tiers.devwoodie.com](https://git-tiers.devwoodie.com)에서 GitHub로 로그인<br/>
**2. 꾸미기** — 마이페이지에서 배지를 고르면 바로 저장<br/>
**3. 태그 복사** — 프로필 README에 붙여 넣기

```html
<a href="https://github.com/whitenoise-hq/git-tiers">
  <img src="https://git-tiers.devwoodie.com/api/tier/내_GitHub_아이디" alt="Git-TIERS" />
</a>
```

끝입니다. 새 기여는 알아서 반영돼요(기여 수는 몇 시간 동안 캐시됩니다).

<br/>

## 티어 표

9개 티어, 티어마다 4단계 — 첫 커밋부터 정상까지 36단계.

| | 티어 | 4 | 3 | 2 | 1 |
| :-: | --- | --: | --: | --: | --: |
| <img src="public/tiers/9_challenger.png" width="32" /> | **Challenger** | 4,800 | 5,300 | 5,800 | 6,300+ |
| <img src="public/tiers/8_grandmaster.png" width="32" /> | **Grandmaster** | 3,200 | 3,600 | 4,000 | 4,400 |
| <img src="public/tiers/7_master.png" width="32" /> | **Master** | 2,000 | 2,300 | 2,600 | 2,900 |
| <img src="public/tiers/6_diamond.png" width="32" /> | **Diamond** | 1,200 | 1,400 | 1,600 | 1,800 |
| <img src="public/tiers/5_platinum.png" width="32" /> | **Platinum** | 800 | 900 | 1,000 | 1,100 |
| <img src="public/tiers/4_gold.png" width="32" /> | **Gold** | 600 | 650 | 700 | 750 |
| <img src="public/tiers/3_silver.png" width="32" /> | **Silver** | 400 | 450 | 500 | 550 |
| <img src="public/tiers/2_bronze.png" width="32" /> | **Bronze** | 200 | 250 | 300 | 350 |
| <img src="public/tiers/1_iron.png" width="32" /> | **Iron** | 0 | 50 | 100 | 150 |

<sub>각 단계에 필요한 최근 1년 최소 기여 수입니다. 구간까지 나온 전체 표는 <a href="https://git-tiers.devwoodie.com/tiers">git-tiers.devwoodie.com/tiers</a>에서 볼 수 있어요.</sub>

<br/>

## 이렇게 만들었어요

- **Next.js 16** (App Router) · **TypeScript** · **Emotion**
- 배지는 요청할 때마다 **SVG로 그려** 엣지에 캐시합니다
- 기여 수는 서버가 **GitHub GraphQL API**로 직접 조회합니다. 브라우저는 숫자를 보내지 않아요
- **Firebase Firestore**는 Admin SDK로 서버에서만 접근하고, 브라우저 접근은 막아 두었습니다
- 전체 사용자 기여 수는 **GitHub Actions**가 매일 갱신하고, PR마다 CI가 돕니다
- **Vercel**에서 운영합니다


<br/>

## 라이선스

© 2025–2026 devwoodie. **All rights reserved.**

소스 코드는 참고용으로만 공개합니다. 복사·수정·재배포하거나 다른 서비스에 쓰는 것은 허용하지 않습니다.<br/>
마이페이지에서 받은 **내 Git TIERS 배지 태그**는 README나 웹사이트 어디에든 자유롭게 넣을 수 있어요. 자세한 내용은 [LICENSE](./LICENSE)를 보세요.

<div align="center">

<br/>

Made by [devwoodie](https://github.com/devwoodie) · 질문과 아이디어는 [Issues](https://github.com/whitenoise-hq/git-tiers/issues)에 남겨 주세요

</div>
