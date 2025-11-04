import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { ProfileCard } from './ProfileCard';
import { MatchAnimation } from './MatchAnimation';
import { VibeCheckStickers } from './VibeCheckStickers';
import { SettingsMenu } from './SettingsMenu';
import { Heart, Sparkles, Menu, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';

const femaleProfiles = [
  {
    id: 'f1',
    name: 'Emma Thompson',
    age: 26,
    location: 'Portland, Oregon',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    description: 'Artist and coffee enthusiast who loves autumn walks and deep conversations. Looking for someone who appreciates the simple beauty in everyday moments.',
    tags: ['Art', 'Coffee', 'Nature']
  },
  {
    id: 'f2',
    name: 'Sophia Martinez',
    age: 28,
    location: 'Seattle, Washington',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80',
    description: 'Yoga instructor by day, foodie by night. I believe in living authentically and surrounding myself with positive energy.',
    tags: ['Fitness', 'Food', 'Travel']
  },
  {
    id: 'f3',
    name: 'Isabella Chen',
    age: 25,
    location: 'San Francisco, California',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    description: 'Tech professional with a passion for music and photography. Weekend explorer searching for hidden gems in the city.',
    tags: ['Music', 'Photography', 'Reading']
  }
];
  // Add default vibes
  femaleProfiles.forEach((p, i) => {
    const arr = [{ emoji: '✨', name: 'Sparkle' }, { emoji: '🌟', name: 'Shine' }, { emoji: '🌈', name: 'Rainbow' }];
    if (!(p as any).vibe) (p as any).vibe = arr[i % arr.length];
  });

const maleProfiles = [
  {
    id: 'm1',
    name: 'Alex Rivers',
    age: 29,
    location: 'Denver, Colorado',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
    description: 'Outdoor enthusiast and adventure seeker. Love hiking, camping, and finding new trails to explore. Looking for a partner in adventure.',
    tags: ['Nature', 'Sports', 'Travel']
  },
  {
    id: 'm2',
    name: 'Marcus Thompson',
    age: 27,
    location: 'Austin, Texas',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    description: 'Musician and creative soul. Spend my days composing and my nights performing. Seeking someone who loves live music and spontaneous jam sessions.',
    tags: ['Music', 'Art', 'Dancing']
  },
  {
    id: 'm3',
    name: 'Daniel Kim',
    age: 30,
    location: 'Boston, Massachusetts',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
    description: 'Chef with a love for experimenting with seasonal ingredients. Always up for food adventures and cooking together.',
    tags: ['Food', 'Fitness', 'Movies']
  }
];
  maleProfiles.forEach((p, i) => {
    const arr = [{ emoji: '🔥', name: 'Fire' }, { emoji: '⚡', name: 'Electric' }, { emoji: '💫', name: 'Star' }];
    if (!(p as any).vibe) (p as any).vibe = arr[i % arr.length];
  });

interface DiscoverViewProps {
  userProfile?: {
    gender: string;
    preferences: string[];
    name?: string;
    image?: string;
  };
  onOpenChat?: (profile: any) => void;
  onMatch?: (profile: any) => void;
  assignedVibes?: Record<string, {emoji:string, name:string}>;
  onAssignVibe?: (id: string, vibe: {emoji:string, name:string}) => void;
}

export function DiscoverView({ userProfile, onOpenChat, onMatch, assignedVibes = {}, onAssignVibe }: DiscoverViewProps) {
  const [profiles, setProfiles] = useState<typeof femaleProfiles>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(true);
  const [imageRevealed, setImageRevealed] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<typeof femaleProfiles[0] | null>(null);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [showVibeCheck, setShowVibeCheck] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [collectedStickers, setCollectedStickers] = useState<any[]>([]);
  // assignedVibes is now optionally provided by parent via props
  // const [assignedVibes, setAssignedVibes] = useState<Record<string, {emoji:string, name:string}>>({});
  const [toastShown, setToastShown] = useState(false);

  const y = useMotionValue(0);
  const opacity = useTransform(y, [-200, 0], [0.5, 1]);
  const cardRef = useRef<HTMLDivElement>(null);

  // Filter profiles based on user preferences
  useEffect(() => {
    // Build base list according to preferences
    let baseProfiles: typeof femaleProfiles = [];
    if (!userProfile?.preferences || userProfile.preferences.length === 0) {
      baseProfiles = [...femaleProfiles, ...maleProfiles];
    } else {
      if (userProfile.preferences.includes('Female')) baseProfiles = [...baseProfiles, ...femaleProfiles];
      if (userProfile.preferences.includes('Male')) baseProfiles = [...baseProfiles, ...maleProfiles];
      if (userProfile.preferences.includes('LGBTQIA+')) baseProfiles = [...baseProfiles, ...femaleProfiles, ...maleProfiles];
    }

    // Ensure every profile has a vibe fallback
    const ensured = baseProfiles.map((p, i) => {
      if ((p as any).vibe) return p;
      const defaults = [
        { emoji: '✨', name: 'Sparkle' },
        { emoji: '🌟', name: 'Shine' },
        { emoji: '🌈', name: 'Rainbow' },
        { emoji: '🔥', name: 'Fire' },
        { emoji: '⚡', name: 'Electric' },
        { emoji: '💫', name: 'Star' },
      ];
      return { ...p, vibe: defaults[i % defaults.length] } as typeof p;
    });

    setProfiles(ensured);
  }, [userProfile]);

  useEffect(() => {
    // Show the swipe hint only once across sessions
    const shown = localStorage.getItem('swipeToastShown') === '1';
    if (!shown && profiles.length > 0) {
      toast.info('Swipe up or press ↑ arrow to move to next, double tap to show interest', { duration: 5000 });
      setToastShown(true);
      try {
        localStorage.setItem('swipeToastShown', '1');
      } catch (e) {
        // ignore
      }
    }
  }, [profiles.length]);

  // Keyboard support for up arrow
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && currentIndex < profiles.length) {
        e.preventDefault();
        if (currentIndex < profiles.length - 1) {
          setShowDescription(true);
          setImageRevealed(false);
          setCurrentIndex(currentIndex + 1);
          y.set(0);
        } else {
          setCurrentIndex(profiles.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, profiles.length, y]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDescription(false);
      setImageRevealed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleDoubleTap = () => {
    setLikeAnimation(true);
    setTimeout(() => {
      setLikeAnimation(false);
      // Simulate match (50% chance)
      if (Math.random() > 0.5) {
          const matched = profiles[currentIndex];
          setMatchedProfile(matched);
          setShowMatch(true);
          if (onMatch) onMatch(matched);
      } else {
        moveToNextProfile();
      }
    }, 800);
  };

  const handleSwipeUp = () => {
    moveToNextProfile();
  };

  const handleSelectSticker = (sticker: any) => {
    // Stickers-only: add to user's collected stickers but do NOT change the viewed profile's vibe
    setCollectedStickers((prev) => [...prev, sticker]);
    setShowVibeCheck(false);
  };

  const moveToNextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setShowDescription(true);
      setImageRevealed(false);
      setCurrentIndex(currentIndex + 1);
      y.set(0);
    } else {
      setCurrentIndex(profiles.length);
    }
  };

  const handleMatchClose = (action: 'discover' | 'message') => {
    setShowMatch(false);
    if (action === 'message' && matchedProfile && onOpenChat) {
      onOpenChat(matchedProfile);
    }
    setMatchedProfile(null);
    if (action === 'discover') {
      moveToNextProfile();
    }
  };

  const handleDragEnd = (_event: any, info: any) => {
    if (info.offset.y < -100) {
      handleSwipeUp();
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-primary text-2xl mb-2">No profiles available</h2>
          <p className="text-muted-foreground">Update your preferences to see more matches</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="text-9xl mb-6"
          >
            🎉
          </motion.div>
          <h2 className="text-primary text-3xl mb-2">You're all caught up!</h2>
          <p className="text-muted-foreground">Check back later for new profiles</p>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <>
      <div className="h-full relative overflow-hidden bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
        {/* Top Left - Vibe Check */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setShowVibeCheck(true)}
          className="absolute top-8 left-8 z-30 bg-white/80 backdrop-blur-xl border border-[#8B4513]/20 rounded-2xl px-6 py-3 flex items-center gap-3 hover:bg-white transition-all shadow-lg"
        >
          <Sparkles size={24} className="text-[#FFD700]" />
          <span className="text-primary text-lg">Vibe Check</span>
        </motion.button>

        {/* Top Right - Menu */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setShowSettings(true)}
          className="absolute top-8 right-8 z-30 bg-white/80 backdrop-blur-xl border border-[#8B4513]/20 rounded-2xl p-4 hover:bg-white transition-all shadow-lg"
        >
          <Menu size={24} className="text-primary" />
        </motion.button>

        {/* Main Content - Bento Grid Layout */}
        <div className="h-full w-full flex items-center justify-center p-8">
          <div className="w-full max-w-7xl h-full grid grid-cols-12 gap-6">
            {/* Profile Card - Takes up most space */}
            <div className="col-span-8 h-full">
              <motion.div
                ref={cardRef}
                className="h-full w-full relative cursor-pointer"
                onDoubleClick={handleDoubleTap}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                style={{ y, opacity }}
              >
                <ProfileCard
                  profile={currentProfile}
                  showDescription={showDescription}
                  imageRevealed={imageRevealed}
                  className="h-full w-full rounded-3xl shadow-2xl"
                  vibe={assignedVibes[currentProfile.id] ?? (currentProfile as any).vibe}
                />

                {/* Swipe hint removed per request: no top-center arrow animation */}

                {/* Like animation */}
                <AnimatePresence>
                  {likeAnimation && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                    >
                      <div className="bg-[#DC143C]/20 rounded-full p-12 backdrop-blur-xl">
                        <Heart size={120} className="text-[#DC143C] fill-[#DC143C]" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Right Sidebar - Actions */}
            <div className="col-span-4 h-full flex flex-col gap-6">
              {/* Profile Info Card */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#8B4513]/10">
                <h3 className="text-2xl text-primary mb-2">{currentProfile.name}, {currentProfile.age}</h3>
                <p className="text-muted-foreground mb-4">{currentProfile.location}</p>
                <p className="text-foreground mb-4">{currentProfile.description}</p>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-[#FFF4E6] text-primary rounded-xl text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Card */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#8B4513]/10 flex-1 flex flex-col justify-center gap-4">
                <button
                  onClick={handleDoubleTap}
                  className="w-full bg-gradient-to-r from-[#DC143C] to-[#FF8C00] hover:from-[#B22222] hover:to-[#FF7F00] text-white py-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 text-lg"
                >
                  <Heart size={24} />
                  Show Interest
                </button>
                
                <button
                  onClick={handleSwipeUp}
                  className="w-full bg-[#8B4513] hover:bg-[#654321] text-white py-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 text-lg"
                >
                  <ArrowUp size={24} />
                  Next Profile
                </button>

                <p className="text-center text-muted-foreground text-sm mt-2">
                  {currentIndex + 1} of {profiles.length} profiles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vibe Check Modal */}
      <AnimatePresence>
        {showVibeCheck && (
          <VibeCheckStickers
            onClose={() => setShowVibeCheck(false)}
            onSelectSticker={handleSelectSticker}
          />
        )}
      </AnimatePresence>

      {/* Settings Menu */}
      <AnimatePresence>
        {showSettings && (
          <SettingsMenu
            onClose={() => setShowSettings(false)}
            collectedStickers={collectedStickers}
            assignedVibes={assignedVibes}
          />
        )}
      </AnimatePresence>

      {/* Match Animation */}
      <AnimatePresence>
        {showMatch && matchedProfile && (
          <MatchAnimation
            profile={matchedProfile}
            userProfile={userProfile}
            onClose={handleMatchClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}
