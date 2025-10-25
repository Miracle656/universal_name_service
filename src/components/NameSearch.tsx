import { useState, useEffect } from 'react';
import { usePushWalletContext, usePushChainClient, PushUI } from '@pushchain/ui-kit';
import { PushChain } from '@pushchain/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Crown, Calendar, User, Network, Info } from 'lucide-react';
import { toast } from 'sonner';
import { formatEther, Contract, BrowserProvider } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { ethers, getAddress } from 'ethers';
import { storeNameRegistration } from '../firebase/services';

interface NameSearchProps {
  searchName: string;
  onRegisterSuccess: () => void;
}

export const NameSearch = ({ searchName, onRegisterSuccess }: NameSearchProps) => {
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [nameData, setNameData] = useState<{
    available: boolean;
    owner?: string;
    expiresAt?: bigint;
    isPremium?: boolean;
    fee?: string;
  } | null>(null);
  const [originInfo, setOriginInfo] = useState<{
    chainNamespace: string;
    chainId: string;
    isUEA: boolean;
  } | null>(null);

  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;

  // Initialize contract when connected
  useEffect(() => {
    const initContract = async () => {
      if (isConnected && pushChainClient) {
        try {
          // Use JsonRpcProvider for read operations on Push Chain
          const provider = new ethers.JsonRpcProvider('https://evm.rpc-testnet-donut-node1.push.org/');
          // For write operations, we'll use pushChainClient.universal.sendTransaction
          const contractInstance = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

          setContract(contractInstance);

          try {
            const origin = await contractInstance.getMyOrigin();
            setOriginInfo({
              chainNamespace: origin[0].chainNamespace,
              chainId: origin[0].chainId,
              isUEA: origin[1],
            });

            const displayChain = origin[1]
              ? `${origin[0].chainNamespace}:${origin[0].chainId}`
              : 'Push Chain (Native)';
            console.log('Connected from:', displayChain);
          } catch (err) {
            console.log('Could not fetch origin info:', err);
          }
        } catch (error) {
          console.error('Error initializing contract:', error);
          toast.error('Failed to connect to contract');
          setContract(null);
        }
      } else {
        setContract(null);
        setOriginInfo(null);
      }
    };
    initContract();
  }, [isConnected, pushChainClient]);

  const checkName = async () => {
    if (!contract || !searchName) return;

    setLoading(true);
    try {
      const isAvailable = await contract.isNameAvailable(searchName);

      if (isAvailable) {
        const nameHash = await contract.getNameHash(searchName);
        const fee = await contract.calculateRegistrationFee(nameHash);
        setNameData({
          available: true,
          fee: formatEther(fee),
        });
      } else {
        const record = await contract.getNameRecord(searchName);
        setNameData({
          available: false,
          owner: record.owner,
          expiresAt: record.expiresAt,
          isPremium: record.isPremium,
        });
      }
    } catch (error: any) {
      console.error('Error checking name:', error);
      if (error.code === 'BAD_DATA' || error.message?.includes('could not decode')) {
        toast.error('Please ensure you are connected to the Push Network');
      } else {
        toast.error('Failed to check name availability');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!contract || !nameData?.fee || !pushChainClient) return;

    setRegistering(true);
    try {
      const data = PushChain.utils.helpers.encodeTxData({
        abi: CONTRACT_ABI,
        functionName: 'register',
        args: [searchName],
      });

      const valueInWei = PushChain.utils.helpers.parseUnits(nameData.fee, 18);

      const tx = await pushChainClient.universal.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: valueInWei,
        data: data,
      });

      toast.success('Registration transaction submitted');
      await tx.wait();

try {
  await storeNameRegistration({
    name: searchName,
    owner: getAddress(pushChainClient.universal.account),
    expiresAt: new Date(Date.now() + 31536000000), // 1 year
    isPremium: nameData.isPremium || false,
    nameHash: await contract.getNameHash(searchName),
    registeredAt: new Date(),
    transactionHash: tx.hash,
    chainId: pushChainClient.universal.origin?.chain || 'push-chain',
  });
  console.log('✅ Stored in Firebase');
} catch (err) {
  console.warn('Firebase storage failed:', err);
}

      toast.success('Name registered successfully!');
      onRegisterSuccess();
    } catch (error) {
      console.error('Error registering name:', error);
      toast.error('Failed to register name');
    } finally {
      setRegistering(false);
    }
  };

  // Trigger check when searchName or contract changes
  useEffect(() => {
    if (searchName && contract && !loading) {
      setNameData(null);
      checkName();
    }
  }, [searchName, contract]);

  if (!searchName) return null;

  const getChainDisplayName = (namespace: string, chainId: string) => {
    if (namespace === 'push') return 'Push Chain';
    if (namespace === 'eip155') {
      if (chainId === '1') return 'Ethereum Mainnet';
      if (chainId === '11155111') return 'Ethereum Sepolia';
      return `Ethereum (${chainId})`;
    }
    if (namespace === 'solana') {
      if (chainId === '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp') return 'Solana Mainnet';
      if (chainId === 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1') return 'Solana Devnet';
      return `Solana (${chainId})`;
    }
    return `${namespace}:${chainId}`;
  };

  return (
    <div id="search" className="container py-12">
      {isConnected && (
        <div className="mb-4 mx-auto max-w-2xl space-y-3">
          {originInfo && (
            <Badge variant="outline" className="gap-2">
              <Network className="h-3 w-3" />
              Connected from: {getChainDisplayName(originInfo.chainNamespace, originInfo.chainId)}
            </Badge>
          )}
          <div className="rounded-lg border border-blue-500/50 bg-blue-50 p-4 dark:bg-blue-950">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Universal Registration</p>
                <p className="text-xs opacity-90">
                  This contract is deployed only on Push Chain, but you can register from any supported chain (Ethereum, Solana, etc.).
                  Your origin chain is automatically detected and stored with your name.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="mx-auto max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            {searchName}.push
            {nameData?.isPremium && (
              <Badge variant="secondary" className="gap-1">
                <Crown className="h-3 w-3" />
                Premium
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Name registration details</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : nameData ? (
            <>
              {nameData.available ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Available for registration</span>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <div className="mb-2 text-sm text-muted-foreground">Registration Fee</div>
                    <div className="text-2xl font-bold">{nameData.fee} ETH</div>
                    <div className="mt-1 text-xs text-muted-foreground">Valid for 1 year</div>
                  </div>

                  {!isConnected ? (
                    <div className="rounded-lg border border-yellow-500/50 bg-yellow-50 p-4 text-center dark:bg-yellow-950">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Please connect your wallet to register this name
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={handleRegister}
                      disabled={registering}
                      className="w-full bg-gradient-primary hover:opacity-90 text-lg font-semibold"
                      size="lg"
                    >
                      {registering ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        'Register Name'
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span className="font-semibold">Not available</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Owner:</span>
                      <code className="rounded bg-muted px-2 py-1 text-xs">
                        {nameData.owner?.slice(0, 6)}...{nameData.owner?.slice(-4)}
                      </code>
                    </div>

                    {nameData.expiresAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Expires:</span>
                        <span>{new Date(Number(nameData.expiresAt) * 1000).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
