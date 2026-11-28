import { useLocale } from "@tsu-stack/i18n/tanstack-start/components/locale-provider";

import TermsDe from "@/pages/terms-of-service/content/terms-of-service.de.mdx";
import TermsEn from "@/pages/terms-of-service/content/terms-of-service.mdx";

export function TermsOfServicePage() {
  const { locale } = useLocale();
  const Content = locale === "de" ? TermsDe : TermsEn;
  return <Content />;
}
