import { type ReactNode } from "react";

export type SidebarNavItem = {
  title: string;
  hash: string;
  icon?: ReactNode;
  subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
};
