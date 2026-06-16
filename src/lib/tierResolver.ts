import { TierName } from "@/config/pricing";

export interface AuthState {
    isLoaded: boolean;
    isSignedIn: boolean | undefined;
    isPro: boolean;
}

/**
 * Deterministically resolve the active tier from authentication state.
 * Defaults to the most restrictive tier (guest_free) when auth is not loaded.
 */
export function resolveTier(auth: AuthState): TierName {
    if (!auth.isLoaded) return "guest_free";
    if (auth.isPro) return "pro";
    if (auth.isSignedIn) return "user_free";
    return "guest_free";
}
