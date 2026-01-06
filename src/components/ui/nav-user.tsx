"use client"

import {
    CreditCard,
    LogOut,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useSession } from "next-auth/react"

import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";
import { createBillingPortalUrl } from "@/services/stripe/create";
import { toast } from "sonner";
import { signOut } from "@/services/sign-out";
import { useOrganisation } from "@/hooks/useOrganisation"
import { levelFourAccess } from "@/constants/access"

export function NavUser() {
    const { data: session } = useSession();
    const { organisation } = useOrganisation();
    const hasLevelFourAccess = levelFourAccess.includes(session?.user.organisation?.role as string);

    async function handleSignOut() {
        await signOut()
    };

    async function handleBillingPortal() {
        try {
            if (organisation?.stripeCustomerId) {
                const billingUrl = await createBillingPortalUrl({ customerId: organisation?.stripeCustomerId });
                if (billingUrl) {
                    window.open(billingUrl, "_blank");
                } else {
                    throw new Error("Failed to create billing portal url")
                }
            } else {
                throw new Error("Organisation is invalid")
            }
        } catch (error) {
            toast("Failed to create billing portal url", { description: `${error}` })
        }
    }


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{`${session?.user.firstname?.slice(0, 1)}${session?.user.lastname?.slice(0, 1)}`}</AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="end"
                sideOffset={8}
            >
                <DropdownMenuLabel className="font-normal p-2!">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{`${session?.user.firstname?.slice(0, 1)}${session?.user.lastname?.slice(0, 1)}`}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{session?.user.firstname ?? "Name"} {session?.user.lastname ?? ""}</p>
                            <p className="text-xs leading-none text-muted-foreground">{session?.user.email}</p>
                        </div>
                    </div>
                </DropdownMenuLabel>
                {hasLevelFourAccess && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={handleBillingPortal}>
                                <CreditCard />
                                Billing
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
