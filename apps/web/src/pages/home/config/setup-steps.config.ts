import { m } from "@tsu-stack/i18n/messages";

export const setupSteps: readonly {
  id: string;
  title: () => string;
  description: () => string;
  file?: string;
  lines: readonly string[];
}[] = [
  {
    id: "scaffold",
    title: m.home_page__setup_scaffold,
    description: m.home_page__setup_scaffold_description,
    lines: ["vpx create-tsu-stack@latest my-app --setup local --yes"]
  },
  {
    id: "configure",
    title: m.home_page__setup_configure,
    description: m.home_page__setup_configure_description,
    file: "my-app/packages/env/.env",
    lines: ["VITE_WEB_URL=http://localhost:3000/web", "VITE_SERVER_URL=http://localhost:5000/server"]
  },
  {
    id: "develop",
    title: m.home_page__setup_develop,
    description: m.home_page__setup_develop_description,
    lines: ["cd my-app", "vp run dev"]
  }
];
