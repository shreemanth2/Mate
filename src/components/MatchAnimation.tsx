import { motion } from 'motion/react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface MatchAnimationProps {
  profile: {
    name: string;
    age: number;
    image: string;
  };
  userProfile?: {
    name?: string;
    image?: string;
  };
  onClose: (action: 'discover' | 'message') => void;
}

export function MatchAnimation({ profile, userProfile, onClose }: MatchAnimationProps) {
  // Use user profile image or fallback
  const userImage = userProfile?.image || 'https://images.unsplash.com/photo-1599793830316-f3d76336206e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjE4OTk4OTB8MA&ixlib=rb-4.1.0&q=80&w=1080';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gradient-to-br from-[#2C1810]/95 via-[#8B4513]/95 to-[#DC143C]/95 backdrop-blur-xl"
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#DC143C]/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF8C00]/30 rounded-full blur-3xl"
          animate={{
            scale: [1.5, 1, 1.5],
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FFD700]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Confetti/sparkles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl"
            initial={{
              x: '50vw',
              y: '50vh',
              opacity: 0,
            }}
            animate={{
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
              opacity: [0, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 0.5,
              repeat: Infinity,
              repeatDelay: Math.random() * 3,
            }}
          >
            {['❤️', '✨', '🎉', '💕', '⭐'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* "Yayy a match!" text */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Sparkles className="text-[#FFD700]" size={40} />
            <h1
              className="text-7xl bg-gradient-to-r from-[#FFD700] via-[#FF8C00] to-[#DC143C] bg-clip-text text-transparent"
              style={{ fontWeight: 900, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' as any }}
            >
              its a match!
            </h1>
            <Sparkles className="text-[#FFD700]" size={40} />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 text-xl"
          >
            You both showed interest in each other 💕
          </motion.p>
        </motion.div>

        {/* Profile cards with images */}
        <div className="flex items-center justify-center gap-8 mb-12">
          {/* User card */}
          <motion.div
            initial={{ x: -200, opacity: 0, rotate: -15 }}
            animate={{ x: 0, opacity: 1, rotate: -5 }}
            transition={{ delay: 0.2, type: 'spring', damping: 20 }}
            className="relative"
          >
            <div className="w-56 h-72 rounded-3xl overflow-hidden border-4 border-[#FFD700] shadow-2xl">
              <img src={userImage} alt="You" className="w-full h-full object-cover" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-lg"
            >
              <p className="text-primary">You</p>
            </motion.div>
          </motion.div>

          {/* Heart icon */}
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring', damping: 10 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[#DC143C] to-[#FF8C00] flex items-center justify-center shadow-2xl"
          >
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-5xl"
            >
              ❤️
            </motion.div>
          </motion.div>

          {/* Matched profile card */}
          <motion.div
            initial={{ x: 200, opacity: 0, rotate: 15 }}
            animate={{ x: 0, opacity: 1, rotate: 5 }}
            transition={{ delay: 0.2, type: 'spring', damping: 20 }}
            className="relative"
          >
            <div className="w-56 h-72 rounded-3xl overflow-hidden border-4 border-[#DC143C] shadow-2xl">
              <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-lg"
            >
              <p className="text-primary">{profile.name}</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <Button
            onClick={() => onClose('message')}
            className="w-full bg-gradient-to-r from-[#DC143C] to-[#FF8C00] hover:from-[#B22222] hover:to-[#FF7F00] text-white py-8 rounded-2xl text-xl flex items-center justify-center gap-3 shadow-2xl"
          >
            <MessageCircle size={28} />
            Send a Message
          </Button>
          <Button
            onClick={() => onClose('discover')}
            variant="outline"
            className="w-full border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 py-8 rounded-2xl text-xl shadow-xl backdrop-blur-xl"
          >
            Keep Discovering
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
