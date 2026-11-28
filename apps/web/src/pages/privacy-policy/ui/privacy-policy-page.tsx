import { useLocale } from "@tsu-stack/i18n/tanstack-start/components/locale-provider";

import PrivacyDe from "@/pages/privacy-policy/content/privacy-policy.de.mdx";
import PrivacyEn from "@/pages/privacy-policy/content/privacy-policy.mdx";

export function PrivacyPolicyPage() {
  const { locale } = useLocale();
  const Content = locale === "de" ? PrivacyDe : PrivacyEn;
  return <Content />;
}
