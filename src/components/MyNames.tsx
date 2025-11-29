import { useState, useEffect, useRef } from "react";
import {
  usePushWalletContext,
  usePushChainClient,
  PushUI,
} from "@pushchain/ui-kit";
import { PushChain } from "@pushchain/core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Contract,
  JsonRpcProvider,
  getAddress,
} from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Crown, Edit, Send, RefreshCw, Calendar, Loader2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import gsap from "gsap";

interface NameData {
  name: string;
  expiresAt: Date;
  isPremium: boolean;
  nameHash: string;
  metadata?: {
    avatar: string;
    email: string;
    url: string;
    description: string;
    twitter: string;
    github: string;
    discord: string;
    telegram: string;
  };
}

export const MyNames = () => {
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const [contract, setContract] = useState<Contract | null>(null);
  const [myNames, setMyNames] = useState<NameData[]>([]);
  const [loading, setLoading] = useState(false);
  const [userAddress, setUserAddress] = useState<string>("");
  const [selectedName, setSelectedName] = useState("");
  const [metadata, setMetadata] = useState({
    avatar: "",
    email: "",
    url: "",
    description: "",
    twitter: "",
    github: "",
    discord: "",
    telegram: "",
  });
  const [transferAddress, setTransferAddress] = useState("");
  const [updating, setUpdating] = useState(false);
  const [fetchProgress, setFetchProgress] = useState("");

  const containerRef = useRef(null);

  const isConnected =
    connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;

  // Initialize contract when connected
  useEffect(() => {
    const initContract = async () => {
      if (isConnected && pushChainClient) {
        try {
          const provider = new JsonRpcProvider(
            "https://evm.rpc-testnet-donut-node1.push.org/"
          );
          const contractInstance = new Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            provider
          );
          setContract(contractInstance);

          const address = pushChainClient.universal.account;
          setUserAddress(address);
        } catch (error) {
          console.error("Error initializing contract:", error);
          setContract(null);
        }
      } else {
        setContract(null);
        setUserAddress("");
        setMyNames([]);
      }
    };
    initContract();
  }, [isConnected, pushChainClient]);

  const normalizeMetadata = (metadata?: any) => ({
    avatar: metadata?.avatar || "",
    email: metadata?.email || "",
    url: metadata?.url || "",
    description: metadata?.description || "",
    twitter: metadata?.twitter || "",
    github: metadata?.github || "",
    discord: metadata?.discord || "",
    telegram: metadata?.telegram || "",
  });

  // Fetch user's names
  useEffect(() => {
    const fetchMyNames = async () => {
      if (!contract || !userAddress || !pushChainClient) return;

      setLoading(true);
      setFetchProgress("Loading your names...");

      try {
        const normalizedUEA = getAddress(pushChainClient.universal.account);

        const names = await contract.getNamesByOwner(normalizedUEA);

        const namesData: NameData[] = [];

        for (let i = 0; i < names.length; i++) {
          const name = names[i];
          const nameHash = await contract.getNameHash(name);
          const record = await contract.getNameRecord(name);
          const expiresAt = new Date(Number(record.expiresAt) * 1000);

          if (expiresAt > new Date()) {
            let nameMetadata = null;
            try {
              const metadata = await contract.getMetadata(name);
              nameMetadata = normalizeMetadata(metadata);
            } catch (err) {
              nameMetadata = normalizeMetadata(null);
            }

            namesData.push({
              name,
              expiresAt,
              isPremium: Boolean(record.isPremium),
              nameHash: nameHash,
              metadata: nameMetadata,
            });
          }
        }

        setMyNames(namesData);
        setFetchProgress("");
      } catch (error) {
        console.error("Error fetching names:", error);
        toast.error("Failed to fetch your names");
      } finally {
        setLoading(false);
      }
    };

    fetchMyNames();
  }, [contract, userAddress]);

  // Animate cards when loaded
  useEffect(() => {
    if (!loading && myNames.length > 0) {
      gsap.fromTo(".name-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [loading, myNames]);

  const handleUpdateMetadata = async () => {
    if (!contract || !selectedName || !pushChainClient) return;

    setUpdating(true);
    try {
      const data = PushChain.utils.helpers.encodeTxData({
        abi: CONTRACT_ABI,
        functionName: "setMetadata",
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

      toast.success("Updating metadata...");
      await tx.wait();
      toast.success("Metadata updated successfully!");
    } catch (error) {
      console.error("Error updating metadata:", error);
      toast.error("Failed to update metadata");
    } finally {
      setUpdating(false);
    }
  };

  const handleTransfer = async () => {
    if (!contract || !selectedName || !transferAddress || !pushChainClient)
      return;

    try {
      const data = PushChain.utils.helpers.encodeTxData({
        abi: CONTRACT_ABI,
        functionName: "transfer",
        args: [selectedName, transferAddress],
      });

      const tx = await pushChainClient.universal.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: BigInt(0),
        data: data,
      });

      toast.success("Transfer initiated...");
      await tx.wait();
      toast.success("Name transferred successfully!");
      setTransferAddress("");
      window.location.reload();
    } catch (error) {
      console.error("Error transferring name:", error);
      toast.error("Failed to transfer name");
    }
  };

  const handleRenew = async (name: string) => {
    if (!contract || !pushChainClient) return;

    try {
      const nameHash = await contract.getNameHash(name);
      const fee = await contract.calculateRegistrationFee(nameHash);

      const data = PushChain.utils.helpers.encodeTxData({
        abi: CONTRACT_ABI,
        functionName: "renew",
        args: [name],
      });

      const tx = await pushChainClient.universal.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: fee,
        data: data,
      });

      toast.success("Renewing name...");
      await tx.wait();
      toast.success("Name renewed successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error renewing name:", error);
      toast.error("Failed to renew name");
    }
  };

  if (!isConnected) {
    return (
      <section id="my-names" className="container py-20 min-h-[60vh] flex items-center justify-center">
        <Card className="mx-auto max-w-2xl text-center bg-card/50 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardContent className="py-16">
            <div className="mb-6 mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Connect your wallet to view and manage your registered Push names.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (loading) {
    return (
      <section id="my-names" className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4">My Names</h2>
          <p className="text-muted-foreground">Manage your digital identity</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium text-muted-foreground animate-pulse">
            {fetchProgress || "Loading your names..."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} id="my-names" className="container py-20 min-h-screen">
      <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold mb-2">My Names</h2>
          <p className="text-muted-foreground">
            Manage your registered Push names
          </p>
        </div>

        {/* {isConnected && pushChainClient && (
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground">Connected:</span>
            <span className="font-mono text-primary">
              {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </span>
          </div>
        )} */}
      </div>

      {myNames.length === 0 ? (
        <Card className="text-center bg-card/50 backdrop-blur-xl border-white/10">
          <CardContent className="py-20">
            <div className="mb-6 mx-auto w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <Crown className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold mb-4">No Names Found</h3>
            <p className="text-muted-foreground mb-8">
              You don't have any registered names yet.
            </p>
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/20"
              onClick={() => (window.location.href = "/")}
            >
              Register Your First Name
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myNames.map((nameData) => (
            <Card
              key={nameData.name}
              className="name-card group relative overflow-hidden bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-900/40 backdrop-blur-xl border-2 border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 rounded-3xl"
            >
              {/* Gradient border glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Circuit pattern background */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }} />

              <CardContent className="relative p-5 space-y-4">
                {/* Name Display */}
                <div className="space-y-1">
                  <h3 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    @{nameData.name}
                  </h3>
                  {nameData.isPremium && (
                    <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                {/* Metadata Badge */}
                <div className="inline-block px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
                  <span className="text-cyan-400 text-xs font-medium">
                    {nameData.metadata?.description || "Default"}
                  </span>
                </div>

                {/* Bottom Section: Logos and Expiry */}
                <div className="flex items-end justify-between pt-2">
                  {/* Expiry Date */}
                  <div className="text-white text-xs font-medium">
                    {nameData.expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>

                  {/* Logos Stack */}
                  <div className="flex items-center gap-1.5">
                    <img
                      src="/assets/pnslogo.png"
                      alt="PNS"
                      className="w-10 h-10 opacity-60"
                    />
                    <img
                      src="/assets/pushlogo 1.png"
                      alt="Push"
                      className="w-10 h-10 rounded-lg opacity-80"
                    />
                  </div>
                </div>

                {/* Action Buttons - Hidden by default, shown on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-3 pt-4 border-t border-purple-500/20">
                  <div className="grid grid-cols-2 gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400/50 text-purple-200"
                          onClick={() => {
                            setSelectedName(nameData.name);
                            if (nameData.metadata) {
                              setMetadata({
                                avatar: nameData.metadata.avatar || "",
                                email: nameData.metadata.email || "",
                                url: nameData.metadata.url || "",
                                description: nameData.metadata.description || "",
                                twitter: nameData.metadata.twitter || "",
                                github: nameData.metadata.github || "",
                                discord: nameData.metadata.discord || "",
                                telegram: nameData.metadata.telegram || "",
                              });
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-white/10">
                        <DialogHeader>
                          <DialogTitle>Edit Metadata</DialogTitle>
                          <DialogDescription>
                            Update profile for {selectedName}.push
                          </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="profile" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-black/20">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="social">Social Links</TabsTrigger>
                          </TabsList>
                          <TabsContent value="profile" className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <Label>Avatar URL</Label>
                              <Input value={metadata.avatar} onChange={e => setMetadata({ ...metadata, avatar: e.target.value })} className="bg-black/20 border-white/10" />
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Input value={metadata.description} onChange={e => setMetadata({ ...metadata, description: e.target.value })} className="bg-black/20 border-white/10" />
                            </div>
                            <div className="space-y-2">
                              <Label>Website</Label>
                              <Input value={metadata.url} onChange={e => setMetadata({ ...metadata, url: e.target.value })} className="bg-black/20 border-white/10" />
                            </div>
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input value={metadata.email} onChange={e => setMetadata({ ...metadata, email: e.target.value })} className="bg-black/20 border-white/10" />
                            </div>
                          </TabsContent>
                          <TabsContent value="social" className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <Label>Twitter</Label>
                              <Input value={metadata.twitter} onChange={e => setMetadata({ ...metadata, twitter: e.target.value })} className="bg-black/20 border-white/10" />
                            </div>
                            <div className="space-y-2">
                              <Label>GitHub</Label>
                              <Input value={metadata.github} onChange={e => setMetadata({ ...metadata, github: e.target.value })} className="bg-black/20 border-white/10" />
                            </div>
                            <div className="space-y-2">
                              <Label>Discord</Label>
                              <Input value={metadata.discord} onChange={e => setMetadata({ ...metadata, discord: e.target.value })} className="bg-black/20 border-white/10" />
                            </div>
                            <div className="space-y-2">
                              <Label>Telegram</Label>
                              <Input value={metadata.telegram} onChange={e => setMetadata({ ...metadata, telegram: e.target.value })} className="bg-black/20 border-white/10" />
                            </div>
                          </TabsContent>
                        </Tabs>
                        <Button onClick={handleUpdateMetadata} disabled={updating} className="w-full bg-gradient-primary mt-4">
                          {updating ? "Updating..." : "Save Changes"}
                        </Button>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400/50 text-purple-200"
                          onClick={() => setSelectedName(nameData.name)}
                        >
                          <Send className="h-4 w-4" />
                          Transfer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10">
                        <DialogHeader>
                          <DialogTitle>Transfer Name</DialogTitle>
                          <DialogDescription>Transfer {selectedName}.push to another address</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Recipient Address</Label>
                            <Input
                              value={transferAddress}
                              onChange={(e) => setTransferAddress(e.target.value)}
                              placeholder="0x..."
                              className="bg-black/20 border-white/10"
                            />
                          </div>
                          <Button onClick={handleTransfer} disabled={!transferAddress} className="w-full bg-gradient-primary">
                            Transfer Name
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full gap-2 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400/50 text-purple-200"
                    onClick={() => handleRenew(nameData.name)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Renew (1 year)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};
