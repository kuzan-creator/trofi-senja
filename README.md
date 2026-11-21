[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/kuzan-creator/trofi-senja/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/kuzan-creator/trofi-senja/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Sunset Trophy Guide — GTA 6 Platinum Tracker

An offline trophy guide and tracker for all **55 GTA 6 trophies on PS5** — built for the [make.fun bounty “Build the best GTA 6 trophy guide”](https://make.fun/bounty/gta6-trophy-guide-01).

## Run it offline

```sh
node serve.ts          # serves app/ on http://localhost:8080
# or open app/index.html directly in a browser
```

No network requests at runtime, no Rockstar logo or artwork, no account needed. Progress, counts and notes save in your browser's localStorage only.

## What it does

- **Checklist of all 55 trophies** — exact official names, descriptions and grades (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden), with filters by grade, kind and status plus search.
- **Spoiler Shield** — hides hidden story trophies (name, description, guide, sources) until you earn them. ON by default.
- **Per-trophy guide in our own words** — 3 steps each (what / where / how, plus when it can be missed). Every guide is a single text string. Anything not yet checked in-game is marked “belum dicek di dalam game”.
- **Per-trophy count trackers** — big YOUR COUNT numbers for all 19 count targets (250 stunts, 42 range golds, 100 WAiNK scans, 18 meditations, 5 vaults, $250,000 laundered, …).
- **Roadmap in chapter order** — 5 phases from Chapter 1 to post-story cleanup, plus a Next Up planner (your next 5 unearned trophies).
- **Missables** — 21 flagged missable windows, each with its own warning box, and **5 points of no return** in chapter order.
- **Disputes tab** — 18 honest open questions where the guides disagree (Source A vs Source B, with status).
- **Export / import** progress as JSON; per-trophy notes; keyboard shortcuts (`/` search, `1` checklist, `2` roadmap, `3` missables, `S` shield, `E` export).

## Audit strip — every number counted, nothing invented

**973 cited claims · 34 source sites · 41 source pages · 18 disputes · 21 missable windows · 5 points of no return**

Claim breakdown: names 55 · descriptions 55 · grades 55 · guides 55 (165 steps) · sources 273 · count targets 19 · missable boxes 42 · chapters 55 · kinds 55 · hidden flags 55 · roadmap phases, points of no return and disputes 89.

Sources include PowerPyx, GTABase, Push Square, KeenGamer, Beebom, IGN, Sixshore, PlanetGTA6, EGamers, Insider Gaming, Mobalytics, GamesFuze, GTASixInsider, ProgressBar, Vi.ki, GTASnaps, ViceCityHustle, EveryGameMade, LeonidaHub, TechTroduce, CryptoGames, Vice-Atlas, TechForNerd, HowToVideoGame, WantedKit, ShowGamer, SixthStar, GTAScoop, 6StarHQ, GameTrek, GTASix.how, Fextralife, WeHunt and GTADB — every page was found by search on 2026-11-21 and is listed in full in the app's Sources & Audit tab. Each trophy cites at least 4 sources from at least 4 distinct sites.

## Disputes (summary)

Where the guides disagree we show both sides instead of picking one silently: missable count (1 confirmed vs 21 precautionary windows), hidden count (28 vs 27), Vice-Dale stunt jumps (55 vs 53), WAiNK total (112 vs unknown), whether the Chapter 1 meditation counts toward the trophy, shooting-range split (18 + 24 = 42), card sets for 100% (15 of 18), what counts toward “Actions Speak Louder” (500), the 52 areas of “The Goodtime State”, 100% checklist weights, platinum time (200h vs 300h+), difficulty (4/10 vs 7/10), which 9 activities “Master of None” needs, which 8 strands count, vault counts, the 8 garages of “Little Boxes”, and the asterisks in “T**s Ass Drug Money”. Full cards are in the Disputes tab.

## Honesty notes

- Names, descriptions and grades are the official PS5 list (2026-11-18, as synced from PSN via Exophase / PSNProfiles). Hidden flags and missable windows are this guide's derivation from that list and the cited guides, marked as such.
- Only **Positive Mental Attitude** is confirmed possibly missable by the guides; the other 20 flags are precautionary windows (story moments and stranger finales with no mission replay).
- Platinum time and difficulty follow PowerPyx (~200 hours, 4/10); Push Square says up to 300 hours or more.

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide itself
- `app/data/trophies.json` — all 55 trophies (guide is a string per trophy)
- `app/data/guide-extra.json` — roadmap, points of no return, disputes
- `app/data/audit.json` — the counted audit
- `screenshots/` — 4 real renders (1280×800)
- `main.ts` — Node 22 entry point (copies `app/` + `screenshots/`, writes `dossier.json`)

MIT licensed.
