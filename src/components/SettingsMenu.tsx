import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Info, Trophy, HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface SettingsMenuProps {
  onClose: () => void;
  collectedStickers: any[];
  assignedVibes?: Record<string, {emoji:string, name:string}>;
}

export function SettingsMenu({ onClose, collectedStickers, assignedVibes = {} }: SettingsMenuProps) {
  const [view, setView] = useState<'menu' | 'how' | 'about' | 'settings'>('menu');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white backdrop-blur-xl rounded-3xl p-4 max-w-2xl w-full border border-[#8B4513]/20 shadow-2xl max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {view !== 'menu' ? (
              <button onClick={() => setView('menu')} className="text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft size={20} />
              </button>
            ) : null}
            <h2 className="text-primary text-2xl">{view === 'menu' ? 'Menu' : view === 'how' ? 'How to Use' : view === 'about' ? 'About Mate' : 'Settings'}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-auto pr-4">
          {view === 'menu' && (
            <div className="space-y-4 p-2">
              {/* Collected stickers */}
              {collectedStickers.length > 0 && (
                <div className="bg-[#FFF8E7] backdrop-blur-xl rounded-2xl p-4 border border-[#8B4513]/20">
                  <h4 className="text-primary mb-2">Collected Stickers</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {collectedStickers.map((sticker, idx) => (
                      <span key={idx} className="text-3xl">{sticker.emoji}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* How to Use */}
              <button onClick={() => setView('how')} className="w-full bg-[#FFF8E7] hover:bg-[#FFF4E6] backdrop-blur-xl rounded-2xl p-5 border border-[#8B4513]/20 transition-all text-left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#8B4513]/10 rounded-full flex items-center justify-center">
                    <HelpCircle className="text-[#8B4513]" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-primary text-lg">How to Use</h3>
                    <p className="text-muted-foreground">Learn the basics</p>
                  </div>
                </div>
              </button>

              {/* About Us */}
              <button onClick={() => setView('about')} className="w-full bg-[#FFF8E7] hover:bg-[#FFF4E6] backdrop-blur-xl rounded-2xl p-5 border border-[#8B4513]/20 transition-all text-left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#D2691E]/20 rounded-full flex items-center justify-center">
                    <Info className="text-[#D2691E]" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-primary text-lg">About Mate</h3>
                    <p className="text-muted-foreground">Learn about Mate</p>
                  </div>
                </div>
              </button>

              {/* Settings */}
              <button onClick={() => setView('settings')} className="w-full bg-[#FFF8E7] hover:bg-[#FFF4E6] backdrop-blur-xl rounded-2xl p-5 border border-[#8B4513]/20 transition-all text-left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#DC143C]/20 rounded-full flex items-center justify-center">
                    <Settings className="text-[#DC143C]" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-primary text-lg">Settings</h3>
                    <p className="text-muted-foreground">Account & preferences</p>
                  </div>
                </div>
              </button>

              <div className="mt-2">
                <p className="text-muted-foreground text-center">Tap an item to open its page — all pages are scrollable.</p>
              </div>
              {assignedVibes && Object.keys(assignedVibes).length > 0 && (
                <div className="mt-4 p-2 bg-[#FFF8E7] rounded-2xl border border-[#8B4513]/20">
                  <h4 className="text-primary mb-2">Assigned Vibes</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(assignedVibes).map(([id, vibe]) => (
                      <div key={id} className="px-3 py-2 bg-white/80 rounded-lg flex items-center gap-2">
                        <span className="text-lg">{vibe.emoji}</span>
                        <span className="text-sm text-muted-foreground">{vibe.name} ({id})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'how' && (
            <div className="p-2 space-y-6">
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <h4 className="text-primary font-semibold">Create your profile</h4>
                  <p className="text-muted-foreground">Add your name, photos, and a short bio so others can get to know you.</p>
                </li>
                <li>
                  <h4 className="text-primary font-semibold">Set your preferences</h4>
                  <p className="text-muted-foreground">Choose who you want to meet and what you're looking for.</p>
                </li>
                <li>
                  <h4 className="text-primary font-semibold">Discover profiles</h4>
                  <p className="text-muted-foreground">Browse people nearby and send likes or messages.</p>
                </li>
                <li>
                  <h4 className="text-primary font-semibold">Match and chat</h4>
                  <p className="text-muted-foreground">When you match, start a conversation and get to know each other.</p>
                </li>
                <li>
                  <h4 className="text-primary font-semibold">Stay safe</h4>
                  <p className="text-muted-foreground">Report or unmatch users who violate community guidelines.</p>
                </li>
              </ol>
              <div className="pt-4">
                <p className="text-muted-foreground">For tips and best practices, keep exploring Mate — and have fun!</p>
              </div>
            </div>
          )}

          {view === 'about' && (
            <div className="p-2 space-y-4">
              <p className="text-muted-foreground">Mate is a people-first dating experience that combines AI-powered suggestions with human chemistry. Our mission is to help you find meaningful connections in a safe and welcoming environment.</p>
              <p className="text-muted-foreground">Version 1.0 — built with ❤️ by the Mate team.</p>
              <div className="mt-4">
                <h4 className="text-primary font-semibold">Contact</h4>
                <p className="text-muted-foreground">support@mate.example</p>
              </div>
            </div>
          )}

          {view === 'settings' && (
            <div className="p-2 space-y-4">
              <div className="space-y-2">
                <h4 className="text-primary font-semibold">Account</h4>
                <p className="text-muted-foreground">Change email, password, or delete your account.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-primary font-semibold">Preferences</h4>
                <p className="text-muted-foreground">Set discovery distance, notification preferences, and more.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-primary font-semibold">Privacy</h4>
                <p className="text-muted-foreground">Manage who can see your profile and block users.</p>
              </div>
              <div className="pt-4">
                <Button className="w-full" onClick={() => alert('Open real settings screen in the next step')}>Open full settings</Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-[#8B4513]/20">
          <p className="text-muted-foreground text-center">Mate v1.0 - Where AI meets chemistry ✨</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
