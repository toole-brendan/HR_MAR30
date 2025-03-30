# HandReceipt - Frontend Styling Guide (Current Implementation)

This document details the implemented design theme for the HandReceipt frontend. It serves as the definitive guide, reflecting the current "gold standard" established by components like the `Sidebar` and pages like `SensitiveItems`. The aesthetic aims for a professional, modern, and functional interface suitable for enterprise use.

## Design Philosophy

The implemented design adheres to these core principles:

*   **Dual Theme (Light/Dark):** Provides distinct, high-contrast light and dark modes for user preference and accessibility.
*   **Professional & Minimalist:** Emphasizes clarity, function, and a clean aesthetic with minimal decoration. Focuses on content and data presentation.
*   **Sharp Corners:** Utilizes sharp corners (`--radius: 0rem`) for all primary UI elements (buttons, cards, inputs) to maintain a formal, enterprise look.
*   **Component-Based:** Relies heavily on a pre-styled component library (`shadcn/ui`) ensuring consistency across the application.
*   **Data-Forward:** Prioritizes clear and efficient presentation of data through well-structured tables, cards, and dashboards.
*   **Responsive:** Adapts layouts effectively for various screen sizes, primarily switching between card-based mobile views and table/grid-based desktop views.

## Visual Theme Direction

The current aesthetic is characterized by:

*   **Light Theme:** Clean interfaces with a pure white (`#FFFFFF`) main background and slightly darker light gray (`hsl(0 0% 94%)`) backgrounds for containers like cards and the sidebar. Text is primarily black.
*   **Dark Theme:** High-contrast interfaces with a true black (`#000000`) main background and very dark gray (`hsl(0 0% 7%)`) backgrounds for containers. Text is primarily white.
*   **Sharp Corners:** Strict adherence to `border-radius: 0`.
*   **Minimalism:** Content is prioritized. Color is used strategically for interaction states, semantic meaning (status indicators), and subtle accents.
*   **Emphasis on Components:** Consistent look and feel achieved through the `shadcn/ui` component library (`Card`, `Button`, `Table`, `Input`, `Select`, `Badge`, etc.).

## Color Palette (Implemented via CSS Variables in `client/src/index.css`)

The color scheme is defined using HSL values in CSS variables.

**Core Colors:**

*   **Background:**
    *   Light: `hsl(0 0% 100%)` (White)
    *   Dark: `hsl(0 0% 0%)` (Black)
*   **Foreground (Primary Text):**
    *   Light: `hsl(0 0% 7%)` (Very Dark Gray - `#111111`)
    *   Dark: `hsl(0 0% 100%)` (White)
*   **Card / Sidebar Background:**
    *   Light: `hsl(0 0% 94%)` (Slightly Darker Light Gray)
    *   Dark: `hsl(0 0% 7%)` (Very Dark Gray - `#111111`)
*   **Card / Sidebar Foreground:**
    *   Light: `hsl(0 0% 7%)` (Very Dark Gray - `#111111`)
    *   Dark: `hsl(0 0% 100%)` (White)
*   **Border:**
    *   Light: `hsl(0 0% 30%)` (Dark Gray)
    *   Dark: `hsl(0 0% 25%)` (Lighter Gray)

**Interaction Colors:**

*   **Primary (Buttons, Active States, Accents, Rings):**
    *   Light: `hsl(217 91% 75%)` (Light Blue) - Text: `hsl(0 0% 100%)` (White)
    *   Dark: `hsl(217 50% 55% / 0.85)` (Grayish, Translucent Blue) - Text: `hsl(0 0% 100%)` (White)
*   **Secondary (Alternative Actions - Less Commonly Used):**
    *   Light/Dark: `hsl(0 0% 50%)` (Mid Gray) - Text: `hsl(0 0% 100%)` (White)
*   **Accent / Ring (Focus Rings, Specific Highlights):**
    *   *This now uses the Primary color defined above.*
*   **Muted (Subtle Backgrounds/Text):**
    *   Light: Background `hsl(0 0% 96%)`, Foreground `hsl(0 0% 40%)` (Medium Gray)
    *   Dark: Background `hsl(0 0% 7%)`, Foreground `hsl(0 0% 67%)` (Gray)

**State Colors (Used in Badges, Alerts, etc.):**

*   **Destructive (Errors, Deletion):** `hsl(0 70% 50%)` (Red) - Text: White
*   **Success (Verification, Completion):** `hsl(142 76% 36%)` (Green) - Text: White
*   **Warning (Pending, Attention):** `hsl(38 92% 50%)` (Amber) - Text: Black
*   **Info (Informational):** `hsl(218 81% 59%)` (Blue) - Text: White

**Specific Category Colors (Example from SensitiveItems):**

*   Weapon: `text-red-600` / `dark:text-red-500`
*   Communication: `text-blue-600` / `dark:text-blue-400`
*   Optics: `text-green-600` / `dark:text-green-500`
*   Crypto: `text-blue-600` / `dark:text-blue-400`
*   Other: `text-gray-600` / `dark:text-gray-400`

## Typography

Defined via Tailwind config (`tailwind.config.ts`) and base styles (`index.css`).

*   **Primary Font (Sans-serif):** `Inter` (Applied generally via `font-sans`).
*   **Branding Font (Serif):** `Georgia` (Used specifically in Sidebar Logo - `font-['Georgia']`). `PT Serif` is loaded but less prominent in current components.
*   **Monospace Font:** `JetBrains Mono` (Fallback `Roboto Mono`) (Applied via `font-mono`).
*   **Page Headers:**
    *   Category Label: Small, uppercase, wider tracking (`text-xs uppercase tracking-wider text-muted-foreground font-medium`).
    *   Main Title: Large, light weight (`text-3xl font-light tracking-tight`).
    *   Description: Small, muted (`text-sm text-muted-foreground`).
*   **UI Text:** Handled by component defaults and Tailwind utilities (`text-sm`, `text-base`, etc.).
*   **Data Display (Tables, Cards):** Clear hierarchy using font weight (`font-medium`), size, and color (`text-muted-foreground`).
*   **Serial Numbers / Technical Data:** Monospace font, slightly smaller size, wider tracking (`font-mono text-xs tracking-wider`) as seen in `SensitiveItems` table.
*   **Badges:** Small size, specific font weight/color based on status/type.

## Components (Based on `shadcn/ui`)

Leverage the pre-built and styled components for consistency. Key components observed:

*   **Card:** Standard container (`bg-card`, `text-card-foreground`, `border`, `rounded-none`). Used for dashboard items, mobile list items, filter sections.
*   **Button:** Various styles (default, outline, ghost, destructive). Uses `bg-primary` for default actions. Sharp corners.
*   **Table:** Used for primary data display on desktop. Clean design with subtle row dividers (`border-t`), hover effects (`hover:bg-muted/50`), specific header styling (`bg-muted/50`), and fixed/minimum column widths.
*   **Input / Select / Label:** Standard form elements inheriting theme styles (background, border, text color, ring color). Sharp corners.
*   **Badge:** Used for status indicators. Base styles customized with specific background/text colors and icons for semantic meaning (see `StatusBadgeComponent`). Sharp corners.
*   **Dialog / Popover:** Use theme backgrounds (`bg-card`, `bg-popover`) and text colors. Sharp corners.
*   **Tooltip:** Provides hover information, using theme styles.
*   **Tabs:** Used for view switching (e.g., Assigned Items). Styled for a segmented control look.

## Layout Principles

*   **Page Structure:**
    *   Consistent Padding: Defined via CSS variables (`--page-padding-x`, `--page-padding-y`), adjusted for breakpoints.
    *   Header: Standard layout with category label, main title, description, and right-aligned actions.
    *   Content Area: Uses CSS Grid or Flexbox for arranging components (e.g., stats cards, filter bar, main content table/cards).
*   **Sidebar:** Fixed-width (`--sidebar-width`) or collapsed (`--sidebar-collapsed-width`) layout on desktop. Full-screen overlay or integrated part of layout on mobile. Contains logo, user profile, navigation items, and action buttons.
*   **Responsiveness:** Key breakpoints trigger layout shifts (e.g., `sm:`, `md:`, `lg:` prefixes). Common pattern: cards on mobile, tables/grids on desktop.
*   **Spacing:** Consistent gaps between elements achieved using Tailwind gap/space/margin utilities (e.g., `gap-4`, `mb-6`, `space-y-1`). Card internal padding is typically `p-4` or `p-6`.

## Key Files

*   **Tailwind Config:** `tailwind.config.ts` (Defines fonts, extended theme, plugins)
*   **Core Styles & Variables:** `client/src/index.css` (Defines CSS variables for light/dark themes, base styles, custom component classes like `.sidebar`, `.sidebar-item`)
*   **Component Library:** Based on `shadcn/ui`, components likely reside in `client/src/components/ui/`.
*   **Reference Components:** `client/src/components/layout/Sidebar.tsx`, `client/src/pages/SensitiveItems.tsx`