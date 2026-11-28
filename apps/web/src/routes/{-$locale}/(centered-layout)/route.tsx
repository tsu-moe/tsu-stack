import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/{-$locale}/(centered-layout)")({ component: Outlet });
