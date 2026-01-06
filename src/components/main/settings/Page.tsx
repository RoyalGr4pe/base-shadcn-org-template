'use client';

// Local Imports
import Billing from './Billing';
import Overview from './Overview';
import Organisation from './Organisation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

// External Imports
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';


export default function Page() {
    const router = useRouter();
    const pathname = usePathname();
    const [value, setValue] = useState<string>('overview');

    const updateHash = useCallback(
        (tabValue: string) => {
            setValue(tabValue);
            const newUrl = `${pathname}#${tabValue}`;
            router.replace(newUrl, { scroll: false });
        },
        [pathname, router]
    );

    const tabs = useMemo(() => {
        const base = [
            { value: "overview", label: "Overview" },
            { value: "organisation", label: "Organisation" },
            { value: "billing", label: "Billing" },
        ];
        return base;
    }, []);


    // Update active tab based on URL hash on mount or hash change
    useEffect(() => {
        const syncFromHash = () => {
            const hash = window.location.hash.slice(1);
            if (tabs.some(t => t.value === hash)) {
                setValue(hash);
            } else {
                updateHash("overview");
            }
        };

        // Initial load
        syncFromHash();

        // Listen for future changes (e.g., clicking external links or browser back)
        window.addEventListener("hashchange", syncFromHash);

        return () => {
            window.removeEventListener("hashchange", syncFromHash);
        };
    }, [updateHash, tabs]);



    return (
        <Tabs value={value} onValueChange={updateHash}>
            <TabsList>
                {tabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>

            {tabs.map(tab => (
                <TabsContent key={tab.value} value={tab.value} className="p-4">
                    {{
                        overview: <Overview />,
                        organisation: <Organisation />,
                        billing: <Billing />,
                    }[tab.value]}
                </TabsContent>
            ))}
        </Tabs>
    );
}
