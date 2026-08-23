---
name: HariSumiran Design System
colors:
  surface: '#fff8f5'
  surface-dim: '#e0d9d5'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf2ee'
  surface-container: '#f4ece9'
  surface-container-high: '#eee7e3'
  surface-container-highest: '#e8e1dd'
  on-surface: '#1e1b19'
  on-surface-variant: '#57423a'
  inverse-surface: '#33302e'
  inverse-on-surface: '#f7efec'
  outline: '#8b7268'
  outline-variant: '#dec0b5'
  surface-tint: '#a33e05'
  primary: '#963700'
  on-primary: '#ffffff'
  primary-container: '#b84d17'
  on-primary-container: '#ffeee9'
  inverse-primary: '#ffb597'
  secondary: '#2d694d'
  on-secondary: '#ffffff'
  secondary-container: '#aeedca'
  on-secondary-container: '#326e51'
  tertiary: '#1f5987'
  on-tertiary: '#ffffff'
  tertiary-container: '#3c72a1'
  on-tertiary-container: '#eaf2ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb597'
  on-primary-fixed: '#360f00'
  on-primary-fixed-variant: '#7e2c00'
  secondary-fixed: '#b1f0cd'
  secondary-fixed-dim: '#96d4b2'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#105137'
  tertiary-fixed: '#cfe5ff'
  tertiary-fixed-dim: '#98cbff'
  on-tertiary-fixed: '#001d33'
  on-tertiary-fixed-variant: '#024a77'
  background: '#fff8f5'
  on-background: '#1e1b19'
  surface-variant: '#e8e1dd'
typography:
  nav-large-title:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.4pt
  branding-header:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 25px
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.2pt
  gujarati-body:
    fontFamily: Noto Sans
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  margin-main: 20px
  gutter: 16px
  touch-target-min: 44px
  stack-gap: 12px
---

## Brand & Style

The design system is built for HariSumiran, a specialized operations tool for the HariPrabodham temple in Nadiad. The brand personality balances **Spiritual Warmth** with **Modern Productivity**, catering to Karyakartas (volunteers) who require high-utility tools within a respectful, serene environment.

The aesthetic follows a "Liquid Glass" direction tailored for a native iOS 27 experience. It utilizes adaptive glass layers for structural navigation elements (top and bottom bars) that float above a calm, canvas-like content layer. The interface feels light, breathable, and premium, characterized by high-quality typography, intentional whitespace, and a sophisticated color palette that avoids the sterility of standard enterprise apps.

## Colors

The palette is rooted in a warm, organic spectrum. 

- **Canvas & Surfaces**: The background uses a soft `#FBF9F5` canvas to reduce eye strain and provide a more "human" feel than pure white. Interactive cards and containers use pure `#FFFFFF` to create subtle elevation through contrast.
- **Action & Brand**: **Deep Saffron (#B84D17)** is the primary action color, used for high-importance buttons, active states, and branding. **Forest Green (#2F6B4F)** is used for success states and growth-related metrics (e.g., Sabha attendance).
- **Hierarchy**: Primary text is a soft charcoal (`#24211F`) to maintain high legibility without the harshness of `#000000`. Secondary text and metadata use a warm grey-brown (`#6E655F`).
- **Dividers**: Use hairline borders (`0.5pt`) in `#E8E0D8` to define structure without cluttering the view.

## Typography

The typography system is multi-layered to support English and Gujarati scripts seamlessly.

- **Branding & Headings**: Uses **Plus Jakarta Sans** (as a contemporary substitute for Poppins) for a modern, geometric feel that retains warmth. Large titles follow iOS standards for weight and tracking.
- **System UI & Body**: **Inter** (as a highly legible equivalent to SF Pro) handles all functional UI, data entry, and body copy to ensure clarity in high-density operational views.
- **Script Support**: **Noto Sans Gujarati** is mapped to all body levels where local script is required, with increased line-height (roughly 1.5x) to accommodate character flourishes.
- **Accessibility**: Never drop below 13pt for labels. Use Semibold weights for primary labels to ensure visibility against the warm background.

## Layout & Spacing

This design system employs a strict **8-pt grid** for all spatial relationships. 

- **Safe Areas**: Use a standard 20px horizontal margin for all primary content to ensure comfort on modern iPhone displays.
- **Rhythm**: Vertical spacing between related elements (e.g., header to body) should use 8px or 12px. Spacing between distinct sections or cards should use 24px or 32px.
- **Grid Model**: Use a single-column layout for mobile forms and lists. For tablet, adopt a 2-column split-view or a 12-column grid with a centered content well (max-width 720px).
- **Touch Targets**: Every interactive element must maintain a minimum hit area of **44x44pt**, regardless of its visual size.

## Elevation & Depth

Depth is conveyed through a "Liquid Glass" hierarchy rather than heavy shadows:

- **Level 0 (Canvas)**: The base `#FBF9F5` layer. Contains the 3-5% opacity abstract mandala watermark in empty states.
- **Level 1 (Cards)**: White surfaces (`#FFFFFF`) with a `1px` or `0.5pt` hairline border in `#E8E0D8`. Use an extremely soft, diffused shadow (Blur 12, Opacity 4%, Color `#24211F`) to lift the card slightly.
- **Level 2 (Liquid Glass)**: The Navigation Bar and the Floating Tab Bar. These use a `systemUltraThinMaterial` blur effect with a subtle white tint. They should appear to float above the content, with the content visible through the blur as it scrolls.
- **Interaction**: On tap, cards and buttons should slightly scale down (0.98x) and increase shadow density to provide tactile feedback.

## Shapes

The shape language is "Organic Geometric." 

- **Primary Cards**: Use a **16pt** corner radius for standard cards.
- **Small Elements**: Chips, tags, and input fields use an **8pt** to **12pt** radius.
- **Tab Bar**: The floating tab bar uses a fully rounded (pill) shape for the container.
- **Icons**: Utilize **SF Symbols** with a 'Medium' or 'Semibold' weight to match the typography's visual thickness.

## Components

### Floating Tab Bar
The primary navigation is a pill-shaped floating bar at the bottom of the screen.
- **Material**: Heavy glass blur.
- **Items**: Home, Families, Sabha, Tasks, Profile.
- **Active State**: The active icon uses the Deep Saffron color with a subtle haptic feedback on change.

### Navigation Bars
- **Style**: Large Title mode. As the user scrolls, the title transitions into the center of the glass-blurred top bar.
- **Actions**: SF Symbols (e.g., `plus.circle.fill` for quick-add) should be placed in the trailing edge.

### Cards & Lists
- **Service Cards**: Use for family profiles or task items. Features a white background, 16pt radius, and hairline border.
- **Section Headers**: Plain text in Saffron or Charcoal, placed 8px above the card group.

### Inputs & Fields
- **Search**: Integrated into the navigation bar. Background should be a subtle `#000000` with 5% opacity or a blur-compatible gray.
- **Quick-Add**: A contextual Floating Action Button (FAB) or a prominent "Add" card at the top of lists, using the Primary Saffron color.

### Feedback Elements
- **Success States**: Forest Green icons and progress rings.
- **Empty States**: Centered abstract mandala watermark (3% opacity) with a centered "Body-LG" description and a clear call-to-action button.