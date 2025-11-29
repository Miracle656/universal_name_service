import { motion } from 'framer-motion';
import { User, Shield, Send } from 'lucide-react';

const FEATURES = [
    {
        title: 'Names how you know them',
        description: 'The Push Name Service supports username standards common across the web. Interacting on-chain just got a whole lot easier.',
        icon: User,
        gradient: 'from-green-400 to-cyan-400',
        example: '@sean',
    },
    {
        title: 'Be yourself on-chain',
        description: 'Getting a name from Push NS can help define your identity on-chain. No more forgettable string of numbers and letters. Make your presence known.',
        icon: Shield,
        gradient: 'from-purple-400 to-pink-400',
        example: '@ChainSmith',
    },
    {
        title: 'Send & receive assets confidently',
        description: 'Blockchain addresses are complicated. Errors using them can lead to lost assets. Push NS reduces the risk with short and understandable names.',
        icon: Send,
        gradient: 'from-orange-400 to-red-400',
        example: '@dappy',
    },
];

export const FeatureCards = () => {
    return (
        <section className="py-32 bg-gradient-to-b from-purple-900 to-purple-950">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {FEATURES.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="relative group"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                        >
                            {/* Neon Border Effect */}
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-3xl opacity-75 group-hover:opacity-100 blur transition duration-300`} />

                            {/* Card Content */}
                            <div className="relative bg-purple-900/90 backdrop-blur-xl rounded-3xl p-8 h-full">
                                {/* Example Badge */}
                                <div className="mb-6">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${feature.gradient} text-purple-900 font-bold`}>
                                        <span className="text-xl">👤</span>
                                        <span>{feature.example}</span>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-white/70 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
