---
name: Vibrant Cravings
colors:
  surface: '#fff8f6'
  surface-dim: '#f1d4cc'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ed'
  surface-container: '#ffe9e4'
  surface-container-high: '#ffe2da'
  surface-container-highest: '#fadcd4'
  on-surface: '#271813'
  on-surface-variant: '#5b4039'
  inverse-surface: '#3e2c27'
  inverse-on-surface: '#ffede8'
  outline: '#907067'
  outline-variant: '#e4beb4'
  surface-tint: '#b02f00'
  primary: '#b02f00'
  on-primary: '#ffffff'
  primary-container: '#ff5722'
  on-primary-container: '#541200'
  inverse-primary: '#ffb5a0'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#00628c'
  on-tertiary: '#ffffff'
  tertiary-container: '#007caf'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#862200'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#c8e6ff'
  tertiary-fixed-dim: '#86cfff'
  on-tertiary-fixed: '#001e2e'
  on-tertiary-fixed-variant: '#004c6d'
  background: '#fff8f6'
  on-background: '#271813'
  surface-variant: '#fadcd4'
typography:
  display-lg:
    fontFamily: Rubik
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Rubik
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Rubik
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Rubik
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Rubik
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Rubik
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Rubik
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 16px
  gutter-mobile: 12px
---

## Brand & Style
The design system is engineered to evoke an immediate sense of hunger and reliability. It targets urban professionals and families who value speed without sacrificing the culinary experience. 

The aesthetic is **Corporate Modern with a Warm Pulse**. It utilizes heavy whitespace to allow high-quality food photography to take center stage, while employing high-energy accents to drive conversion. The emotional response is one of efficiency, freshness, and culinary excitement. The interface remains invisible where possible, acting as a clean gallery for the merchant's offerings, punctuated by tactile, high-affordance interactive elements.

## Colors
The palette is dominated by "Crave Orange" (#FF5722), a color scientifically proven to stimulate appetite and convey a sense of urgency and energy. 

- **Primary:** Use exclusively for primary calls to action, price highlights, and active states.
- **Secondary (Charcoal):** Used for primary headings and body text to provide high-contrast legibility against the white background.
- **Neutral (Greyscale):** Utilize a range of cool greys for borders, disabled states, and secondary metadata to maintain a clean, professional hierarchy.
- **Semantic Colors:** Green is reserved for "Delivered" statuses and "Healthy" tags; Red is strictly for "Out of Stock" or critical errors.

## Typography
This design system uses **Rubik** for its friendly, rounded terminals that mirror the "softness" of food while maintaining a professional geometric structure. 

- **Headlines:** Use Bold or Semi-Bold weights to create a strong information hierarchy.
- **Body:** Use Regular weight for high readability. Maintain generous line-height to ensure menus are easy to scan.
- **Labels:** Use Medium weight in all-caps for utility information like "ESTIMATED TIME" or "DELIVERY FEE" to distinguish them from content.

## Layout & Spacing
The layout follows an **8px grid system** to ensure mathematical harmony. 

- **Mobile Layout:** Use a 4-column fluid grid with 16px side margins and 12px gutters.
- **Padding:** Apply 16px (md) padding for standard card containers and 12px for compact list items.
- **Grouping:** Use 8px (sm) for related items (e.g., a dish name and its price) and 24px (lg) to separate distinct sections (e.g., "Recently Ordered" vs "Promotions").

## Elevation & Depth
The design system employs **Ambient Shadows** to create a sense of physical layering without clutter.

- **Level 0 (Flat):** Used for the main background and input fields in their rest state.
- **Level 1 (Soft):** A subtle shadow (0px 4px 12px rgba(0,0,0,0.05)) used for restaurant cards and category chips to suggest interactability.
- **Level 2 (Floating):** A more pronounced shadow (0px 8px 24px rgba(0,0,0,0.12)) used for the "View Cart" sticky bottom bar and floating action buttons to ensure they sit atop the scrolling content.
- **Overlays:** Use a 40% black scrim for modals to focus the user's attention on order customizations.

## Shapes
The shape language is defined by **Rounded** corners to communicate friendliness and approachability.

- **Standard Containers:** Use 16px (rounded-lg) for restaurant cards, product images, and modals.
- **Interactive Elements:** Use 12px for input fields and primary buttons.
- **Tags & Chips:** Use 100px (full pill) for status indicators like "Free Delivery" or "Top Rated" to differentiate them from functional buttons.
- **Images:** All food photography must have a minimum 16px corner radius to match the container language.

## Components
- **Buttons:** Primary buttons are #FF5722 with white text, 56px height for mobile tap targets. Secondary buttons use a light grey fill with charcoal text.
- **Input Fields:** Use 1px #E0E0E0 borders. On focus, the border transitions to #FF5722. Labels are persistent and positioned above the field in Label-MD style.
- **Chips:** Horizontal scrolling category chips use a white background with a 1px stroke in the rest state, and a solid #212121 fill when selected.
- **Restaurant Cards:** Feature a full-bleed image at the top with a 16px radius, followed by title, rating, and delivery time metadata below.
- **Add-to-Cart Stepper:** A compact component with a minus, quantity, and plus sign, utilizing the primary orange for the icons to encourage quantity increases.
- **Lists:** Menu items use a 1px bottom border separator with 16px vertical padding. Use a "ghost" placeholder state for images during lazy loading.  