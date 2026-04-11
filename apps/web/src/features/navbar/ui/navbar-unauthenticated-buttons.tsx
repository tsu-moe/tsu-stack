import { useRouterState } from "@tanstack/react-router";

import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Button } from "@tsu-stack/ui/components/button";

export function NavbarUnauthenticatedButtons() {
  const routerState = useRouterState();
  const redirect = routerState.location.search?.redirect;

  return (
    <>
      <Button asChild size="sm" variant="outline">
        <Link to="/sign-in" search={redirect ? { redirect } : undefined}>
          {m.navbar__sign_in()}
        </Link>
      </Button>
      <Link to="/create-an-account" search={redirect ? { redirect } : undefined}>
        <Button light="skeuomorphic" size="sm">
          {m.navbar__get_started()}
        </Button>
      </Link>
    </>
  );
}
