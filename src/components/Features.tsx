import React, { useState, useEffect } from 'react';
import { Copy, Check, Globe, Users, Shield, Infinity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Contract, JsonRpcProvider } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

// Feature Card Component
const FeatureCard = ({ title, description, icon, children = null, borderColor = "cyan" }) => {
  const borderClasses = {
    cyan: "border-cyan-400",
    orange: "border-orange-400", 
    purple: "border-purple-400"
  };

  return (
    <Card className={`h-full border-2 ${borderClasses[borderColor]} shadow-lg`}>
      <CardContent className="p-6 flex flex-col h-full">
        <div className="mb-6 flex justify-center">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4 text-center">{title}</h3>
        <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">{description}</p>
        {children && (
          <div className="mt-auto">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Username Display Component
const UsernameDisplay = ({ username, domain = "push" }) => {
  return (
    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
      <span className="font-semibold text-lg">{username}</span>
      <span className="text-muted-foreground text-lg">.{domain}</span>
    </div>
  );
};

// Address Card Component
const AddressCard = ({ username, address, avatar }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <span className="text-white text-sm">{avatar}</span>
        </div>
        <span className="text-foreground text-sm">@{username}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="w-full justify-between"
      >
        <span className="font-mono text-xs">{truncateAddress(address)}</span>
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
};

// User Badge Component
const UserBadge = ({ username, avatar, variant = "default" }) => {
  const variants = {
    default: "bg-secondary text-secondary-foreground border-secondary",
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent text-accent-foreground border-accent"
  };

  return (
    <div className={`inline-flex items-center gap-2 border rounded-full px-4 py-2 ${variants[variant]}`}>
      <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center">
        <span className="text-lg">{avatar}</span>
      </div>
      <span className="font-medium">@{username}</span>
    </div>
  );
};

// Community Members Component with contract data
const CommunityMembers = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock members with some real-looking data
  const mockMembers = [
    { name: "alice", avatar: "👩", color: "orange", angle: 0, size: "small" },
    { name: "bob", avatar: "👨", color: "purple", angle: 45, size: "small" },
    { name: "charlie", avatar: "👨‍💼", color: "cyan", angle: 90, size: "small" },
    { name: "diana", avatar: "👩‍💻", color: "orange", angle: 135, size: "small" },
    { name: "eve", avatar: "👩‍🎨", color: "purple", angle: 180, size: "medium" },
    { name: "frank", avatar: "👨‍🔬", color: "cyan", angle: 225, size: "medium" },
    { name: "grace", avatar: "👩‍🚀", color: "green", angle: 270, size: "medium" },
    { name: "henry", avatar: "👨‍🎓", color: "blue", angle: 315, size: "medium" },
  ];

  useEffect(() => {
    const fetchCommunityMembers = async () => {
      try {
        // Try to fetch some registered names from the contract
        const provider = new JsonRpcProvider("https://evm.rpc-testnet-donut-node1.push.org/");
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        // For now, we'll use mock data but structure it to easily integrate real data later
        // In a real implementation, you could query recent registrations or featured names
        setMembers(mockMembers);
      } catch (error) {
        console.warn("Could not fetch community data, using mock data:", error);
        setMembers(mockMembers);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityMembers();
  }, []);

  const getOrbitRadius = (size) => {
    return size === "small" ? 100 : 140;
  };

  const getPosition = (angle, radius) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius
    };
  };

  const colorClasses = {
    orange: "border-orange-400 shadow-orange-400/50",
    purple: "border-purple-400 shadow-purple-400/50",
    cyan: "border-cyan-400 shadow-cyan-400/50",
    green: "border-green-400 shadow-green-400/50",
    blue: "border-blue-400 shadow-blue-400/50"
  };

  if (loading) {
    return (
      <div className="relative w-full h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 flex items-center justify-center">
      {/* Center logo */}
      <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg z-10">
        <Globe className="w-10 h-10 text-white" />
      </div>

      {/* Orbit rings */}
      <div className="absolute w-48 h-48 border border-border/30 rounded-full"></div>
      <div className="absolute w-72 h-72 border border-border/30 rounded-full"></div>

      {/* Member nodes */}
      {members.map((member, index) => {
        const radius = getOrbitRadius(member.size);
        const pos = getPosition(member.angle, radius);
        const isHovered = hoveredIndex === index;

        return (
          <div
            key={index}
            className={`absolute w-12 h-12 rounded-full bg-background border-2 ${colorClasses[member.color]} 
              flex items-center justify-center cursor-pointer transition-all duration-300
              ${isHovered ? 'scale-125 shadow-lg' : 'shadow-md'}`}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`,
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span className="text-xl">{member.avatar}</span>
          </div>
        );
      })}

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div className="absolute -top-16 bg-background border rounded-lg px-3 py-2 shadow-lg">
          <span className="text-sm font-medium">{members[hoveredIndex].name}.push</span>
        </div>
      )}
    </div>
  );
};

export const Features = () => {
  return (
    <section className="container py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Why Choose Push Name Service?</h2>
        <p className="text-xl text-muted-foreground">
          Universal identity made simple on Push Chain
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <FeatureCard
          title="Multi-Chain Identity"
          description="Connect all your addresses across different chains under one memorable name. Your universal identity on Push Chain."
          icon={<Infinity className="w-12 h-12 text-primary" />}
          borderColor="cyan"
        >
          <div className="flex justify-center">
            <UsernameDisplay username="alice" />
          </div>
        </FeatureCard>

        <FeatureCard
          title="365 Days Per Year"
          description="Renewable registration system ensures your name stays yours. No permanent locks, full control over your digital identity."
          icon={<Users className="w-12 h-12 text-primary" />}
          borderColor="orange"
        >
          <div className="space-y-3">
            <AddressCard 
              username="alice" 
              address="0xF5eC8B9C02C7A7A60Fe2a65C..." 
              avatar="👩"
            />
            <AddressCard 
              username="jeff" 
              address="0xf821d3483fc7725ebafaa5a3..." 
              avatar="👩"
            />
          </div>
        </FeatureCard>

        <FeatureCard
          title="100% Ownership"
          description="You control your name completely. Transfer, update metadata, or renew - it's all in your hands. True decentralized ownership."
          icon={<Shield className="w-12 h-12 text-primary" />}
          borderColor="purple"
        >
          <div className="space-y-3 flex flex-col items-center">
            <UserBadge username="bob" avatar="👨" variant="primary" />
            <UserBadge username="charlie" avatar="👨‍💼" variant="accent" />
          </div>
        </FeatureCard>
      </div>

      {/* Community Section */}
      <Card className="border-primary/20">
        <CardContent className="p-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Join The Flourishing
              <br />
              Push Community
            </h2>
            <p className="text-muted-foreground text-lg">
              The most innovative projects are building on Push Chain
            </p>
          </div>
          
          <CommunityMembers />
          
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Connect with builders, creators, and innovators across the ecosystem
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
