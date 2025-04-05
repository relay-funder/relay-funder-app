"use server"

import { z } from "zod"
import { type Address, type Hash } from "viem"

// Keep the Zod schema for validation
const roundSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(30),
    matchingPool: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Matching pool must be a non-negative number.",
    }),
    tokenAddress: z.string().refine((val): val is Address => /^0x[a-fA-F0-9]{40}$/.test(val), {
        message: "Invalid token address format.",
    }),
    tokenDecimals: z.coerce.number().int().min(0).max(18),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start date." }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end date." }),
    applicationStart: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid application start date." }),
    applicationClose: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid application close date." }),
    logoUrl: z.string().url().optional().or(z.literal("")),
    profileId: z.string().refine((val): val is Hash => /^0x[a-fA-F0-9]{64}$/.test(val), {
        message: "Invalid Profile ID format (bytes32).",
    }),
    managerAddress: z.string().refine((val): val is Address => /^0x[a-fA-F0-9]{40}$/.test(val), {
        message: "Invalid manager address format.",
    }),
})

// Keep the date validations
const refinedRoundSchema = roundSchema.refine(data => new Date(data.applicationClose) > new Date(data.applicationStart), {
    message: "Application close date must be after application start date.",
    path: ["applicationClose"],
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
    message: "Round end date must be after round start date.",
    path: ["endDate"],
}).refine(data => new Date(data.startDate) >= new Date(data.applicationClose), {
    message: "Round start date must be on or after application close date.",
    path: ["startDate"],
})

type RoundFormData = z.infer<typeof refinedRoundSchema>

// Define a standard response type - might not be needed if action isn't called for submission
type CreateRoundActionResult = {
    success: boolean;
    // data?: { transactionHash: Hash }; // Transaction hash is now handled client-side
    error?: string;
    fieldErrors?: Record<string, string[]>;
}

// This action *could* be used for pre-validation or storing metadata off-chain,
// but it no longer initiates the blockchain transaction.
export async function validateRoundDataAction(formData: RoundFormData): Promise<CreateRoundActionResult> {
    try {
        // Validate with Zod
        const result = refinedRoundSchema.safeParse(formData);
        if (!result.success) {
            console.log("Server Action: Validation failed", result.error.flatten().fieldErrors);
            return {
                success: false,
                fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
            };
        }

        const data = result.data;
        console.log("Server Action: validateRoundDataAction received valid data:", data);

        // --- NO BLOCKCHAIN INTERACTION HERE ---
        // The `createPool` call is removed.
        // If you needed to, e.g., upload metadata to IPFS here, you would do it
        // and potentially return the CID.

        // For now, just return success if validation passes
        return { success: true };

    } catch (error: unknown) {
        console.error("Error in server action (validation):", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred during validation.";
        return { success: false, error: errorMessage };
    }
} 