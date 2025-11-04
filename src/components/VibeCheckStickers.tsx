import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const vibeStickers = [
  { emoji: '🔥', name: 'Fire Vibe', points: 10 },
  { emoji: '✨', name: 'Sparkle Energy', points: 10 },
  { emoji: '💫', name: 'Star Power', points: 10 },
  { emoji: '🌈', name: 'Rainbow Soul', points: 10 },
  { emoji: '⚡', name: 'Electric', points: 15 },
  { emoji: '🎨', name: 'Creative Spirit', points: 10 },
  { emoji: '🎭', name: 'Drama Queen', points: 15 },
  { emoji: '🎪', name: 'Life of Party', points: 15 },
  { emoji: '🦄', name: 'Unicorn Rare', points: 20 },
  { emoji: '👑', name: 'Royalty', points: 20 },
  { emoji: '💎', name: 'Gem Quality', points: 20 },
  { emoji: '🌟', name: 'Superstar', points: 25 }
];

interface VibeCheckStickersProps {
  onClose: () => void;
  onSelectSticker: (sticker: typeof vibeStickers[0]) => void;
}

export function VibeCheckStickers({ onClose, onSelectSticker }: VibeCheckStickersProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-[#8B4513]/20 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-primary text-3xl">Vibe Check! ✨</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <p className="text-muted-foreground text-lg mb-8">
          Choose a sticker that matches your vibe today! Collect stickers to earn vibe points 🎯
        </p>

        <div className="grid grid-cols-6 gap-4 max-h-96 overflow-y-auto">
          {vibeStickers.map((sticker, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelectSticker(sticker)}
              className="aspect-square bg-[#FFF8E7] hover:bg-[#FFF4E6] backdrop-blur-xl rounded-2xl border border-[#8B4513]/20 hover:border-[#DC143C]/50 transition-all flex flex-col items-center justify-center gap-2 p-3"
            >
              <span className="text-4xl">{sticker.emoji}</span>
              <span className="text-muted-foreground text-xs text-center leading-tight">{sticker.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
