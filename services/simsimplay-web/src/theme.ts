import { createDarkTheme, createLightTheme, type BrandVariants, type Theme } from "@fluentui/react-components";

// Brand ramp derived from plan Section 6 `primary` (#0F766E).
const brand: BrandVariants = {
  10: "#020B0A",
  20: "#0B1E1C",
  30: "#0E2E2B",
  40: "#0F3C38",
  50: "#104B45",
  60: "#125A52",
  70: "#13695F",
  80: "#14786C",
  90: "#0F766E",
  100: "#1E8A7E",
  110: "#3D9D92",
  120: "#5CB0A6",
  130: "#7CC3BA",
  140: "#A0D6CF",
  150: "#C5E8E3",
  160: "#E8F7F5",
};

export const simsimplayThemes: Record<"light" | "dark", Theme> = {
  light: { ...createLightTheme(brand) },
  dark: { ...createDarkTheme(brand) },
};
