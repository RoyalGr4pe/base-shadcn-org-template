import { CurrencyCode } from "@/constants/currencies";
import { memberLimits } from "@/constants/limits";

export type SubscriptionType = keyof typeof memberLimits;

interface IOrganisation {
    id?: string | null;
    name?: string | null;
    stripeCustomerId?: string | null;
    currency?: CurrencyCode;

    subscription?: SubscriptionType | null;
    members?: number | null;

    ownerId?: string | null;
    createdAt?: number | null;
}

export type { IOrganisation }