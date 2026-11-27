import {
  UserPlusIcon,
  BarChart3Icon,
  PlugIcon,
  CodeIcon,
  UsersIcon,
  StarIcon,
  HandshakeIcon,
  FileTextIcon,
  LeafIcon,
  HelpCircleIcon
} from "lucide-react";

export type LinkItemType = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  description?: string;
};

export const featuresLinks: LinkItemType[] = [
  {
    label: "Team Collaboration",
    href: "#",
    description: "Tools to help your teams work better together",
    icon: <UserPlusIcon />
  },
  {
    label: "Analytics",
    href: "#",
    description: "Track and analyze your website traffic",
    icon: <BarChart3Icon />
  },
  {
    label: "Integrations",
    href: "#",
    description: "Connect your apps and services",
    icon: <PlugIcon />
  },
  {
    label: "API",
    href: "#",
    description: "Build custom integrations with our API",
    icon: <CodeIcon />
  }
];

export const companyLinks: LinkItemType[] = [
  {
    label: "About Us",
    href: "#",
    description: "about our company",
    icon: <UsersIcon />
  },
  {
    label: "Customer Stories",
    href: "#",
    description: "See how we’ve helped",
    icon: <StarIcon />
  },
  {
    label: "Partnerships",
    href: "#",
    icon: <HandshakeIcon />,
    description: "Collaborate with us"
  }
];

export const companyLinks2: LinkItemType[] = [
  {
    label: "Changelog",
    href: "#",
    icon: <FileTextIcon />
  },
  {
    label: "Blog",
    href: "#",
    icon: <LeafIcon />
  },
  {
    label: "Help Center",
    href: "#",
    icon: <HelpCircleIcon />
  }
];
