import { Container } from "@/shared/ui/container";

import Content from "@/pages/privacy-policy/ui/privacy-policy-page/content.mdx";

export function PrivacyPolicyPage() {
  return (
    <Container className="prose not-dark:prose-invert">
      <Content />
    </Container>
  );
}
