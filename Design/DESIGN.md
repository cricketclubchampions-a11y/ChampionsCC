---
name: Elite Crease
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#41493e'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#72796d'
  outline-variant: '#c1c9ba'
  surface-tint: '#356a2e'
  primary: '#002b02'
  on-primary: '#ffffff'
  primary-container: '#0c430b'
  on-primary-container: '#78b16c'
  inverse-primary: '#9bd58d'
  secondary: '#006e05'
  on-secondary: '#ffffff'
  secondary-container: '#66fe56'
  on-secondary-container: '#007306'
  tertiary: '#500005'
  on-tertiary: '#ffffff'
  tertiary-container: '#79000b'
  on-tertiary-container: '#ff7a71'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b6f2a7'
  primary-fixed-dim: '#9bd58d'
  on-primary-fixed: '#002201'
  on-primary-fixed-variant: '#1c5118'
  secondary-fixed: '#76ff65'
  secondary-fixed-dim: '#49e33e'
  on-secondary-fixed: '#002200'
  on-secondary-fixed-variant: '#005303'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb3ac'
  on-tertiary-fixed: '#410003'
  on-tertiary-fixed-variant: '#930010'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  pitch-white: '#FFFFFF'
  boundary-black: '#000000'
  action-scarlet: '#D32F2F'
  turf-shadow: '#062105'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 64px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  stat-value:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '900'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  section-gap: 120px
---

## Brand & Style
The design system embodies the prestige and kinetic energy of a high-performance cricket institute. The brand personality is **Elite, Dynamic, and Disciplined**. It targets aspiring athletes and professional players who seek a premium environment for technical mastery.

The visual style is **Corporate / Modern** with a **High-Contrast** edge. It utilizes expansive whitespace (the "Crisp White" of cricket flannels) contrasted against "Turf Green" and "Action Scarlet" to evoke a sense of focus and urgency. The aesthetic is clean and structured, reflecting the precision required in the sport, while using bold, italicized accents to imply movement and forward momentum.

## Colors
The palette is rooted in the traditional and modern textures of the game.
- **Primary (Turf Deep Green):** Used for primary navigation, hero backgrounds, and authoritative elements. It represents the foundation of the field.
- **Secondary (Neon Grass):** An energetic accent used for highlighting progress, call-to-action buttons, and interactive states.
- **Tertiary (Action Scarlet):** Reserved for high-impact notifications, "Live" indicators, and critical buttons. It mirrors the iconic cricket ball.
- **Neutral (Pavilion White & Grey):** Ensures the UI remains "crisp" and professional, providing the necessary breathing room for bold imagery.

## Typography
Typography is split between athletic aggression and technical clarity.
- **Headlines:** Use Montserrat in heavy weights (ExtraBold/Black). High-level displays should use the italic variant to convey speed and "Action."
- **Body:** Hanken Grotesk provides a sharp, modern feel that is highly readable for long-form training modules and academy information.
- **Technical/Stats:** JetBrains Mono is utilized for data points, player IDs, and technical specs (e.g., ball speed, spin rate), giving the system a "performance lab" feel.

## Layout & Spacing
The layout follows a **Fixed Grid** on desktop (1280px max-width) to maintain a premium, editorial feel. 

- **Grid:** 12-column grid with generous 24px gutters.
- **Sectioning:** Large vertical gaps (120px+) between sections to emphasize the elite, "uncluttered" nature of the academy.
- **Mobile:** Transition to a single-column fluid layout with 16px margins, ensuring touch targets for athletes on the go remain accessible.
- **Asymmetry:** Occasionally break the grid with "overlapping" elements (e.g., a player cutout overlapping a text block) to create depth and motion.

## Elevation & Depth
To maintain a modern and professional aesthetic, this design system avoids heavy shadows. 
- **Tonal Layers:** Depth is created through background color shifts (White to Neutral Grey) and "Field Deep Green" containers.
- **Low-Contrast Outlines:** Use 1px borders in `Action Scarlet` or `Neon Grass` to define interactive areas without adding visual bulk.
- **Hard Shadows:** For cards or primary buttons, use "Hard" shadows—offset 4px or 8px with 100% opacity in a darker shade of the background color (e.g., a green card with a darker green hard shadow) to create a "Tactile/Sporty" feel.

## Shapes
Shapes are generally **Soft (0.25rem)** to maintain a sense of structural integrity and precision. 

- **Primary Buttons:** Use a slight slant (8-degree skew) or sharp corners to mimic the angles of a cricket bat.
- **Data Containers:** Use "Soft" rounding for stats and performance metrics to make the data feel approachable.
- **Image Treatment:** Action shots should use aggressive, sharp-cornered crops or "torn edge" masks to evoke the intensity of the game.

## Components
- **Buttons:** Primary buttons use `Turf Deep Green` with white text. Hover states trigger the `Neon Grass` accent. For a "Premium" feel, use a 4px hard shadow of the same color.
- **Action Chips:** Small, uppercase labels using `JetBrains Mono` for categories like "Batting," "Bowling," or "Live Session."
- **Stats Cards:** Minimalist white surfaces with a thick 4px left-border in `Secondary Green`. Values are displayed in `Stat-Value` typography.
- **Inputs:** Clean, "Pitch White" backgrounds with 1px `Boundary Black` borders. On focus, the border thickens and changes to `Primary Green`.
- **Scoreboard Component:** A unique component designed to look like a digital stadium scoreboard, using high-contrast dark backgrounds and bright green typography for live updates.