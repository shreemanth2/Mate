import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { MapPin } from 'lucide-react';

interface ProfileCardProps {
  profile: {
    name: string;
    age: number;
    location: string;
    image: string;
    description: string;
    tags: string[];
  };
  showDescription?: boolean;
  imageRevealed?: boolean;
  className?: string;
  vibe?: { emoji: string; name: string } | null;
}

export function ProfileCard({ profile, showDescription = false, imageRevealed = true, className = '', vibe = null }: ProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Profile Image */}
      <div className="absolute inset-0">
        <img
          src={profile.image}
          alt={profile.name}
          className="w-full h-full object-cover"
        />
        
        {/* Blur overlay when showing description */}
        <motion.div
          initial={{ opacity: showDescription ? 1 : 0 }}
          animate={{ opacity: showDescription ? 1 : 0 }}
          className="absolute inset-0 backdrop-blur-3xl bg-[#2C1810]/40"
        />

        {/* Gradient overlay */}
        {imageRevealed && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/90 via-transparent to-transparent" />
        )}

        {/* Vibe badge top-right */}
        {vibe && (
          <div className="absolute top-4 right-4 z-20 bg-white/70 backdrop-blur rounded-full w-12 h-12 flex items-center justify-center text-xl">
            <span>{vibe.emoji}</span>
          </div>
        )}
      </div>

      {/* Description overlay (shows first) */}
      {showDescription && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-10"
        >
          <motion.div
            className="w-20 h-20 border-4 border-[#DC143C] border-t-transparent rounded-full mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <h2 className="text-white text-4xl mb-6">{profile.name}, {profile.age}</h2>
          <p className="text-white/90 text-xl max-w-2xl leading-relaxed">{profile.description}</p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            {profile.tags.map((tag) => (
              <Badge key={tag} className="bg-white/20 text-white backdrop-blur-xl px-4 py-2 text-base">
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bottom info card (shows after image reveals) */}
      {imageRevealed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-0 left-0 right-0 p-10"
        >
          <h2 className="text-white text-5xl mb-3">
            {profile.name}, {profile.age}
          </h2>
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={20} className="text-[#DC143C]" />
            <span className="text-white/90 text-lg">{profile.location}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
