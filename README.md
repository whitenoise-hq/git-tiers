<div align="center">

<img src="public/tiers/9_challenger.png" width="96" alt="Challenger" />

# Git TIERS

### Your GitHub. Your Tier.

Turn your GitHub contributions into a tier — from **Iron** to **Challenger**.<br/>
Drop one tag in your README and it **updates itself** every time you contribute.

<br/>

<a href="https://git-tiers.devwoodie.com"><img src="https://img.shields.io/badge/Get_your_tier-0071e3?style=for-the-badge&logoColor=white" alt="Get your tier" /></a>
<a href="https://git-tiers.devwoodie.com/ranking"><img src="https://img.shields.io/badge/Ranking-1c1c1e?style=for-the-badge" alt="Ranking" /></a>
<a href="https://git-tiers.devwoodie.com/tiers"><img src="https://img.shields.io/badge/Tier_table-1c1c1e?style=for-the-badge" alt="Tier table" /></a>

<br/><br/>

<a href="https://github.com/whitenoise-hq/git-tiers/actions/workflows/ci.yml"><img src="https://github.com/whitenoise-hq/git-tiers/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
<img src="https://img.shields.io/github/package-json/v/whitenoise-hq/git-tiers?color=0071e3&label=version" alt="version" />

**English** · [한국어](./README.ko.md)

</div>

<br/>

<div align="center">

<a href="https://git-tiers.devwoodie.com"><img src="https://git-tiers.devwoodie.com/api/tier/devwoodie" alt="Git TIERS badge example" /></a>

<sub>A live badge — this one is fetched from GitHub right now.</sub>

</div>

<br/>

## Why Git TIERS?

| | |
| --- | --- |
| 🔄 **Always up to date** | The badge asks GitHub for your contributions whenever it's shown. Add it once, never come back to save again. |
| 🎨 **Make it yours** | Card or emblem-only, with or without text, preset or **any custom background color**. Changes save automatically. |
| 🏆 **Ranking** | See where you stand among Git TIERS users and how many contributions you need for the next level. |
| 🔒 **Privacy first** | No contribution counts or total user numbers on the public ranking — just a partially hidden username and tier. |

Contributions are counted over the **last 12 months** — the exact number shown on your GitHub profile (commits, issues, pull requests, code reviews and more).

<br/>

## How To Use

**1. Sign in** with GitHub at [git-tiers.devwoodie.com](https://git-tiers.devwoodie.com)<br/>
**2. Customize** your badge on My Page — it's saved as you go<br/>
**3. Copy Tag** and paste it into your profile README

```html
<a href="https://git-tiers.devwoodie.com/?ref=badge">
  <img src="https://git-tiers.devwoodie.com/api/tier/YOUR_GITHUB_ID" alt="Git-TIERS" />
</a>
```

That's it. New contributions show up on their own (counts are cached for a few hours).

<br/>

## Tier Table

9 tiers, 4 levels each — 36 steps from your first commit to the top.

| | Tier | 4 | 3 | 2 | 1 |
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

<sub>Minimum contributions in the last 12 months for each level. See the full table with ranges at <a href="https://git-tiers.devwoodie.com/tiers">git-tiers.devwoodie.com/tiers</a>.</sub>

<br/>

## Under the Hood

- **Next.js 16** (App Router) · **TypeScript** · **Emotion**
- Badges are rendered as **SVG on demand** and cached at the edge
- Contributions come from the **GitHub GraphQL API** on the server — the browser never sends counts
- **Firebase Firestore** via the Admin SDK only; direct client access is blocked
- Daily refresh for everyone with **GitHub Actions**, plus CI on every pull request
- Hosted on **Vercel**


<br/>

## License

© 2025–2026 devwoodie. **All rights reserved.**

The source code is shared for reference only. Copying, modifying, redistributing or using it to run another service is not permitted.<br/>
You're free to put **your own Git TIERS badge** (the tag from My Page) in any README or website. See [LICENSE](./LICENSE).

<div align="center">

<br/>

Made by [devwoodie](https://github.com/devwoodie) · Questions and ideas are welcome in [Issues](https://github.com/whitenoise-hq/git-tiers/issues)

</div>
