---
name: SCIM Viewer
description: Compact identity administration with deep blue navigation and light mineral work surfaces.
colors:
  primary: "#245fa8"
  primary-hover: "#1c4b87"
  danger: "#b83b3b"
  danger-soft: "#fdf0ef"
  ink: "#263a54"
  muted: "#586b83"
  border: "#dbe3ef"
  border-strong: "#c2cfe1"
  bg: "#f3f6fa"
  bg-muted: "#f7f9fc"
  surface: "#ffffff"
  selected: "#e8f0fb"
  rail: "#18345c"
  rail-text: "#f0f5fc"
  rail-muted: "#b7c9e2"
typography:
  title:
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "27px"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-.035em"
  body:
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
  table:
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "13px"
  label:
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "11px"
    fontWeight: 600
  drawer-title:
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    letterSpacing: "-.02em"
  endpoint:
    fontFamily: "Consolas, 'SFMono-Regular', monospace"
    fontSize: "12px"
rounded:
  status: "4px"
  control: "6px"
  surface: "8px"
spacing:
  action-gap: "8px"
  field-gap: "20px"
  section-gap: "24px"
  workspace-inline: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "7px 13px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "7px 13px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.danger}"
    rounded: "{rounded.control}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 11px"
  navigation:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.rail-muted}"
    rounded: "{rounded.control}"
  status-badge:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.primary}"
    rounded: "{rounded.status}"
    padding: "3px 8px"
  data-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.surface}"
  context-strip:
    backgroundColor: "#eaf0f8"
    rounded: "{rounded.surface}"
    padding: "18px 20px"
  tabs:
    textColor: "{colors.muted}"
    padding: "11px 2px 12px"
---

# Design System: SCIM Viewer

## Overview

**Creative North Star: "The Technical Standards Desk"**

SCIM Viewer uses the visual discipline of technical standards publications: crisp system typography, a deep blue navigation field and pale mineral data surfaces. This is an Operate interface for daily inspection and administration, with compact controls and familiar tables rather than oversized display typography.

Hierarchy comes from tonal contrast, borders and restrained spacing. The selected environment and application form an explicit path above identity data; that path describes the target of actions. SCIM Viewer and the established English domain labels remain the visible product vocabulary.

**Key Characteristics:**

- Deep blue navigation beside light mineral work surfaces.
- One system sans family for the operator interface; monospace reserved for endpoints.
- Compact table toolbars, labelled creation actions and quiet row controls.
- Explicit context selection, keyboard tabs and semantic status text.
- Flat data surfaces with depth reserved for overlays and notifications.

This document is extracted from the implemented frontend. Responsive behavior is documented from source rules; it has not been verified through browser screenshots in this session. The authored SVG favicon is the only public visual asset; there are no shipping raster assets. Final TypeScript checks, production build and server-rendered smoke checks passed. The frontend development server responded successfully; the backend was unavailable, so live API workflows were not exercised.

## Colors

The palette combines muted blue with near-white mineral surfaces; the frontmatter preserves the actual CSS token names and canonical values.

### Primary

- **Blue** (`primary`) identifies primary actions, links, selected tabs and active identity labels. **Deep Blue** (`primary-hover`) supplies hover feedback.
- **Rail Blue** (`rail`) anchors navigation. **Rail Paper** (`rail-text`) and **Rail Slate** (`rail-muted`) support its text hierarchy.
- **Selected Mineral** (`selected`) is the quiet accent surface for status badges and control hover.

### Neutral

- **Mineral Background** (`bg`) surrounds the work area; **Pale Mineral** (`bg-muted`) distinguishes table headers and disabled fields.
- **Paper Surface** (`surface`) fills tables, fields, header and drawers.
- **Blue Ink** (`ink`) carries primary text; **Muted Slate Ink** (`muted`) carries supporting text.
- **Soft Divider** (`border`) separates rows and surfaces; **Field Divider** (`border-strong`) outlines native controls. The Ant Design theme additionally uses its own field border value (`#cbd7e8`).

### Semantic colors

- **Danger Red** (`danger`) identifies destructive controls and error icons; **Pale Error** (`danger-soft`) fills error messlates and destructive hover.
- The context strip uses its observed pale blue fill. Inactive identity badges use a neutral fill and muted text, with the word “Inactive”.

**The Context Truth Rule.** A selected environment/application path communicates action scope; it does not prove connectivity.

## Typography

The interface uses the Segoe UI system stack throughout native controls and Ant Design. Body text has tabular numerals inherited from the root. There is no separate display family. Endpoint strings use the documented monospace utility.

- **Page title:** the title role, tightened tracking and balanced wrapping; reduced to 24px at the mobile breakpoint.
- **Body:** the root role; page descriptions and table records use the compact 13px treatment. Supporting descriptions are constrained to 70 characters per line.
- **Label:** compact table headers and selection labels; navigation uses 13px with medium weight.
- **Drawer title:** a restrained 17px heading. Empty-state headings use 16px.
- **Endpoint:** 12px monospace for URLs and token endpoints.

**The One Interface Voice Rule.** Keep navigation, data, actions and forms in the system sans stack; reserve monospace for technical endpoint values.

## Layout

The desktop shell is a two-column grid: a sticky full-height navigation rail (216px) and a flexible work area. The white breadcrumb header has a minimum height of 65px. Main content is centered with a maximum width of 1536px and padding of 30px 32px 40px. Page headings precede the content by 24px.

The context strip places environment, a directional arrow, application and the selected path in one row. Data panels use a wrapping toolbar: search and result count on the left, refresh and labelled creation actions on the right. Search is 280px wide when space permits. Tables retain all columns and scroll inside focusable, named regions. Desktop cells use 14px 18px padding; table headers are more compact.

Implemented responsive rules:

- At widths of 1100px or less, the rail becomes 190px, workspace padding becomes 24px and the context summary moves beneath the selectors.
- At widths of 760px or less, the rail becomes a horizontal, scrollable navigation bar. Desktop rail notes and footer disappear. Main padding is 24px 20px 32px, the search takes its toolbar row, and action controls remain grouped. Tables have a minimum width of 580px; groups and applications use 460px. Cell padding becomes 12px 14px. Inputs and selects use 16px text, and icon controls become 36px square.
- At widths of 420px or less, context fields stack, the arrow disappears, the page action occupies a full row and main horizontal padding becomes 16px. Drawer body padding becomes 20px.
- At widths of 1700px or more, main top padding increases to 38px.

These are implemented rules, not a claim of visual testing. The body minimum width is 320px and the shell uses dynamic viewport height.

## Elevation & Depth

Data panels stay flat, separated by pale borders and tonal backgrounds. Depth belongs to temporary layers: the drawer uses the CSS overlay shadow (`-12px 0 40px rgb(24 52 92 / 12%)`), and toasts use a smaller floating shadow (`0 8px 28px rgb(24 52 92 / 16%)`). Ant Design supplies its standard modal mask and tooltip behavior.

**The Flat Data Rule.** Keep tables and their work surfaces flat; use overlay depth for drawers and notifications.

## Shapes

Surfaces and context strips use gently curved corners (8px); fields and standard buttons are slightly tighter (6px). Status badges are compact rectangles (4px). Identity markers are near-square (32px with 7px corners), carrying initials or domain icons. Thin dividers, rather than inset ornamental containers, structure rows and form actions.

## Components

### Buttons

Primary controls are blue with white text, 13px semibold labels, a minimum height of 36px and the compact frontmatter padding. Secondary controls use white surfaces, blue ink and a visible field border. Destructive row actions use red text on a transparent surface, gaining a pale error fill on hover. Icon-only controls expose tooltips and accessible labels; main creation controls expose visible text. Disabled controls reduce opacity and use a not-allowed cursor. Press feedback moves enabled native buttons down by 1px.

### Inputs / Fields

Native controls use a minimum height of 38px, a paper surface and a field divider. Hover darkens the border; placeholders use muted ink. A shared visible focus outline is 3px in the observed slate focus color, offset 3px. Ant Design supplies search inputs with prefix icons and clear actions using the matching theme. Native labels sit above fields; drawer form gaps are 20px.

### Navigation

The rail keeps compact icon-and-text links in a vertical list. Hover uses a lighter blue surface; the active link uses a still lighter blue fill, white text and a trailing arrow. On mobile the same navigation links form a horizontal strip, preserving labels. The skip link leads to the focusable main landmark.

### Status badges

Identity status is text plus a small colored dot: “Active” on selected mineral, “Inactive” on neutral blue-gray. The badge does not indicate API connectivity.

### Data panels and tables

A bordered paper panel contains toolbar, table or state messlate, and a compact footer. Table headings use scope attributes and tables have hidden descriptive captions. Names wrap; identity IDs truncate with their full value retained as a title. Actions align right. Row hover applies a very pale blue tint. Empty, loading and error states have their own messlates; failure states offer retry.

### Context path

Two labelled selects explicitly establish Environment → Application. The adjacent summary names the chosen pair, wraps long names and explains that identity actions use this selection. Loading and errors disable selection; the summary is a polite live region.

### Tabs

Users and Groups use quiet text tabs with a 2px blue selected underline. The active tab is the sole tab stop. Left/right arrows switch between tabs; Home and End select the first and last tab, moving focus. The tab panel names its controlling tab.

### Drawers and notifications

Standard Ant Design drawers hold create/edit forms, environment configurations and membership management. Observed widths are 420px for new groups; 480px for users, applications and membership; 560px for environments; 640px for configuration forms; and 960px for the configuration list. Each wrapper is capped at the viewport width. Forms use clear labels and a separated action row. Toasts stack at the lower right, wrap long messlates and use semantic icons with close controls.

### Motion and focus

Color and border feedback use 160ms transitions with the extracted easing. Loading rows pulse at 1.4 seconds. Reduced-motion rules disable animations, transitions and press displacement. Ant Design owns drawer motion and overlay interaction. Preserve visible keyboard focus and labelled scroll regions when extending these patterns.

## Do's and Don'ts

### Do:

- Do use the existing blue, mineral, ink and muted tokens for new operator screens.
- Do keep environment and application names visible when administering identities.
- Do give primary creation actions visible labels and icon-only row controls accessible names.
- Do distinguish loading, failure, empty data and empty search results.
- Do retain keyboard focus, semantic table headings and local horizontal scrolling.

### Don't:

- Don't describe context selection as a verified connection or connectivity status.
- Don't introduce a separate display font or promotional hero scale into everyday data screens.
- Don't use status color without the corresponding textual label.
- Don't replace standard Ant Design drawers with a second modal interaction system.
- Don't turn local table overflow into horizontal page scrolling.
