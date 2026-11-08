---
name: Kalends
description: Life admin, quietly handled. A European station concourse where your dates arrive on a split-flap board.
colors:
  concourse-black: "#0a0b0c"
  board-housing: "#17191c"
  board-face: "#0f1012"
  rule: "#2c2f34"
  tile-top: "#26282c"
  tile-bottom: "#1f2124"
  flap-white: "#f2efe7"
  platform-dim: "#a9a59c"
  departure-amber: "#ffb000"
  signal-red: "#ff5a43"
  signal-yellow: "#ffc20e"
  signal-yellow-lit: "#ffd23f"
  enamel: "#e7eaea"
  ink: "#0a0b0c"
  ink-soft: "#3b3e42"
  field: "#121316"
  field-border: "#3a3d42"
  control-border: "#3f4247"
  placeholder: "#8f8b83"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.6vw, 5rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 68"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4.6vw, 4rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 68"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1
    fontVariation: "'wdth' 68"
  body-lead:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.625
    fontVariation: "'wdth' 100"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.625
    fontVariation: "'wdth' 100"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.14em"
    fontVariation: "'wdth' 84"
  control:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 750
    letterSpacing: "0.02em"
    fontVariation: "'wdth' 76"
  flap:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "'tnum' 1"
    fontVariation: "'wdth' 72"
rounded:
  signage: "3px"
  housing: "6px"
  stop: "999px"
spacing:
  gutter-sm: "16px"
  gutter: "32px"
  section: "96px"
  section-lg: "128px"
  container: "1320px"
  control-height: "52px"
components:
  button-primary:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.signage}"
    padding: "0 22px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.signal-yellow-lit}"
    textColor: "{colors.ink}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.signal-yellow}"
    rounded: "{rounded.signage}"
    padding: "10px 16px"
  button-outline-hover:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.flap-white}"
    rounded: "{rounded.signage}"
    padding: "0 16px"
    height: "52px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.flap-white}"
    rounded: "{rounded.signage}"
    padding: "0 12px"
    height: "36px"
  chip-hover:
    textColor: "{colors.departure-amber}"
  toggle:
    backgroundColor: "transparent"
    textColor: "{colors.flap-white}"
    rounded: "{rounded.signage}"
    padding: "0 14px"
    height: "40px"
  toggle-checked:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
  board:
    backgroundColor: "{colors.board-housing}"
    rounded: "{rounded.housing}"
    padding: "12px"
---

# Design System: Kalends

Scope: this system covers the whole product: the landing page (`src/app/page.tsx`, `src/app/landing/*`), the account screens (`src/app/login`, `register`, `forgot-password`, `reset-password`, `src/app/auth/*`) and the signed-in app (`src/app/app/*`). Archivo loads once in the root layout and the `station` class sits on `<body>`, so every `--st-*` token in `src/app/station.css` is available everywhere. `src/app/globals.css` maps the role-named utilities (`paper`, `ink`, `line`, `accent`, `amber`, `alert`) onto the same values.

## Overview

**Creative North Star: "The Concourse Departures Board"**

Kalends presents life admin as a European station concourse. Bills, documents and contracts arrive on schedule like trains, and a split-flap board tells you in time. The ground is near-black. A charcoal housing holds a grid of split-flap tiles in warm white, with amber for times and notices and signal red only for things that are due or expired. Away from the board, the page moves through full-bleed fields the way a station does: a signal-yellow announcement field with black type, an enamel-white information panel, and back to the black concourse.

Density is high on the board, where every character sits in its own tile on a strict column grid, and low everywhere else: large condensed headings, short readable paragraphs and wide section padding. One type family, Archivo, carries everything. Its width axis does the work that most systems give to a second typeface. Signage and headings are condensed, reading text is normal width. Arrows, pictograms and the route line are drawn as solid SVG geometry with mitred joins, like printed station signage.

The flaps are the only motion. They turn forward through the drum on load and when an item is added, and the board re-sorts by date. Nothing else on the page animates in.

**Key Characteristics:**
- One family (Archivo); the width axis separates signage (condensed) from reading (normal).
- Full-bleed colour fields: concourse black, signal yellow, enamel white.
- A split-flap board built from real tiles on a container-query column grid.
- Square signage controls (3px), solid SVG arrows and pictograms on yellow or ink plates.
- Tone carries meaning: amber for time, red for due or expired, dim for passive status.

## Colors

A dark station palette: near-black ground, charcoal hardware, warm-white letters and three signal colours that each have one job.

### Primary
- **Signal Yellow** (`signal-yellow`): the colour of action and signage. Used for the primary button, full-bleed announcement and timetable fields (always with ink type), the pictogram and arrow plates, the wordmark's trailing full stop, focus outlines, the checked toggle state, text selection and the terminus stop on the route line. **Signal Yellow Lit** (`signal-yellow-lit`) is the hover state of the primary button only.

### Secondary
- **Departure Amber** (`departure-amber`): time and notices. Used for the "when" column on the board, the live clock, reminder-sent remarks, the board total, the "Opening soon" status, chip hover and the input caret.

### Tertiary
- **Signal Red** (`signal-red`): due, expired or wrong. Used for "EXPIRED" in the headline, the "due tomorrow" and "due today" remarks, and form error text and borders. Never decorative.

### Neutral
- **Concourse Black** (`concourse-black`): page ground and the dark sections.
- **Board Housing** (`board-housing`): the board frame (as a vertical gradient from #1c1e21 to #141618) and the follow-up question panel.
- **Board Face** (`board-face`): the recessed surface the tiles sit in.
- **Tile Top / Tile Bottom** (`tile-top`, `tile-bottom`): the two halves of every flap, split by a 1.2% black seam at the middle.
- **Rule** (`rule`): hairlines on dark ground (board column-head rule, privacy grid, footer border, sign dividers).
- **Flap White** (`flap-white`): default letters on the board and body text on black. A warm white, never pure #fff.
- **Platform Dim** (`platform-dim`): labels, secondary text on black and passive board values (item type, "ON WATCH").
- **Enamel** (`enamel`): the cool off-white information panel ground ("what it watches" and "how it works").
- **Ink** (`ink`) / **Ink Soft** (`ink-soft`): type on yellow and enamel fields; ink-soft is for body copy on enamel.
- **Field / Field Border / Control Border / Placeholder** (`field`, `field-border`, `control-border`, `placeholder`): input fill and stroke, chip and toggle strokes, and placeholder text.

### Named Rules
**The One Job Rule.** Each signal colour means one thing. Amber is time and notices, red is due or expired, and yellow is action and signage. A red that only decorates, or an amber that is not about time, breaks the board's language.

**The Ink-on-Yellow Rule.** Yellow fields and plates always carry ink type, never white. On yellow and enamel grounds, focus outlines change from yellow to ink.

## Typography

**Display Font:** Archivo, condensed (`'wdth' 68`), with ui-sans-serif and system-ui as fallbacks
**Body Font:** Archivo, normal width (`'wdth' 100`)
**Label/Mono Font:** Archivo, semi-condensed (`'wdth' 84`) for labels; the board tiles use `'wdth' 72` with tabular figures

**Character:** One grotesque family on a variable width axis. Condensed, tight bold caps read as station signage; normal width reads as calm prose. The family is loaded through `next/font` with the `wdth` axis enabled.

### Hierarchy
- **Display** (700, clamp(2.5rem, 5.6vw, 5rem), line-height 0.98, -0.01em, condensed): section headlines on the yellow, enamel and timetable fields. Balanced wrapping, about 16 to 24ch wide.
- **Headline** (700, clamp(2.25rem, 4.6vw, 4rem), 0.98, condensed): a slightly smaller step for headlines that share a row with a pictogram plate.
- **Title** (700, 24 to 36px, line-height 1, condensed): sign titles, route stops, privacy items and timetable services. The wordmark uses this voice at 800 weight.
- **Body lead** (400, 18 to 20px, line-height 1.625, normal width): the paragraph under the board and the closing invitation, max about 44 to 46ch.
- **Body** (400, 16 to 17px, 1.625, normal width): all supporting copy, max about 34 to 40ch.
- **Label** (600, 11px, 0.14em, uppercase, semi-condensed, Platform Dim): board column heads, the board header strip, table heads and the header status.
- **Control** (750, 16px, 0.02em, uppercase, `'wdth' 76`): the primary button. Chips use 600 weight, 13px, 0.04em, uppercase, `'wdth' 80`.
- **Flap** (700, 1.22 times the tile width, tabular figures, `'wdth' 72`): board characters. Tile size comes from the board's column count, not from a fixed type scale.

### Named Rules
**The Width Axis Rule.** Hierarchy comes from width before size. Use `'wdth' 68` for headings and signs, 72 for flaps, 76 to 84 for controls and labels, and 100 for anything people read as prose. Do not add a second family.

**The Board Caps Rule.** Board text is uppercase and limited to the drum's characters (A to Z, 0 to 9, and € . , : - / ' ! &). Anything else shows as a blank flap.

## Layout

Content sits in a centred container up to 1320px wide (1100px for the closing board), with 16px side gutters on mobile and 32px from `sm` up. Sections are full-bleed colour fields with vertical padding of 96px on mobile and 128px from `sm`. The hero is the exception: the board starts almost directly under the header.

The board lays out on a container-query grid. Each row declares a column count (`--cols`), and the tile width is derived from `100cqi` minus the gaps. The gap is max(2px, 0.28cqi) and each tile is 1.5 times as tall as it is wide. The item board uses 56 columns split into When (7), Item (16), Type (8), Amount (8) and Reminders (13), with one blank tile between fields. At a container width of 640px or less, rows reflow to 24 columns: the type column and empty rows drop out, and each item takes two lines (when and item, then remarks and amount aligned right). Message rows switch between a wide set (38 or 26 columns) and a narrow set (19 or 14 columns).

Away from the board, two-column splits open at `lg` (0.75fr and 1.25fr for heading and content). Sign rows become three columns at `md`, and the route line turns from vertical to horizontal at 900px.

## Elevation & Depth

Depth belongs to the board hardware only. The housing, the recessed face and each tile have physical shadows that make the board look like a mounted object. Everything else (signage plates, fields, controls, sign bars) is flat, with colour fields and hairline rules for structure.

### Shadow Vocabulary
- **Housing** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 80px -40px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.5)`): the board frame. A top highlight plus a deep, soft drop.
- **Recess** (`box-shadow: inset 0 2px 6px rgba(0,0,0,0.7)`): the board face the tiles sit in.
- **Flap** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 1px rgba(0,0,0,0.6)`): each tile.

### Named Rules
**The Hardware-Only Depth Rule.** Shadows exist only on the board's housing, face and tiles. Signage, fields and controls stay flat.

## Shapes

Signage is close to square: buttons, inputs, chips, toggles, the face and the follow-up panel all use a 3px radius (`signage`). The board housing uses 6px (`housing`). Tiles round in proportion to their width (8%, at least 1.5px). Pictogram and arrow plates, sign bars and full-bleed fields have no radius at all. The one round form is the route-stop dot (`stop`, 999px): a 32px enamel disc with a 6px ink ring on a 6px ink line, with the terminus filled yellow. Heavy rules are 6px ink bars (the route line and the timetable's top rule); light rules are 1px.

## Components

### Buttons
Signage you press: yellow, square and set in condensed caps.
- **Shape:** near-square (3px).
- **Primary:** Signal Yellow with ink, uppercase control type, 52px tall with 22px side padding. It may carry a trailing SVG arrow. A compact 44px, 14px variant is used inside the follow-up panel.
- **Hover / Focus:** turns Signal Yellow Lit (160ms, cubic-bezier(0.2, 0.8, 0.2, 1)); pressing shifts it down 1px; focus shows a 2px yellow outline offset by 3px. While disabled it drops to 60% opacity with a progress cursor.
- **Outline:** the header's "Join the waitlist" link has a 1px yellow border and yellow semi-condensed 14px text, and fills yellow with ink text on hover.

### Chips
- **Style:** transparent with a 1px Control Border stroke, flap-white uppercase 13px text, 36px tall, and an SVG plus sign in front. These sit on the board footer as the "add one" presets.
- **State:** on hover the border and text turn amber. Disabled chips use the rule colour for the border and a muted grey for text. A chip is removed from the row once its item is on the board.

### Toggles
- **Style:** 40px tall, with a 1px Control Border stroke and 14px semibold text. Each one wraps a visually hidden checkbox.
- **Checked:** fills Signal Yellow with ink text. Keyboard focus draws the yellow outline on the visible toggle.

### Cards / Containers
- **Board:** the housing gradient with a 1px #2a2d31 border, 6px radius, housing shadow and 8 to 12px padding. It contains a header strip (label plus clock), a recessed face and a footer strip.
- **Follow-up panel:** board housing fill, 1px rule border, 3px radius, 20px padding. It is flat.
- There are no generic cards. Grouped content uses rules (the privacy grid) or sign bars.

### Inputs / Fields
- **Style:** Field fill, 1px Field Border stroke, 3px radius, 52px tall, 16px text and padding, amber caret, Placeholder text colour.
- **Focus:** the border turns Signal Yellow; there is no glow.
- **Error:** the border turns Signal Red when `aria-invalid`, and the helper line below turns red. The helper line otherwise stays visible in Platform Dim.

### Navigation
A concourse header: the wordmark on the left (condensed 800 weight, 30px, with a yellow full stop), an uppercase label status with an amber "Opening soon", and the outline button. The status label is hidden below `sm`. The footer has a 1px rule above it and holds the wordmark, tagline and year in Platform Dim.

### Split-Flap Board (signature)
Each character is its own tile: a two-tone gradient with a black seam, 1.5 times as tall as wide, with the letter in the tone colour (white, amber, red or dim). The server renders the final text hidden; on the client each flap turns forward through the drum (42ms per step, a 70ms rotateX flip with ease-out, 22ms stagger from left to right, at most about 13 steps). Without JS the text appears after 1.6s, and with reduced motion it appears at once. Adding an item re-sorts the rows by date and the changed tiles turn to their new values. Screen-reader text and a polite live region carry the content, and the tiles themselves are `aria-hidden`.

### Direction Sign and Route Line
- **Direction sign:** an ink bar with a yellow arrow plate (48 to 56px, solid SVG arrow, 6px stroke, mitred joins) and a condensed title in flap white. Bars sit edge to edge, divided by rule hairlines.
- **Route line:** three stops on a 6px ink line ("calling at"). The last stop is the terminus and is filled yellow.

## App Screens

The signed-in app and account screens are Operate surfaces: the same world, used quietly.

- **Header:** a 1px rule under the wordmark, two text links (Upcoming, Settings) with a 2px yellow underline on the current page, the compact yellow "Add item" button (44px) and a dim "Sign out" text button.
- **Upcoming list:** rows separated by rule hairlines, grouped under labels (This week, This month, Later; Past due in red). Each row leads with the day count on three **static tiles** (`.st-static-tiles`): the flap look without motion, red for today or tomorrow, amber within 30 days, white beyond. The name is 17px semibold, the date line 14px dim with the relative day in the same tone, and the amount sits right in tabular figures.
- **Forms:** labels are 14px semibold flap white (`.st-field-label`), helper text 13px dim (`.st-hint`), errors 14px red (`.st-error`). Inputs and selects use `.st-input` (selects carry a drawn chevron). Choice groups use `.st-toggle`; presets use `.st-chip`. The primary action is `.st-btn`; secondary and Google actions use `.st-btn-outline`; account deletion uses `.st-btn-danger` inside a 1px red-bordered box.
- **Account pages:** no card. A 6px yellow bar, a condensed heading (44 to 52px) and a single 420px column on the concourse black, with a rule above the footer link.
- **Motion:** none beyond 160ms colour transitions on controls. The flaps stay on the landing page.

## Do's and Don'ts

### Do:
- **Do** set headings and signs in Archivo at `'wdth' 68`, weight 700, line-height 0.98, and reading text at `'wdth' 100` with 1.625 line-height.
- **Do** use amber only for time and notices, and red only for due, expired or error states.
- **Do** put ink type on yellow and enamel fields, and switch focus outlines to ink there.
- **Do** build board content from real tiles on a `--cols` container-query grid, in uppercase drum characters.
- **Do** draw arrows, pictograms and plus signs as solid SVG on square yellow or ink plates.
- **Do** keep controls at 3px radius and 52px tall for primary actions.
- **Do** honour `prefers-reduced-motion` by showing final flap states and turning off control transitions.

### Don't:
- **Don't** animate anything except the flaps; no other element enters, fades or slides in.
- **Don't** add shadows to signage, fields or controls; depth belongs to the board hardware.
- **Don't** introduce a second typeface; vary width and weight within Archivo instead.
- **Don't** use pure white (#fff) for text on black; use Flap White.
- **Don't** bring back cream paper, a serif display face or rounded pill controls; they belonged to the retired first look.
