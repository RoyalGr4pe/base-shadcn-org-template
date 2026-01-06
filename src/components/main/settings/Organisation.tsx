"use client";

// Local Imports
import { IUser } from '@/models/user';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import MembersTable from './MembersTable';
import AddMemberDialog from './dialogs/AddMemberDialog';
import { IOrganisation } from '@/models/organisation';
import CreateOrganisation from './CreateOrganisation';
import { useOrganisation } from '@/hooks/useOrganisation';
import { updateOrganisation } from '@/services/firebase/update';
import { Card, CardContent, CardFooter } from '../../ui/card';
import { levelFourAccess, levelThreeAccess, levelTwoAccess } from '@/constants/access';

// External Imports
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { CurrencyCombobox } from '@/components/ui/currency-combobox';
import ActiveInviteCodesDialog from './dialogs/ActiveInviteCodesDialog';


const Organisation = () => {
    // Hooks
    const { data: session } = useSession();
    const { organisation, refetch } = useOrganisation();

    // States
    const [changes, setChanges] = useState<Partial<IOrganisation>>({});
    const [loading, setLoading] = useState(false);

    const hasLevelTwoAccess = levelTwoAccess.includes(session?.user.organisation?.role as string);
    const hasLevelThreeAccess = levelThreeAccess.includes(session?.user.organisation?.role as string);
    const hasLevelFourAccess = levelFourAccess.includes(session?.user.organisation?.role as string);

    // Merge organisation with any pending changes
    const updateOrg = organisation ? { ...organisation, ...changes } : undefined;

    const handleChange = (key: keyof IOrganisation, value: unknown) => {
        setChanges((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        if (!hasLevelFourAccess) return;

        setLoading(true);

        const { error } = await updateOrganisation({ organisation: updateOrg as IOrganisation })

        if (error) {
            toast.error("Failed to update user", {
                description: error,
            });
        } else {
            toast.success("Organisation updated successfully");
            setChanges({}); // Clear changes after successful save
        }
        refetch()

        setLoading(false);
    }

    return (
        <div className='space-y-4'>
            <div>
                <h3 className="text-lg font-medium">Organisation</h3>
                <p className="text-muted-foreground text-sm">Your organisation information</p>
            </div>

            {organisation && (
                <>
                    <Card>
                        <CardContent className="grid gap-4">
                            {hasLevelThreeAccess && (
                                <div className="grid gap-2">
                                    <Label>ID</Label>
                                    <Input
                                        value={organisation?.id || ""}
                                        readOnly
                                    />
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label>Name</Label>
                                <Input
                                    value={updateOrg?.name || ""}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    readOnly={!hasLevelFourAccess}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Currency</Label>
                                <CurrencyCombobox
                                    value={updateOrg?.currency || ""}
                                    onValueChange={(value) => handleChange("currency", value)}
                                    readOnly={!hasLevelFourAccess}
                                />
                            </div>
                        </CardContent>
                        {hasLevelFourAccess && (
                            <CardFooter className="justify-end">
                                <Button onClick={handleSave} disabled={loading}>
                                    {loading && <Loader2Icon className="animate-spin" />}
                                    {loading ? "Updating" : "Save Changes"}
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                    <div className="text-muted-foreground text-sm w-full flex justify-between px-4">
                        <div>
                            {organisation?.members} active member{(organisation?.members && organisation?.members > 1) ? "s" : ""}
                        </div>
                        <div>
                            Created {updateOrg?.createdAt
                                ? formatDistanceToNow(updateOrg.createdAt, { addSuffix: true })
                                : "N/A"}
                        </div>
                    </div>
                    {hasLevelTwoAccess && (
                        <div className='space-y-4 mt-12'>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-medium">Members</h3>
                                    <p className="text-muted-foreground text-sm">Your members information</p>
                                </div>
                                <div className='md:space-x-4 space-y-4 md:space-y-0 flex flex-col md:flex-row'>
                                    {hasLevelThreeAccess && <ActiveInviteCodesDialog orgId={organisation.id as string} />}
                                    {hasLevelThreeAccess && <AddMemberDialog organisation={organisation as IOrganisation} />}
                                </div>
                            </div>
                            <MembersTable organisation={organisation as IOrganisation} />
                        </div>
                    )}
                </>
            )}

            {!organisation && (
                <CreateOrganisation refetch={refetch} user={session?.user as IUser} />
            )}
        </div>
    )
}

export default Organisation
