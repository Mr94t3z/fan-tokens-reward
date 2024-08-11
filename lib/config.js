import { createPublicClient, http } from "viem";
import { base, base } from "viem/chains";

export const publicClient = createPublicClient({
    chain: base,
    transport: http(),
});