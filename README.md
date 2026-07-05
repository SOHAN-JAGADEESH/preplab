# 🔥 PREP LAB — High-Protein Meal Prep Engine

A production React app built from **The Meal Prep Cookbook V2** by Jalalsamfit. All **104
recipes** were extracted from the source PDF — macros, grouped ingredients, step-by-step
methods, and the real food photography.

Built with **Vite + React**, ready to deploy to any static host (Vercel, Netlify, GitHub
Pages, Cloudflare Pages, S3, …).

## Features

- **Recipe Library** — 104 cards over the real food photos, calories + P/C/F + a live
  protein-% ring. Search (titles *and* ingredients), filter by protein source / dish type /
  cuisine, toggles for 50g+ protein, under-500-cal, spicy, favourites, "fits my goals". Sort
  six ways.
- **Recipe detail** — grouped ingredients, tickable numbered method, the book's
  **Important Cooking Notes** (84 recipes have them), and a **serving scaler** that
  live-rescales every quantity.
- **Dietary profile** — hide protein sources you don't eat (tap to hide Beef, Shrimp, etc.,
  or use presets like *No red meat* / *Pescatarian*). Applies everywhere — library, search,
  auto-fill, and the add-to-plan picker.
- **Macro targets** — built-in TDEE calculator (Mifflin–St Jeor) or enter your own numbers.
- **Weekly Planner** — each slot is **one serving** you eat that day; the **＋/−** on a meal
  sets how many servings (recipes batch-cook 4–5). Per-day calorie bars + macro/day vs goal,
  and **⚡ Auto-fill** a whole week to hit your targets.
- **Auto Shopping List** — every ingredient from your planned week, **rounded up to whole
  batches** (you can only cook a whole batch), resolved against the cookbook's own
  **Master Grocery List** (7 categories — Meats, Dairy, Produce, Spices & Seasonings,
  Pantry, Noodles & Pasta, Other — ranked by frequency, exactly like the book). Every
  recipe ingredient line was mapped offline to a canonical item + parsed quantity
  (`src/data/ingredientMap.json`), so the runtime does zero fuzzy string parsing.
  Check-off, copy, and per-item "used in N recipes" hints included.

State (favourites, plan, goals, checked items) persists in `localStorage`.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build & deploy

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

Deploy the `dist/` folder to any static host. `vite.config.js` uses `base: './'`, so it works
from a domain root or a sub-path (e.g. GitHub Pages project sites) without changes.

## Project layout

```
index.html               # Vite entry
src/
  main.jsx                # React bootstrap
  App.jsx                 # shell, view routing, modals
  store.jsx               # global state + localStorage (Context)
  styles.css              # "Ember Kitchen Lab" design system
  data/recipes.json       # 104 recipes extracted from the PDF
  lib/                    # recipes (tags), macros, shopping canonicaliser, format, planner
  components/             # TopBar, Hero, FilterBar, RecipeCard, RecipeModal,
                          # GoalsDrawer, PlannerView, ShoppingView, AddToPlan, Ring
public/recipes/           # 104 web-optimised food photos (~14 MB)
```

## Data pipeline

Recipe text + the hero photo for each recipe were extracted from the PDF with PyMuPDF.
The parser is **font-aware**: it reads span-level font metadata to tell ingredient group
headers (DMSans-9ptRegular 11pt) from item text (DMSans-Light 10pt), wrapped lines, and
`»` column-continuation markers — so two-column pages and wrapped ingredients parse
correctly. Steps are split on the book's `S T E P n` / `F I N A L S T E P` markers, and
each recipe's *Important Cooking Notes* section is captured in a `notes` field.

The shopping engine's `src/data/ingredientMap.json` was also generated offline: all
~1,185 unique ingredient lines were resolved to canonical items from the book's
**Master Grocery List (Ranked by Frequency)**, with quantities pre-parsed into unit
families (mass/volume/spoons/count). Tags (protein source, dish type, cuisine,
spicy/high-protein/low-cal) are derived in `src/lib/recipes.js` at load time.
