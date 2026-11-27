import { m } from "@tsu-stack/i18n/messages";

import appAvatar from "@/pages/home/assets/testimonials/app.webp";
import frontendAvatar from "@/pages/home/assets/testimonials/frontend.webp";
import fullStackAvatar from "@/pages/home/assets/testimonials/full-stack.webp";
import maintainerAvatar from "@/pages/home/assets/testimonials/maintainer.webp";
import platformAvatar from "@/pages/home/assets/testimonials/platform.webp";
import uiAvatar from "@/pages/home/assets/testimonials/ui.webp";

export const sampleRows = [
  {
    direction: "left",
    testimonials: [
      {
        initials: "FE",
        avatar: frontendAvatar,
        role: m.home_page__testimonial_frontend_role,
        quote: m.home_page__testimonial_frontend
      },
      {
        initials: "FS",
        avatar: fullStackAvatar,
        role: m.home_page__testimonial_full_stack_role,
        quote: m.home_page__testimonial_full_stack
      },
      {
        initials: "PE",
        avatar: platformAvatar,
        role: m.home_page__testimonial_platform_role,
        quote: m.home_page__testimonial_platform
      }
    ]
  },
  {
    direction: "right",
    testimonials: [
      {
        initials: "MT",
        avatar: maintainerAvatar,
        role: m.home_page__testimonial_maintainer_role,
        quote: m.home_page__testimonial_maintainer
      },
      {
        initials: "AD",
        avatar: appAvatar,
        role: m.home_page__testimonial_app_role,
        quote: m.home_page__testimonial_app
      },
      { initials: "UE", avatar: uiAvatar, role: m.home_page__testimonial_ui_role, quote: m.home_page__testimonial_ui }
    ]
  }
] as const;
