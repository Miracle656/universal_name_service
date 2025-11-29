import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { usePushWalletContext, usePushChainClient, PushUI } from '@pushchain/ui-kit';
import { PushChain } from '@pushchain/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Crown, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatEther, Contract } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { ethers } from 'ethers';

interface NameSearchProps {
  searchName: string;
  onRegisterSuccess: () => void;
}

export const NameSearch = ({ searchName, onRegisterSuccess }: NameSearchProps) => {
  const { connectionStatus, universalAccount } = usePushWalletContext();
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
    rawFee?: bigint;
  } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;

  useEffect(() => {
    if (cardRef.current && nameData) {
      gsap.from(cardRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    }
  }, [nameData]);

  const PUSH_CHAIN_RPC = "https://evm.donut.rpc.push.org/";

  const getProvider = () => {
    return new ethers.JsonRpcProvider(PUSH_CHAIN_RPC);
  };

  useEffect(() => {
    const initContract = async () => {
      if (isConnected && pushChainClient) {
        try {
          const provider = getProvider();
          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
          setContract(contractInstance);
        } catch (error) {
          console.error('Error initializing contract:', error);
          toast.error('Failed to connect to contract');
          setContract(null);
        }
      } else {
        setContract(null);
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
          rawFee: fee,
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
      toast.error('Failed to check name availability');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!contract || !nameData?.rawFee || !pushChainClient) return;

    setRegistering(true);
    try {
      // Check Universal Account balance on Push Chain
      if (contract) {
        const provider = contract.runner?.provider;
        if (provider) {
          // Extract EVM address from CAIP-10 if needed, or use the account directly if it's already an address
          // pushChainClient.universal.account is likely CAIP-10 (e.g., eip155:1:0x...)
          // But for the provider check, we need the EVM address.
          // The contract runner is on Push Chain, so we can use the wallet address.
          // However, pushChainClient.universal.account might be the *signer* address, not the UA address?
          // Actually, for cross-chain, the UA address is deterministic.
          // Let's rely on the fact that if the user is connected, we can try to get the balance of the account we are using.

          // Better approach: Just try to get the balance of the current user address (which is the UA address in the context of the dApp).
          const balance = await provider.getBalance(pushChainClient.universal.account.split(':').pop() || '');

          if (balance < nameData.rawFee) {
            toast.error(`Insufficient funds in Universal Account. You need ${formatEther(nameData.rawFee)} PUSH on Push Chain.`);
            console.error('Universal Account Balance:', formatEther(balance), 'Required:', formatEther(nameData.rawFee));
            setRegistering(false);
            return;
          }
        }
      }

      const contractInterface = new ethers.Interface(CONTRACT_ABI);
      const data = contractInterface.encodeFunctionData('register', [searchName]);

      // Temporarily using exact fee to debug
      const bufferedFee = nameData.rawFee;

      console.log('🔍 Debug sendTransaction params:');
      console.log('CONTRACT_ADDRESS:', CONTRACT_ADDRESS);
      console.log('bufferedFee:', bufferedFee.toString());
      console.log('data:', data);
      console.log('data length:', data.length);

      const tx = await pushChainClient.universal.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: bufferedFee,
        data: data as `0x${string}`,
      });

      toast.success('Registration transaction submitted');
      await tx.wait();
      toast.success('Name registered successfully!');
      onRegisterSuccess();
    } catch (error) {
      console.error('Error registering name:', error);
      toast.error('Failed to register name');
    } finally {
      setRegistering(false);
    }
  };

  useEffect(() => {
    if (searchName && contract && !loading) {
      setNameData(null);
      checkName();
    }
  }, [searchName, contract]);

  if (!searchName) return null;

  return (
    <section id="search" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div ref={cardRef} className="max-w-2xl mx-auto">
          <Card className="bg-black border-2 border-[#D548EC]/30 shadow-2xl rounded-3xl overflow-hidden glow-pink">
            <CardHeader className="bg-gradient-to-r from-[#D548EC]/20 to-[#D548EC]/10 border-b border-[#D548EC]/30">
              <CardTitle className="text-3xl font-black flex items-center justify-between text-white">
                <span className="text-glow-pink">{searchName}.push</span>
                {nameData?.isPremium && (
                  <Badge className="bg-[#D548EC] text-white border-0 glow-pink">
                    <Crown className="h-4 w-4 mr-1" />
                    Premium
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-[#D548EC]" />
                  <p className="text-gray-400 font-medium">Checking availability...</p>
                </div>
              ) : nameData ? (
                <>
                  {nameData.available ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-[#D548EC] bg-[#D548EC]/10 p-4 rounded-2xl border border-[#D548EC]/30">
                        <CheckCircle2 className="h-6 w-6" />
                        <span className="font-bold text-lg">Available for registration</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-2xl p-6 border border-[#D548EC]/20">
                          <div className="text-sm text-gray-400 mb-2">Registration Fee</div>
                          <div className="text-3xl font-black text-[#D548EC]">{nameData.fee} ETH</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-6 border border-[#D548EC]/20">
                          <div className="text-sm text-gray-400 mb-2">Duration</div>
                          <div className="text-3xl font-black text-[#D548EC]">1 Year</div>
                        </div>
                      </div>

                      {!isConnected ? (
                        <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl p-6 text-center">
                          <p className="text-yellow-500 font-medium">
                            Please connect your wallet to register this name
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={handleRegister}
                          disabled={registering}
                          className="w-full h-14 bg-[#D548EC] hover:bg-[#e76ff5] text-white text-lg font-bold rounded-2xl shadow-lg glow-pink border-0"
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
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-red-500 bg-red-500/10 p-4 rounded-2xl border border-red-500/30">
                        <XCircle className="h-6 w-6" />
                        <span className="font-bold text-lg">Not available</span>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-[#D548EC]/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-400">
                            <User className="h-5 w-5" />
                            <span className="font-medium">Owner</span>
                          </div>
                          <code className="bg-black px-3 py-1 rounded-lg text-sm font-mono text-[#D548EC] border border-[#D548EC]/30">
                            {nameData.owner?.slice(0, 6)}...{nameData.owner?.slice(-4)}
                          </code>
                        </div>

                        {nameData.expiresAt && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Calendar className="h-5 w-5" />
                              <span className="font-medium">Expires</span>
                            </div>
                            <span className="font-bold text-white">
                              {new Date(Number(nameData.expiresAt) * 1000).toLocaleDateString()}
                            </span>
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
      </div>
    </section>
  );
};
