'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Trash2, TicketIcon } from 'lucide-react'
import { toast } from "sonner"
import { useOrganisationInvites } from '@/hooks/useOrganisationInvites'
import { deleteInviteCodeAdmin } from '@/services/firebase/admin-delete'
import { retrieveIdToken } from '@/services/firebase/retrieve'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'

interface Props {
    orgId: string | null;
}

const ActiveInviteCodesDialog: React.FC<Props> = ({ orgId }) => {
    const { invites, loading, error, refetch } = useOrganisationInvites(orgId);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    function handleCopy(code: string) {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        toast.success("Code copied to clipboard")
        setTimeout(() => setCopiedCode(null), 2000)
    }

    async function handleDelete(inviteId: string) {
        if (!orgId) return;

        try {
            setDeletingId(inviteId);
            const idToken = await retrieveIdToken();
            if (!idToken) {
                throw new Error("No authentication token found");
            }

            const { error } = await deleteInviteCodeAdmin({
                idToken,
                inviteId,
                orgId
            });

            if (error) throw new Error(error);

            toast.success("Invite code deleted");
            await refetch();
        } catch (err) {
            console.error("Failed to delete invite code:", err);
            toast.error(err instanceof Error ? err.message : "Failed to delete invite code");
        } finally {
            setDeletingId(null);
        }
    }

    function formatDate(timestamp: number | null | undefined): string {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function getRoleBadgeVariant(role: string | null | undefined): "default" | "secondary" | "destructive" | "outline" {
        switch (role) {
            case 'admin':
                return 'destructive';
            case 'developer':
                return 'default';
            case 'viewer':
                return 'secondary';
            default:
                return 'outline';
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <TicketIcon className="w-4 h-4 mr-2" />
                    Active Invite Codes
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className='mb-2'>Active Invite Codes</DialogTitle>
                    <Separator />
                    <DialogDescription>
                        View and manage all active invitation codes for your organisation.
                    </DialogDescription>
                </DialogHeader>

                <div className='pt-4'>
                    {loading && (
                        <div className="flex justify-center items-center py-8">
                            <Spinner />
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-destructive py-4">
                            Error: {error}
                        </div>
                    )}

                    {!loading && !error && invites && invites.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-8">
                            No active invite codes found. Create one using the &quot;Add Member&quot; button.
                        </div>
                    )}

                    {!loading && !error && invites && invites.length > 0 && (
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invite Code</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Uses Left</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invites.map((invite) => (
                                        <TableRow key={invite.id}>
                                            <TableCell className="font-mono text-sm">
                                                {invite.id}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getRoleBadgeVariant(invite.role)}>
                                                    {invite.role?.charAt(0).toUpperCase()}{invite.role?.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {invite.usesLeft ?? 0}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(invite.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCopy(invite.id as string)}
                                                        disabled={!invite.id}
                                                    >
                                                        {copiedCode === invite.id ? (
                                                            <Check className="w-4 h-4" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(invite.id as string)}
                                                        disabled={deletingId === invite.id || !invite.id}
                                                    >
                                                        {deletingId === invite.id ? (
                                                            <Spinner />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ActiveInviteCodesDialog
