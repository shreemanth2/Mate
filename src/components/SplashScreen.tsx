import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    // Step 0: Splash for 3s, then step 1 (video)
    const t0 = setTimeout(() => setStep(1), 3000);
    return () => clearTimeout(t0);
  }, []);

  useEffect(() => {
    // Step 1: show short video preview for ~3s, then step 2 (welcome)
    if (step === 1) {
      const t1 = setTimeout(() => setStep(2), 3000);
      return () => clearTimeout(t1);
    }
  }, [step]);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#DC143C]/20 rounded-full blur-3xl" animate={{ scale: [1, 1.3, 1], x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 6, repeat: Infinity }} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF8C00]/20 rounded-full blur-3xl" animate={{ scale: [1.3, 1, 1.3], x: [0, -60, 0], y: [0, -40, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 1 }} />
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#8B4513]/10 rounded-full blur-3xl" animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360] }} transition={{ duration: 8, repeat: Infinity }} />
      </div>

      <AnimatePresence initial={false} mode="wait">
        {step === 0 && (
          <motion.div key="splash" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative z-10 text-center w-full">
            <motion.h1 className="text-9xl mb-6 bg-gradient-to-r from-[#DC143C] via-[#FF8C00] to-[#8B4513] bg-clip-text text-transparent" style={{ fontWeight: 900, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' as any }} animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }} transition={{ duration: 3, repeat: Infinity }}>
              Mate
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-muted-foreground text-2xl">Where AI meets chemistry</motion.p>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="video" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="relative z-10 w-full max-w-4xl px-8 text-center">
            <div className="mx-auto bg-transparent rounded-2xl overflow-hidden w-full" style={{ maxWidth: 880 }}>
              <motion.div className="relative aspect-video bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-[#8B5E3C]/20 shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      className="w-24 h-24 border-4 border-[#DC143C] border-t-transparent rounded-full mx-auto mb-6"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-primary text-xl">Playing video...</p>
                    <p className="text-muted-foreground text-lg mt-4">Why its fun to use Mate</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative z-10 w-full max-w-3xl px-6">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold text-foreground">Welcome to Mate</h2>
              <p className="text-muted-foreground mt-2 text-lg">Where cosmic connections meet modern dating</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-[#8B4513]/10 w-[704px] h-[704px] flex flex-col justify-center items-start">
                <h4 className="font-semibold mb-1 text-base">Astrological Matching</h4>
                <p className="text-sm text-muted-foreground">Find your perfect match based on cosmic compatibility</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-[#8B4513]/10 w-[704px] h-[704px] flex flex-col justify-center items-start">
                <h4 className="font-semibold mb-1 text-base">Smart Algorithm</h4>
                <p className="text-sm text-muted-foreground">AI-powered matching that learns your preferences</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-[#8B4513]/10 w-[704px] h-[704px] flex flex-col justify-center items-start">
                <h4 className="font-semibold mb-1 text-base">Videos & Voice</h4>
                <p className="text-sm text-muted-foreground">Connect through video intros and voice messages</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-[#8B4513]/10 w-[704px] h-[704px] flex flex-col justify-center items-start">
                <h4 className="font-semibold mb-1 text-base">Meaningful Chats</h4>
                <p className="text-sm text-muted-foreground">Start conversations that matter with ice breakers</p>
              </div>
            </div>

            <div className="flex justify-center">
              <button onClick={onComplete} className="px-12 md:px-20 py-4 bg-gradient-to-r from-[#DC143C] to-[#FF8C00] text-white rounded-2xl shadow-lg text-lg">Lets get Started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
