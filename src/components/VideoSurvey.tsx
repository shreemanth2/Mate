import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const surveyQuestions = [
  {
    id: 1,
    videoPlaceholder: 'weekend invitation',
    question: 'You get a sudden invite on a Saturday',
    options: [
      'Drop everything and go',
      'Check my schedule first',
      'Ask who else is coming',
      'Politely decline, I need my me-time'
    ]
  },
  {
    id: 2,
    videoPlaceholder: 'first date scenario',
    question: 'Your first date is up',
    options: [
      'Plan every detail in advance',
      'Pick a chill spot and see what happens',
      'Go for something adventurous',
      'Keep it simple - coffee and conversation'
    ]
  },
  {
    id: 3,
    videoPlaceholder: 'ordering food',
    question: 'How do you order food?',
    options: [
      'Same order every time',
      'Ask for recommendations',
      'Try the weirdest thing on the menu',
      'Let my date decide'
    ]
  }
];

interface VideoSurveyProps {
  onComplete: () => void;
}

export function VideoSurvey({ onComplete }: VideoSurveyProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  // Show intro for 4 seconds
  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  // Simulate video ending after 3 seconds
  useEffect(() => {
    if (!showIntro && !showOptions && !showLoader) {
      const timer = setTimeout(() => {
        setVideoEnded(true);
        setTimeout(() => {
          setShowOptions(true);
        }, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, showIntro, showOptions, showLoader]);

  const handleOptionSelect = (option: string) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);
    
    if (currentQuestion < surveyQuestions.length - 1) {
      // Show loader before next question
      setShowOptions(false);
      setVideoEnded(false);
      setShowLoader(true);
      
      setTimeout(() => {
        setShowLoader(false);
        setCurrentQuestion(currentQuestion + 1);
      }, 2000);
    } else {
      onComplete();
    }
  };

  // Intro screen
  if (showIntro) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#DC143C]/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF8C00]/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative z-10 max-w-3xl text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="mb-12"
          >
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-[#DC143C] to-[#FF8C00] rounded-full flex items-center justify-center">
              <span className="text-6xl">✨</span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-primary text-5xl mb-6"
          >
            Let's create your AI profile
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-2xl"
          >
            Answer a few quick questions and let AI do the rest
          </motion.p>
        </div>
      </div>
    );
  }

  // Loader screen - "one step closer"
  if (showLoader) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#DC143C]/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF8C00]/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative w-32 h-32 mx-auto mb-12"
          >
            <motion.div
              className="absolute inset-0 border-4 border-[#DC143C] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-2 border-4 border-[#FF8C00] border-b-transparent rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary text-4xl"
          >
            One step closer! 🎯
          </motion.h2>
        </div>
      </div>
    );
  }

  const question = surveyQuestions[currentQuestion];

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6] flex items-center justify-center relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#DC143C]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF8C00]/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl px-12">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex gap-4 mb-4">
            {surveyQuestions.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-all ${
                  idx < currentQuestion
                    ? 'bg-[#DC143C]'
                    : idx === currentQuestion
                    ? 'bg-[#DC143C]/50'
                    : 'bg-[#8B4513]/20'
                }`}
              />
            ))}
          </div>
          <p className="text-muted-foreground text-xl text-center">
            Question {currentQuestion + 1} of {surveyQuestions.length}
          </p>
        </div>

        {/* Video and Options Container */}
        <div className="grid grid-cols-12 gap-8">
          {/* Video Section */}
          <div className="col-span-7">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-[#8B5E3C]/20 shadow-2xl"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    className="w-24 h-24 border-4 border-[#DC143C] border-t-transparent rounded-full mx-auto mb-6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="text-primary text-xl">Playing video...</p>
                  <p className="text-muted-foreground text-lg mt-4">{question.question}</p>
                </div>
              </div>

              {/* Question overlay */}
              {videoEnded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#2C1810]/90 to-transparent"
                >
                  <h2 className="text-white text-3xl text-center">{question.question}</h2>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Options Section */}
          <div className="col-span-5 flex items-center">
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="space-y-4 w-full"
                >
                  {question.options.map((option, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleOptionSelect(option)}
                      className="w-full p-6 bg-white/80 backdrop-blur-xl border border-[#8B4513]/20 rounded-2xl text-primary hover:bg-[#FFF4E6] hover:border-[#DC143C]/50 transition-all text-left text-lg shadow-lg"
                    >
                      {option}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
