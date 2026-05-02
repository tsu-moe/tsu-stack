import { Container } from "@/shared/ui/container";

import Content from "@/pages/terms-of-service/ui/terms-of-service-page/content.mdx";

export function TermsOfServicePage() {
  return (
    <Container className="prose not-dark:prose-invert">
      <Content />
    </Container>
  );
}
