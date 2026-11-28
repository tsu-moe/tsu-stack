import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/{-$locale}/(root-layout)")({ component: Outlet });
