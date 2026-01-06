"use client"

// Local Imports
import { auth } from "@/lib/firebase/config"
import { Button } from "@/components/ui/button"
import { signOut } from "@/services/sign-out"
import { Separator } from "./ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// External Imports
import { onAuthStateChanged } from "firebase/auth"
import React, { useEffect } from "react"
import { useSession } from "next-auth/react"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
    children: React.ReactNode;
}

const FirebaseProvider: React.FC<Props> = ({ children }) => {
    const router = useRouter();
    const { status } = useSession();

    // Derive showDialog directly from status instead of using effect
    const showDialog = status === "unauthenticated";

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async () => {
            if (auth.currentUser) {
                const path = window.location.pathname;

                if (path == "/preparing") {
                    router.push("/dashboard")
                }
            }
        })
        return unsubscribe
    }, [router])

    const handleReLogin = async () => {
        await signOut("/login");
        router.push("/login")
    }


    if (showDialog) {
        return (
            <Dialog open>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Session Expired</DialogTitle>
                        <Separator />
                    </DialogHeader>
                    <p className="text-muted-foreground">Your session has expired or you’ve been logged out. Please log back in to continue.</p>
                    <div className="flex justify-center items-center mt-4">
                        <Button onClick={handleReLogin}>
                            Go to login
                            <ArrowRight />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return <>{children}</>
}

export default FirebaseProvider