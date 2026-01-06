import { Home, Settings, LucideIcon, Dice1, UserRound, Wallet, Store } from "lucide-react";

export interface IItem {
    title: string;
    url: string;
    icon: LucideIcon;
    description: string;
    type: "page";
    items?: IItem[];
}

export const sidebarItems = {
    application: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: Home,
            description: "Overview of your finances",
            type: "page" as const
        },
    ] as IItem[],
    'extra-information': [
        {
            title: "Random 1",
            url: "/random-1",
            icon: Dice1,
            description: "Random information page",
            type: "page" as const,
            items: [
                {
                    title: "Random Sub 1",
                    url: "/random/sub-1",
                    icon: Dice1,
                    description: "Random information page 1",
                    type: "page" as const
                }
            ]
        },
    ] as IItem[]
} as const satisfies Record<string, IItem[]>;


export const sidebarFooter = [
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        description: "Manage your settings and preferences",
        type: "page" as const
    },
] as IItem[]; 


export const settingsSubItems: IItem[] = [
    {
        title: "Overview",
        description: "Edit personal information",
        type: "page",
        url: "/settings#overview",
        icon: UserRound,
    },
    {
        title: "Organisation",
        description: "Edit organisational data & add members",
        type: "page",
        url: "/settings#organisation",
        icon: Store,
    },
    {
        title: "Billing",
        description: "View billing & manage memberships",
        type: "page",
        url: "/settings#billing",
        icon: Wallet,
    },
];