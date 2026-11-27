import { FullWidthDivider } from "@/shared/ui/full-width-divider";
import { LogoCloud } from "@/shared/ui/logo-cloud"; // @efferd/logo-cloud-4

export function LogosSection() {
  return (
    <section className="pt-5 pb-10 *:border-r-0">
      <h2 className="font-heading mb-4 text-center text-lg font-medium tracking-tight text-muted-foreground md:text-xl">
        Used & Trusted by <span className="text-foreground">Legends</span>
      </h2>
      <div className="relative *:border-0">
        <FullWidthDivider className="-top-px" />
        <LogoCloud />
        <FullWidthDivider className="-bottom-px" />
      </div>
    </section>
  );
}
