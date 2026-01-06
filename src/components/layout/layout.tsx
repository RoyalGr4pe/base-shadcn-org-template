"use client"

// Local Imports
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SiteHeader } from "@/components/ui/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

// External Imports
import { usePathname } from "next/navigation";
import FirebaseProvider from "../firebase-provider";

export default function Layout({ className, children }: { className?: string, children: React.ReactNode }) {
    const pathname = usePathname();
    const title =
        pathname === "/" || pathname === "/dashboard"
            ? "Dashboard"
            : pathname
                .split("/")
                .filter(Boolean)
                .pop()!
                .split("-")
                .map(w => w[0]?.toUpperCase() + w.slice(1))
                .join(" ");

    return (
        <FirebaseProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <SiteHeader />

                    <main className={`h-full w-full p-4 ${className} bg-[#F9F9F9] dark:bg-[#0f0f0f]`} >
                        <h1 className="text-2xl font-semibold tracking-tight mb-4">{title}</h1>
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </FirebaseProvider>
    )
}