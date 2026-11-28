import dark640 from "./dashboard-preview/dark-640.webp";
import dark1280 from "./dashboard-preview/dark-1280.webp";
import dark from "./dashboard-preview/dark.webp";
import light640 from "./dashboard-preview/light-640.webp";
import light1280 from "./dashboard-preview/light-1280.webp";
import light from "./dashboard-preview/light.webp";

export const dashboardPreviews = {
  dark: { src: dark, srcSet: `${dark640} 640w, ${dark1280} 1280w, ${dark} 1920w` },
  light: { src: light, srcSet: `${light640} 640w, ${light1280} 1280w, ${light} 1920w` }
};
