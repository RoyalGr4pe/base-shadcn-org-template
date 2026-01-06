// Local Imports
import { IMemberInvite } from "@/models/invite";
import { retrieveIdToken } from "@/services/firebase/retrieve";
import { invitesCookieKey } from "@/constants/cookies";
import { getCookie, setCookie } from "@/utils/cookie-handlers";
import { retrieveOrganisationInvites } from "@/services/firebase/admin-retrieve";

// External Imports
import { useState, useEffect, useCallback } from "react";

interface UseOrganisationInvitesReturn {
    invites: IMemberInvite[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useOrganisationInvites(orgId: string | null): UseOrganisationInvitesReturn {
    const [invites, setInvites] = useState<IMemberInvite[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInvites = useCallback(
        async ({ reload = false } = {}) => {
            if (!orgId) {
                setInvites(null);
                setError("No organisation ID provided");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const cookieKey = `${orgId}_${invitesCookieKey}`;

                // Step 1: Try cache
                if (!reload) {
                    const cached = getCookie(cookieKey);
                    if (cached) {
                        setInvites(JSON.parse(cached));
                        setLoading(false);
                        return;
                    }
                }

                // Step 2: Get Firebase ID token
                const idToken = await retrieveIdToken()
                if (!idToken) {
                    throw new Error("No id token found")
                }

                // Step 3: Fetch from backend
                const { invites: fetched, error: err } = await retrieveOrganisationInvites({ idToken, orgId });
                if (err) {
                    throw new Error(err);
                }

                setInvites(fetched ?? []);
                // Step 4: Cache for 1 hour
                setCookie(cookieKey, JSON.stringify(fetched ?? []), { expires: 1 / 24 });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch invites");
                setInvites(null);
            } finally {
                setLoading(false);
            }
        },
        [orgId]
    );

    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    const refetch = useCallback(async () => {
        await fetchInvites({ reload: true });
    }, [fetchInvites]);

    return { invites, loading, error, refetch };
}
