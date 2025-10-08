import { useState, useEffect } from 'react';
import { usePushWalletContext, usePushChainClient, PushUI } from '@pushchain/ui-kit';
import { PushChain } from '@pushchain/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Contract, JsonRpcProvider, id } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Crown, Edit, Send, RefreshCw, Calendar, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface NameData {
  name: string;
  expiresAt: Date;
  isPremium: boolean;
  nameHash: string;
}

export const MyNames = () => {
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const [contract, setContract] = useState<Contract | null>(null);
  const [myNames, setMyNames] = useState<NameData[]>([]);
  const [loading, setLoading] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [selectedName, setSelectedName] = useState('');
  const [metadata, setMetadata] = useState({
    avatar: '',
    email: '',
    url: '',
    description: '',
    twitter: '',
    github: '',
    discord: '',
    telegram: '',
  });
  const [transferAddress, setTransferAddress] = useState('');
  const [updating, setUpdating] = useState(false);

  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;

  // Initialize contract when connected
  useEffect(() => {
    const initContract = async () => {
      if (isConnected && pushChainClient) {
        try {
          // Use JsonRpcProvider for read operations
          const provider = new JsonRpcProvider('https://evm.rpc-testnet-donut-node1.push.org/');
          const contractInstance = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
          setContract(contractInstance);

          // Get user's address
          const address = pushChainClient.universal.account;
          setUserAddress(address);
        } catch (error) {
          console.error('Error initializing contract:', error);
          setContract(null);
        }
      } else {
        setContract(null);
        setUserAddress('');
        setMyNames([]);
      }
    };
    initContract();
  }, [isConnected, pushChainClient]);

  // Fetch user's names when contract and address are available
  useEffect(() => {
    const fetchMyNames = async () => {
      if (!contract || !userAddress) return;

      setLoading(true);
      try {
        // Use ethers id() function to compute the event topic hash
        const eventTopic = id('NameRegistered(bytes32,string,address,uint256,string,string,bool)');
        
        // Filter by owner address (indexed parameter at position 2)
        const addressTopic = '0x000000000000000000000000' + userAddress.slice(2).toLowerCase();
        
        const provider = new JsonRpcProvider('https://evm.rpc-testnet-donut-node1.push.org/');
        
        // Get current block number
        const currentBlock = await provider.getBlockNumber();
        
        // Use a smaller chunk size and only query recent blocks for better performance
        const CHUNK_SIZE = 5000;
        const BLOCKS_TO_QUERY = 50000; // Only query last 50k blocks for testnet
        const startBlock = Math.max(0, currentBlock - BLOCKS_TO_QUERY);
        
        const allLogs = [];
        
        for (let fromBlock = startBlock; fromBlock <= currentBlock; fromBlock += CHUNK_SIZE) {
          const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, currentBlock);
          
          try {
            const logs = await provider.getLogs({
              address: CONTRACT_ADDRESS,
              topics: [eventTopic, null, addressTopic],
              fromBlock,
              toBlock,
            });
            allLogs.push(...logs);
          } catch (err) {
            console.warn(`Skipping blocks ${fromBlock} to ${toBlock} due to error`);
            // Continue with next chunk even if this one fails
          }
        }

        const namesData: NameData[] = [];
        const seenNames = new Set<string>();
        
        for (const log of allLogs) {
          try {
            const parsedLog = contract.interface.parseLog({
              topics: [...log.topics],
              data: log.data,
            });
            
            const name = parsedLog?.args?.name;
            if (name && !seenNames.has(name)) {
              seenNames.add(name);
              
              const record = await contract.getNameRecord(name);
              
              // Only add if still owned by user and not expired
              if (record.owner.toLowerCase() === userAddress.toLowerCase()) {
                const expiresAt = new Date(Number(record.expiresAt) * 1000);
                
                // Check if not expired
                if (expiresAt > new Date()) {
                  namesData.push({
                    name,
                    expiresAt,
                    isPremium: record.isPremium,
                    nameHash: await contract.getNameHash(name),
                  });
                }
              }
            }
          } catch (err) {
            console.error('Error parsing log:', err);
          }
        }
        
        setMyNames(namesData);
      } catch (error) {
        console.error('Error fetching names:', error);
        toast.error('Failed to fetch your names');
      } finally {
        setLoading(false);
      }
    };

    fetchMyNames();
  }, [contract, userAddress]);

  const handleUpdateMetadata = async () => {
    if (!contract || !selectedName || !pushChainClient) return;

    setUpdating(true);
    try {
      const data = PushChain.utils.helpers.encodeTxData({
        abi: CONTRACT_ABI,
        functionName: 'setMetadata',
        args: [
          selectedName,
          metadata.avatar,
          metadata.email,
          metadata.url,
          metadata.description,
          metadata.twitter,
          metadata.github,
          metadata.discord,
          metadata.telegram,
        ],
      });

      const tx = await pushChainClient.universal.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: BigInt(0),
        data: data,
      });

      toast.success('Updating metadata...');
      await tx.wait();
      toast.success('Metadata updated successfully!');
    } catch (error) {
      console.error('Error updating metadata:', error);
      toast.error('Failed to update metadata');
    } finally {
      setUpdating(false);
    }
  };

  const handleTransfer = async () => {
    if (!contract || !selectedName || !transferAddress || !pushChainClient) return;

    try {
      const data = PushChain.utils.helpers.encodeTxData({
        abi: CONTRACT_ABI,
        functionName: 'transfer',
        args: [selectedName, transferAddress],
      });

      const tx = await pushChainClient.universal.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: BigInt(0),
        data: data,
      });

      toast.success('Transfer initiated...');
      await tx.wait();
      toast.success('Name transferred successfully!');
      setTransferAddress('');
      
      // Refresh names list
      window.location.reload();
    } catch (error) {
      console.error('Error transferring name:', error);
      toast.error('Failed to transfer name');
    }
  };

  const handleRenew = async (name: string) => {
    if (!contract || !pushChainClient) return;

    try {
      const nameHash = await contract.getNameHash(name);
      const fee = await contract.calculateRegistrationFee(nameHash);
      
      const data = PushChain.utils.helpers.encodeTxData({
        abi: CONTRACT_ABI,
        functionName: 'renew',
        args: [name],
      });

      const tx = await pushChainClient.universal.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: fee,
        data: data,
      });
      
      toast.success('Renewing name...');
      await tx.wait();
      toast.success('Name renewed successfully!');
      
      // Refresh names list
      window.location.reload();
    } catch (error) {
      console.error('Error renewing name:', error);
      toast.error('Failed to renew name');
    }
  };

  if (!isConnected) {
    return (
      <section id="my-names" className="container py-12">
        <Card className="mx-auto max-w-2xl text-center">
          <CardContent className="py-12">
            <p className="text-muted-foreground">Connect your wallet to view your names</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (loading) {
    return (
      <section id="my-names" className="container py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">My Names</h2>
          <p className="text-muted-foreground">Manage your registered Push names</p>
        </div>
        <Card className="text-center">
          <CardContent className="py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading your names...</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section id="my-names" className="container py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">My Names</h2>
        <p className="text-muted-foreground">Manage your registered Push names</p>
      </div>

      {myNames.length === 0 ? (
        <Card className="text-center">
          <CardContent className="py-12">
            <p className="text-muted-foreground">You don't have any registered names yet</p>
            <Button className="mt-4 bg-gradient-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Register Your First Name
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myNames.map((nameData) => (
            <Card key={nameData.name} className="group transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {nameData.name}.push
                  {nameData.isPremium && (
                    <Badge variant="secondary" className="gap-1">
                      <Crown className="h-3 w-3" />
                      Premium
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Expires: {nameData.expiresAt.toLocaleDateString()}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => setSelectedName(nameData.name)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit Metadata
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Metadata for {selectedName}.push</DialogTitle>
                      <DialogDescription>
                        Update your name's profile information and social links
                      </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="profile" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="social">Social Links</TabsTrigger>
                      </TabsList>

                      <TabsContent value="profile" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="avatar">Avatar URL</Label>
                          <Input
                            id="avatar"
                            value={metadata.avatar}
                            onChange={(e) => setMetadata({ ...metadata, avatar: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={metadata.email}
                            onChange={(e) => setMetadata({ ...metadata, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="url">Website</Label>
                          <Input
                            id="url"
                            value={metadata.url}
                            onChange={(e) => setMetadata({ ...metadata, url: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={metadata.description}
                            onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="social" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="twitter">Twitter</Label>
                          <Input
                            id="twitter"
                            value={metadata.twitter}
                            onChange={(e) => setMetadata({ ...metadata, twitter: e.target.value })}
                            placeholder="@username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="github">GitHub</Label>
                          <Input
                            id="github"
                            value={metadata.github}
                            onChange={(e) => setMetadata({ ...metadata, github: e.target.value })}
                            placeholder="username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discord">Discord</Label>
                          <Input
                            id="discord"
                            value={metadata.discord}
                            onChange={(e) => setMetadata({ ...metadata, discord: e.target.value })}
                            placeholder="username#0000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telegram">Telegram</Label>
                          <Input
                            id="telegram"
                            value={metadata.telegram}
                            onChange={(e) => setMetadata({ ...metadata, telegram: e.target.value })}
                            placeholder="@username"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Button
                      onClick={handleUpdateMetadata}
                      disabled={updating}
                      className="w-full bg-gradient-primary"
                    >
                      {updating ? 'Updating...' : 'Save Changes'}
                    </Button>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => setSelectedName(nameData.name)}
                    >
                      <Send className="h-4 w-4" />
                      Transfer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Transfer {selectedName}.push</DialogTitle>
                      <DialogDescription>
                        Transfer ownership of this name to another address
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="transfer-address">Recipient Address</Label>
                        <Input
                          id="transfer-address"
                          value={transferAddress}
                          onChange={(e) => setTransferAddress(e.target.value)}
                          placeholder="0x..."
                        />
                      </div>
                      <Button
                        onClick={handleTransfer}
                        disabled={!transferAddress}
                        className="w-full bg-gradient-primary"
                      >
                        Transfer Name
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => handleRenew(nameData.name)}
                >
                  <RefreshCw className="h-4 w-4" />
                  Renew (1 year)
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};