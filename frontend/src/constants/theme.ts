/**
 * ─────────────────────────────────────────────────────────────────────────────
 * HH PUZZLE — Central Design Theme
 * ─────────────────────────────────────────────────────────────────────────────
 * All visual design tokens live here. To switch themes (e.g. light mode,
 * alternate palette) change values in this single file — every screen and
 * component that imports `theme` will update automatically.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const theme = {
  // ── Colors ────────────────────────────────────────────────────────────────
  colors: {
    // Page / screen backgrounds
    background: '#111111',       // main app background (HomeScreen)
    backgroundAlt: '#1a1a1a',    // secondary screens (auth, profile, detail)

    // Surface / card backgrounds
    surface: '#1a1600',          // warm dark card (PuzzleCard)
    surfaceAlt: '#1e1a0e',       // warm dark panel (stats bar)
    surfaceDark: '#1a1500',      // daily challenge bg
    card: '#2a2a2a',             // neutral card (profile stats, achievements)

    // ── Gold palette (primary brand colour) ──
    primary: '#FFD700',          // main gold — titles, CTAs, accents
    primaryDark: '#B8860B',      // dark gold — labels, tags
    primaryMid: '#C8A951',       // mid gold — meta values
    primaryMuted: '#8a7a40',     // muted gold — secondary labels
    primaryFaint: '#6a5a20',     // faint gold — catalog numbers, timestamps

    // ── Amber palette (Crate Digger / vinyl warmth — game screen accents) ──
    primaryAmber: '#c8832a',     // warm amber — selected cell, hint panel accent
    primaryAmberDark: '#7a5020', // dark amber — needle arm, groove line
    primaryAmberMuted: '#4a3018',// muted amber — highlighted word border

    // ── Borders & dividers ──
    border: '#3a3020',           // warm dark border (vintage feel)
    borderLight: '#2a2a2a',      // neutral border (profile sections)
    borderFaint: '#5a4a10',      // difficulty badge border

    // ── Text ──
    textPrimary: '#FFFFFF',      // primary body text
    textSecondary: '#CCCCCC',    // secondary body text
    textMuted: '#999999',        // muted / placeholder text
    textFaint: '#666666',        // very faint text
    textOnPrimary: '#1a1a1a',    // text rendered on gold backgrounds

    // ── Difficulty colours ──
    difficultyEasy: '#4a7c4e',
    difficultyMedium: '#8a6a1a',
    difficultyHard: '#7c2a2a',

    // ── Semantic ──
    error: '#ff4444',
    errorDark: '#cc0000',
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',

    // ── Crossword grid ──
    cellBackground: '#F5F0E0',   // warm off-white — vintage paper
    cellBorder: '#888877',       // cell grid line
    cellBlack: '#111111',        // blocked cell fill
    cellBlackBorder: '#000000',  // blocked cell border
    cellWordHighlight: '#3a2e00',// active word highlight (dark warm gold)
    cellRevealed: '#1a2e1a',     // hint-revealed cell bg (dark green)
    cellRevealedText: '#5aaa5a', // hint-revealed letter colour
    cellClueNum: '#555544',      // small clue number inside cell
    keyBackground: '#2e2a1a',    // keyboard key background
  },

  // ── Typography ────────────────────────────────────────────────────────────
  typography: {
    sizes: {
      xxs: 8,
      xs: 9,
      sm: 10,
      md: 11,
      base: 12,
      lg: 14,
      xl: 15,
      xxl: 16,
      xxxl: 18,
      h4: 20,
      h3: 22,
      h2: 24,
      h1: 36,
      display: 48,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extrabold: '800' as const,
      black: '900' as const,
    },
    letterSpacing: {
      none: 0,
      tight: 1,
      normal: 2,
      wide: 3,
      wider: 4,
      widest: 8,
    },
  },

  // ── Spacing ───────────────────────────────────────────────────────────────
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 6,
    md: 8,
    base: 10,
    lg: 12,
    xl: 14,
    xxl: 16,
    xxxl: 20,
    section: 24,
    page: 30,
    hero: 40,
    giant: 60,
  },

  // ── Border Radius ─────────────────────────────────────────────────────────
  borderRadius: {
    none: 0,
    sm: 6,
    md: 10,
    lg: 12,
    xl: 16,
    full: 50,
  },

  // ── Borders ───────────────────────────────────────────────────────────────
  borders: {
    thin: 1,
    medium: 2,
    thick: 4,
  },
} as const;

// ── Convenience re-exports ─────────────────────────────────────────────────
// Import individual tokens directly: `import { colors } from '../constants/theme'`
export const colors = theme.colors;
export const typography = theme.typography;
export const spacing = theme.spacing;
export const borderRadius = theme.borderRadius;
export const borders = theme.borders;
