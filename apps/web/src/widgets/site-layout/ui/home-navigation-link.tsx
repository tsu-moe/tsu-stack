import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";

export function HomeNavigationLink({ children, href, ...props }: React.ComponentProps<"a"> & { href: string }) {
  if (href.startsWith("#")) {
    return (
      <Link {...props} to="/" hash={href.slice(1)} activeOptions={{ exact: true, includeHash: true }}>
        {children}
      </Link>
    );
  }

  return (
    <a {...props} href={href}>
      {children}
    </a>
  );
}
