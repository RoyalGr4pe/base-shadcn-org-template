import { NavUser } from "./nav-user"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "../theme-toggle"
import PlatformSearch from "./platform-search"
import { SidebarTrigger } from "./sidebar"
import { NotificationsButton } from "./notifications-button"


export function SiteHeader() {
    return (
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />

                <div className="flex justify-start items-center gap-4">
                    <PlatformSearch />
                </div>
                <div className="ml-auto flex justify-center items-center gap-4">
                    <NotificationsButton />
                    <ModeToggle />
                    <Separator
                        orientation="vertical"
                        className="mx-1 data-[orientation=vertical]:h-4"
                    />
                    <NavUser />
                </div>
            </div>
        </header>
    );
}
