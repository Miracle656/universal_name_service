import { useState, useEffect } from 'react';
import { PNSClient, PNSNetwork } from '@miracleorg/pns-sdk';
import { JsonRpcProvider } from 'ethers';

const PUSH_CHAIN_RPC = 'https://evm.donut.rpc.push.org/';

/**
 * Hook to fetch PNS name for a given address
 * @param address - The wallet address to lookup
 * @returns The PNS name if found, null if not found, undefined if loading
 */
export const usePNSName = (address: string | undefined) => {
    const [pnsName, setPnsName] = useState<string | null | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchPNSName = async () => {
            if (!address) {
                console.log('[usePNSName] No address provided');
                setPnsName(null);
                return;
            }

            console.log('[usePNSName] Fetching PNS name for address:', address);
            setLoading(true);
            try {
                // Initialize PNS client with read-only provider
                const provider = new JsonRpcProvider(PUSH_CHAIN_RPC);
                const pns = await PNSClient.initialize(provider, {
                    network: PNSNetwork.TESTNET,
                });

                console.log('[usePNSName] PNS client initialized, performing reverse lookup...');
                console.log('[usePNSName] Contract address:', pns.getContractAddress());

                // Try to get the primary name for this address
                try {
                    const name = await pns.reverseLookup(address);
                    console.log('[usePNSName] ✅ Reverse lookup SUCCESS! Name:', name);

                    if (isMounted) {
                        setPnsName(name || null);
                    }
                } catch (reverseError: any) {
                    console.log('[usePNSName] ❌ Reverse lookup failed:', reverseError.message);

                    // Try to get all names owned by this address as fallback
                    try {
                        const names = await pns.getNamesByOwner(address);
                        console.log('[usePNSName] Names owned by address:', names);

                        if (names && names.length > 0) {
                            console.log('[usePNSName] ⚠️ User has names but no primary name set. First name:', names[0]);
                        }
                    } catch (namesError) {
                        console.log('[usePNSName] Could not fetch names:', namesError);
                    }

                    if (isMounted) {
                        setPnsName(null);
                    }
                }
            } catch (error) {
                console.error('[usePNSName] Fatal error:', error);
                if (isMounted) {
                    setPnsName(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPNSName();

        return () => {
            isMounted = false;
        };
    }, [address]);

    return { pnsName, loading };
};
