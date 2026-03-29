# Quiz UX Redesign

Redesign all four quiz screens (landing, question, email gate, result) for better viewport fit, taller layout, and improved question UX — while preserving the retro terminal/game aesthetic.

## Context

Side-by-side comparison with a reference quiz (Basecamp Coffee) revealed three UX gaps in the current bip-quiz question screen: no progress indicator, small answer tap targets, and a layout that doesn't fill the viewport well. The landing, email gate, and result screens share the same undersized feeling.

## Overarching Changes (all screens)

- **Full viewport height**: every screen uses `min-height: 100dvh` with flexbox centering so content fills the page naturally on desktop and mobile.
- **Wider max-width**: bump card container from 420px to 480px for more breathing room.
- **Generous padding**: increase internal card padding to 28–32px (from 24px).
- **Consistent vertical rhythm**: more space between sections inside cards.
- **Brand label**: centered "BOTS IN PUBLIC" micro-label above the card on every screen.

## Screen 1: Landing / Intro

**Structure stays the same:**
- PacMan canvas animation at top
- Terminal prompt line: `$ bots-in-public --quiz`
- Headline: "What level Claude user are you?"
- Subtext
- CTA button: `[ find my level → ]`

**Changes:**
- Taller animation area (more vertical space for PacMan)
- Increased card padding to match new rhythm
- `min-height: 100dvh` centering
- Wider max-width (480px)
- No progress dots (quiz hasn't started)

## Screen 2: Questions

**Layout (top to bottom):**
1. BiP brand label (centered, above card)
2. Card with two zones:
   - **Animation panel** (top): full-width canvas animation area with scanline overlay. Progress dots overlaid at the bottom edge of this panel.
   - **Question body** (bottom): question text + answer options

**Progress dots:**
- 6 dots, one per question
- Filled orange = completed
- Glowing orange (with `box-shadow`) = current question
- Hollow with faint orange border = upcoming
- Positioned absolutely at bottom of animation panel, centered

**Answer cards:**
- 14px vertical padding (up from 10px)
- Radio circle indicator on the left (26px diameter, 1.5px border)
  - Unselected: hollow circle, faint orange border
  - Selected: filled circle, bright orange border, orange background tint, subtle outer glow
- 8px border-radius (up from 6px)
- 10px gap between options (up from 8px)
- Monospace font, 14px
- Hover state: light orange border transition (0.15s)
- After selection: 150ms delay then advance (existing behavior)

**Canvas animations:** all 6 existing animations stay (Pong, Space Invaders, Terminal, Signal, Boot, Tetris). No changes to animation logic.

## Screen 3: Email Gate

**Changes:**
- Same taller card treatment (480px max-width, 28–32px padding, 100dvh centering)
- Blurred result preview stays as-is
- Input field padding increased to match answer card height
- Button padding increased to match
- Progress dots visible: all 6 filled (quiz complete, collecting email)
- Dots positioned at the top of the card (no animation panel on this screen, so dots sit just below the blurred preview area)

## Screen 4: Result

**Changes:**
- Same taller card treatment (480px max-width, more padding, 100dvh centering)
- No progress dots (flow is complete)

**Stays the same:**
- Hero image with gradient overlay
- Level badge + number + name
- Typewriter tagline animation
- Description text
- Waitlist confirmation box
- Share / retake buttons
- 6-step progressive reveal animation sequence and timings

## What Does NOT Change

- Canvas animation component (`RetroAnimation.tsx`) — no logic changes
- Scoring algorithm (`lib/scoring.ts`)
- Quiz data/questions (`lib/data.ts`)
- Email gate / Substack integration
- Result reveal animation sequence
- Color palette, fonts, all theme tokens in `lib/theme.ts`
- Dark terminal aesthetic
- Layout file (`layout.tsx`)

## Architecture

- All changes are in `app/page.tsx` (styling and layout adjustments)
- Progress dots are simple inline JSX — no new component file needed
- May add 1–2 new spacing values to `lib/theme.ts` if needed
- No new dependencies
