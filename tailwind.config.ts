import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "md-primary": "hsl(var(--md-sys-color-primary))",
        "md-on-primary": "hsl(var(--md-sys-color-on-primary))",
        "md-primary-container":
          "hsl(var(--md-sys-color-primary-container))",
        "md-on-primary-container":
          "hsl(var(--md-sys-color-on-primary-container))",
        "md-secondary": "hsl(var(--md-sys-color-secondary))",
        "md-on-secondary": "hsl(var(--md-sys-color-on-secondary))",
        "md-secondary-container":
          "hsl(var(--md-sys-color-secondary-container))",
        "md-on-secondary-container":
          "hsl(var(--md-sys-color-on-secondary-container))",
        "md-tertiary": "hsl(var(--md-sys-color-tertiary))",
        "md-on-tertiary": "hsl(var(--md-sys-color-on-tertiary))",
        "md-tertiary-container":
          "hsl(var(--md-sys-color-tertiary-container))",
        "md-on-tertiary-container":
          "hsl(var(--md-sys-color-on-tertiary-container))",
        "md-error": "hsl(var(--md-sys-color-error))",
        "md-on-error": "hsl(var(--md-sys-color-on-error))",
        "md-error-container": "hsl(var(--md-sys-color-error-container))",
        "md-on-error-container":
          "hsl(var(--md-sys-color-on-error-container))",
        "md-background": "hsl(var(--md-sys-color-background))",
        "md-on-background": "hsl(var(--md-sys-color-on-background))",
        "md-surface": "hsl(var(--md-sys-color-surface))",
        "md-on-surface": "hsl(var(--md-sys-color-on-surface))",
        "md-surface-variant": "hsl(var(--md-sys-color-surface-variant))",
        "md-on-surface-variant":
          "hsl(var(--md-sys-color-on-surface-variant))",
        "md-surface-dim": "hsl(var(--md-sys-color-surface-dim))",
        "md-surface-bright": "hsl(var(--md-sys-color-surface-bright))",
        "md-surface-container-lowest":
          "hsl(var(--md-sys-color-surface-container-lowest))",
        "md-surface-container-low":
          "hsl(var(--md-sys-color-surface-container-low))",
        "md-surface-container":
          "hsl(var(--md-sys-color-surface-container))",
        "md-surface-container-high":
          "hsl(var(--md-sys-color-surface-container-high))",
        "md-surface-container-highest":
          "hsl(var(--md-sys-color-surface-container-highest))",
        "md-outline": "hsl(var(--md-sys-color-outline))",
        "md-outline-variant": "hsl(var(--md-sys-color-outline-variant))",
        "md-scrim": "hsl(var(--md-sys-color-scrim))",
        "md-inverse-surface": "hsl(var(--md-sys-color-inverse-surface))",
        "md-inverse-on-surface":
          "hsl(var(--md-sys-color-inverse-on-surface))",
        "md-inverse-primary": "hsl(var(--md-sys-color-inverse-primary))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        "weak-foreground": "hsl(var(--weak-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        success: "hsl(var(--success))",
        "success-foreground": "hsl(var(--success-foreground))",
        info: "hsl(var(--info))",
        "info-foreground": "hsl(var(--info-foreground))",
        warning: "hsl(var(--warning))",
        "warning-foreground": "hsl(var(--warning-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        none: "var(--md-sys-shape-corner-none)",
        xs: "var(--md-sys-shape-corner-extra-small)",
        sm: "var(--md-sys-shape-corner-small)",
        md: "var(--md-sys-shape-corner-medium)",
        lg: "var(--md-sys-shape-corner-large)",
        xl: "var(--md-sys-shape-corner-extra-large)",
        full: "var(--md-sys-shape-corner-full)",
      },
      boxShadow: {
        "md-0": "var(--md-sys-elevation-level0)",
        "md-1": "var(--md-sys-elevation-level1)",
        "md-2": "var(--md-sys-elevation-level2)",
        "md-3": "var(--md-sys-elevation-level3)",
        "md-4": "var(--md-sys-elevation-level4)",
        "md-5": "var(--md-sys-elevation-level5)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
        ],
      },
      fontSize: {
        "label-sm": [
          "var(--md-sys-typescale-label-small-size)",
          "var(--md-sys-typescale-label-small-line-height)",
        ],
        "label-md": [
          "var(--md-sys-typescale-label-medium-size)",
          "var(--md-sys-typescale-label-medium-line-height)",
        ],
        "label-lg": [
          "var(--md-sys-typescale-label-large-size)",
          "var(--md-sys-typescale-label-large-line-height)",
        ],
        "body-sm": [
          "var(--md-sys-typescale-body-small-size)",
          "var(--md-sys-typescale-body-small-line-height)",
        ],
        "body-md": [
          "var(--md-sys-typescale-body-medium-size)",
          "var(--md-sys-typescale-body-medium-line-height)",
        ],
        "body-lg": [
          "var(--md-sys-typescale-body-large-size)",
          "var(--md-sys-typescale-body-large-line-height)",
        ],
        "title-sm": [
          "var(--md-sys-typescale-title-small-size)",
          "var(--md-sys-typescale-title-small-line-height)",
        ],
        "title-md": [
          "var(--md-sys-typescale-title-medium-size)",
          "var(--md-sys-typescale-title-medium-line-height)",
        ],
        "title-lg": [
          "var(--md-sys-typescale-title-large-size)",
          "var(--md-sys-typescale-title-large-line-height)",
        ],
        "headline-sm": [
          "var(--md-sys-typescale-headline-small-size)",
          "var(--md-sys-typescale-headline-small-line-height)",
        ],
        "headline-md": [
          "var(--md-sys-typescale-headline-medium-size)",
          "var(--md-sys-typescale-headline-medium-line-height)",
        ],
        "display-sm": [
          "var(--md-sys-typescale-display-small-size)",
          "var(--md-sys-typescale-display-small-line-height)",
        ],
      },
      fontWeight: {
        regular: "var(--md-sys-typescale-font-weight-regular)",
        medium: "var(--md-sys-typescale-font-weight-medium)",
        bold: "var(--md-sys-typescale-font-weight-bold)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
