[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/kuzan-creator/trofi-senja/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/kuzan-creator/trofi-senja/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Sunset Trophy Guide — GTA 6 Platinum Tracker

An offline guide and tracker for all **55 Grand Theft Auto VI (PS5) trophies**: the official names, descriptions and grades, a checklist saved in your browser, a roadmap to the platinum, and a guide to every trophy in my own words, with its sources cited.

Built for [make.fun — Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01).

## Run offline

```sh
node serve.ts --port 8084
# open http://localhost:8084
```

No build step, no network requests at run time. All progress is stored in `localStorage` on your device.

## What is inside

- **55 official trophies** — exact name, description and grade (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden), in `app/data/trophies.json`. Every trophy's `guide` is a single text string.
- **A guide for every trophy, in my own words** — what to do, where, and when it can be missed. Each trophy lists its sources (the official list on Exophase for name, description and grade; PSNProfiles for PSN count targets). Where a place or step has not been checked in-game yet, the guide says so plainly — no location is guessed.
- **Checklist that saves** — tick trophies as you earn them, export your progress as JSON and import it back.
- **Spoiler Shield** — story trophy names and descriptions stay hidden until you earn them (toggle with `s`).
- **Filters and search** — by grade, kind (story, missable, collection, activity, exploration, combat, money), status, and text.
- **Roadmap to Platinum** — the chapters in mission order, progress per chapter, and a **Next Up** planner (the next 5 unearned trophies).
- **Missables** — 21 trophies that can be missed, a missable box on every trophy detail, and 5 points of no return in chapter order.
- **PSN count trackers** — for trophies PSN tracks with a count (250 stunts, 42 shooting range, 14 drone races, 20 races, 8 stranger strands, 18 meditation spots, 3 card sets, 100 WAiNK, 50 challenges, 100 vehicles, 5 bank vaults, 52 areas, 500 choices).
- **Notes per trophy** — saved with your progress.
- **Keyboard shortcuts** — `/` search, `1` checklist, `2` roadmap, `3` missables, `s` spoiler shield, `e` export.
- **Audit strip** — the number of cited claims shown at the top of the page, with a breakdown of the sources.

## Bounty

Built for [make.fun — Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01).
