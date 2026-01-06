"use client"

// Local Imports
import { IUser } from '@/models/user';
import { Badge } from '../../ui/badge';
import NoContent from '../../ui/no-content';
import { Button } from '../../ui/button';
import { IOrganisation } from '@/models/organisation';
import UpdateMemberDialog from './dialogs/UpdateMemberDialog';
import { levelFourAccess } from '@/constants/access';
import { IconDotsVertical } from '@tabler/icons-react';
import { useOrganisationMembers } from '@/hooks/useOrganisationMembers';
import { updateOrganisationMember } from '@/services/firebase/update';
import { Card, CardContent, CardFooter } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { Input } from '../../ui/input';

// External Imports
import { ChevronLeft, ChevronRight, Loader2Icon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';


const PAGE_SIZE = 10

interface Props {
    organisation: IOrganisation;
}
const MembersTable: React.FC<Props> = ({ organisation }) => {
    const { data: session } = useSession();
    const { members, loading: loadingMembers, error: membersError, refetch: refetchMembers } = useOrganisationMembers(organisation?.id as string);

    // Search
    const [searchQuery, setSearchQuery] = useState('')

    // Filter members based on search query
    const filteredMembers = members?.filter((member) => {
        if (!searchQuery) return true

        const query = searchQuery.toLowerCase()
        const fullName = `${member.firstname} ${member.lastname}`.toLowerCase()
        const email = member.email?.toLowerCase() ?? ''
        const role = member.organisation?.role?.toLowerCase() ?? ''

        return fullName.includes(query) || email.includes(query) || role.includes(query)
    }) ?? []

    // Pagination
    const [page, setPage] = useState(1)

    // Reset to page 1 when search query changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setPage(1)
    }
    const pageCount = Math.ceil((filteredMembers?.length ?? 0) / PAGE_SIZE)
    const pagedMembers = filteredMembers?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];


    async function handleRemove(member: IUser) {
        try {
            const { error } = await updateOrganisationMember({ member, organisation, remove: true });
            if (error) throw error;

            toast("Member removed", {
                description: "This member has been successfully removed",
            });

        } catch {
            toast("Failed to remove member", {
                description: "Something went wrong while removing this member. Please try again.",
            });
        }
    }
    return (
        <Card>
            <CardContent className="overflow-x-auto">
                {loadingMembers ? (
                    <div className="flex justify-center p-4">
                        <Loader2Icon className="animate-spin h-6 w-6" />
                    </div>
                ) : membersError ? (
                    <NoContent text={membersError} />
                ) : (
                    <>
                        <div className="pb-4 pt-1">
                            <Input
                                placeholder="Search by name, email, or role..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pagedMembers.map((m) => (
                                <TableRow key={m.id} >
                                    <TableCell className="cursor-default">{m.firstname} {m.lastname}</TableCell>
                                    <TableCell className="cursor-default">{m.email}</TableCell>
                                    <TableCell className="cursor-default capitalize">
                                        <Badge variant="outline">
                                            {m.organisation?.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="cursor-default">
                                        {m.organisation?.joinedAt
                                            ? formatDistanceToNow(m.organisation?.joinedAt, { addSuffix: true })
                                            : "—"}
                                    </TableCell>
                                    <TableCell className='flex justify-end'>
                                        {(levelFourAccess.includes(session?.user.organisation?.role as string) &&
                                            m.id !== session?.user.id &&
                                            m.organisation?.role !== "owner") && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                                        size="icon"
                                                    >
                                                        <IconDotsVertical />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-32">
                                                    <UpdateMemberDialog member={m} organisation={m.organisation as IOrganisation} refetch={refetchMembers} />
                                                    <DropdownMenuItem variant="destructive" onClick={() => handleRemove(m)}>Remove</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {pagedMembers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No members found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </>
                )}
            </CardContent>
            <CardFooter className="w-full flex justify-end">
                <Button
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className='rounded-r-none'
                >
                    <ChevronLeft />
                </Button>
                <Button
                    size="sm"
                    className='flex justify-center rounded-none'
                    disabled={page === pageCount || page === 1}
                >
                    {page} of {pageCount || 1}
                </Button>
                <Button
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={page === pageCount}
                    className='rounded-l-none'
                >
                    <ChevronRight />
                </Button>
            </CardFooter>
        </Card>
    )
}

export default MembersTable
