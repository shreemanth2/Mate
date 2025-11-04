import { motion } from 'motion/react';
import { MapPin, Edit, LogOut, Trash2, HelpCircle, Settings, Sparkles, ArrowLeft, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useState, useEffect, useRef } from 'react';

interface ProfileViewProps {
  userProfile: any;
  onRetakeSurvey: () => void;
  onLogout?: () => void;
  onOpenHelp?: () => void;
  blockedUsers?: Array<{id:string,name:string,chat?: any}>;
  onUnblock?: (id: string) => void;
}

export function ProfileView({ userProfile, onRetakeSurvey, onLogout, onOpenHelp, blockedUsers = [], onUnblock }: ProfileViewProps) {
  const [nextRetakeAvailable, setNextRetakeAvailable] = useState<number | null>(null);
  const [isCooldownModalOpen, setIsCooldownModalOpen] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [changeStage, setChangeStage] = useState<'form'|'success'>('form');
  const [isEmailChangedPopupOpen, setIsEmailChangedPopupOpen] = useState(false);
  const [isInvalidEmailOpen, setIsInvalidEmailOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordChangedPopupOpen, setIsPasswordChangedPopupOpen] = useState(false);
  const [isSamePasswordAlertOpen, setIsSamePasswordAlertOpen] = useState(false);

  // Settings state
  const [discoveryDistance, setDiscoveryDistance] = useState(50);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState<'dark'|'light'>('light');

  useEffect(() => {
    const last = localStorage.getItem('lastRetake');
    if (last) {
      const lastTs = parseInt(last, 10);
  const cooldownMs = 48 * 60 * 60 * 1000; // 48 hours
      const next = lastTs + cooldownMs;
      setNextRetakeAvailable(next);
      setRemainingMs(Math.max(0, next - Date.now()));
    }
  }, []);

  const handleRetakeClick = () => {
    const now = Date.now();
    if (nextRetakeAvailable && now < nextRetakeAvailable) {
      // open the cooldown modal with the remaining time
      setRemainingMs(Math.max(0, nextRetakeAvailable - now));
      setIsCooldownModalOpen(true);
      return;
    }
    // Allow retake: store timestamp and call handler
    localStorage.setItem('lastRetake', String(now));
  const cooldownMs = 48 * 60 * 60 * 1000; // 48 hours
  setNextRetakeAvailable(now + cooldownMs);
    onRetakeSurvey();
  };

  // Live countdown when modal is open
  useEffect(() => {
    if (isCooldownModalOpen && nextRetakeAvailable) {
      // start interval
      intervalRef.current = window.setInterval(() => {
        const rem = Math.max(0, nextRetakeAvailable - Date.now());
        setRemainingMs(rem);
        if (rem <= 0) {
          // cooldown ended
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsCooldownModalOpen(false);
          setNextRetakeAvailable(null);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isCooldownModalOpen, nextRetakeAvailable]);

  const formatMs = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const hoursLeft = Math.ceil((remainingMs || 0) / (1000 * 60 * 60));
  // Mock profile data if not provided
  const profile = userProfile || {
    name: 'Your Name',
    location: 'Your City',
    birthdate: '1995-01-01',
    image: 'https://images.unsplash.com/photo-1599793830316-f3d76336206e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjE4OTk4OTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Travel', 'Music', 'Art'],
    aiDescription: 'Your AI-generated description will appear here after completing the survey and profile setup.'
  };

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Profile Picture */}
          <div className="col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-[#8B4513]/10">
                <h2 className="text-primary text-xl mb-4">Pictures</h2>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  className="w-full bg-[#FFF4E6] hover:bg-[#FFE4B5] text-primary border-none"
                  variant="outline"
                >
                  <Edit size={18} className="mr-2" />
                  Upload New Photo
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Profile Info */}
          <div className="col-span-2 space-y-6">
            {/* Basic Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-[#8B4513]/10"
            >
              <h1 className="text-primary text-3xl mb-2">
                {profile.name}, {calculateAge(profile.birthdate)}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin size={18} className="text-[#DC143C]" />
                <span className="text-base">{profile.location}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag: string) => (
                  <Badge
                    key={tag}
                    className="bg-gradient-to-r from-[#DC143C] to-[#FF8C00] text-white px-4 py-1 text-sm"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>

            {/* AI Description Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-[#8B4513]/10"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={20} className="text-[#FFD700]" />
                <h3 className="text-primary text-xl">AI Description</h3>
              </div>
              <p className="text-foreground text-base mb-4 leading-relaxed">{profile.aiDescription}</p>
              <Button
                onClick={handleRetakeClick}
                className="bg-[#FFF4E6] hover:bg-[#FFE4B5] text-primary border-none"
                variant="outline"
              >
                <Edit size={18} className="mr-2" />
                Retake Survey to Update
              </Button>
            </motion.div>

            {/* Cooldown Modal - show when user tries to retake early */}
            <AlertDialog open={isCooldownModalOpen} onOpenChange={(open: boolean) => setIsCooldownModalOpen(open)}>
              <AlertDialogContent className="bg-white border-[#8B4513]/20">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-primary">Next video survey comes in 48 hrs</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      You can retake the video survey after the cooldown ends. Countdown (HH:MM:SS):
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex items-center justify-center py-6 text-3xl font-mono">
                    {formatMs(remainingMs)}
                  </div>
                <AlertDialogFooter>
                  <AlertDialogAction
                    className="bg-[#8B4513] text-white"
                    onClick={() => {
                      // Close modal manually
                      setIsCooldownModalOpen(false);
                      if (intervalRef.current !== null) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                      }
                    }}
                  >
                    OK
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Account Settings Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-[#8B4513]/10"
            >
              <h2 className="text-primary text-xl mb-4">Settings</h2>

              <div className="space-y-3">
                <button onClick={() => setIsSettingsOpen(true)} className="w-full p-4 bg-[#FFF8E7] border border-[#8B4513]/10 rounded-2xl hover:bg-[#FFF4E6] transition-all text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#8B4513]/10 rounded-full flex items-center justify-center">
                    <Settings className="text-[#8B4513]" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-primary text-base">Account Details</h3>
                    <p className="text-muted-foreground text-sm">Email, password, and privacy</p>
                  </div>
                </button>

                {/* Settings Overlay */}
                {isSettingsOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-3xl w-full max-w-3xl p-6 shadow-lg border border-[#8B4513]/20">
                      <div className="flex items-center justify-between mb-4">
              <button onClick={() => setIsSettingsOpen(false)} aria-label="Back" className="px-2 py-2 rounded-md bg-white border border-[#8B4513]/10 hover:bg-[#FFF4E6] transition-colors">
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-xl font-semibold">Settings</h2>
              <button onClick={() => setIsSettingsOpen(false)} aria-label="Close" className="px-2 py-2 rounded-md bg-white border border-[#8B4513]/10 hover:bg-[#FFF4E6] transition-colors">
                <X size={18} />
              </button>
                      </div>

                      <div className="space-y-6">
                        {/* Account Section */}
                        <div className="bg-[#FFF8E7] p-4 rounded-2xl border border-[#8B4513]/10">
                          <h3 className="font-semibold mb-2">Account</h3>
                          <p className="text-sm text-muted-foreground mb-3">Change email, password, or delete your account.</p>
                          <div className="flex gap-2">
                            <button onClick={() => setIsChangeEmailOpen(true)} className="px-4 py-2 bg-white border rounded-md hover:bg-[#FFF4E6] hover:border-[#8B4513]/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B4513]/20 active:bg-[#FFE4B5]">Change email</button>
                            <button onClick={() => setIsChangePasswordOpen(true)} className="px-4 py-2 bg-white border rounded-md hover:bg-[#FFF4E6] hover:border-[#8B4513]/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B4513]/20 active:bg-[#FFE4B5]">Change password</button>
                            {/* <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-[#8B0000] active:bg-[#660000] transition-colors">Delete account</button> */}
                          </div>
                        </div>

                        {/* Preferences Section */}
                        <div className="bg-[#FFF8E7] p-4 rounded-2xl border border-[#8B4513]/10">
                          <h3 className="font-semibold mb-2">Preferences</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm">Discovery distance: {discoveryDistance} km</label>
                              <input type="range" min={5} max={200} value={discoveryDistance} onChange={(e:any) => setDiscoveryDistance(parseInt(e.target.value,10))} className="w-full" />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">Notifications</h4>
                                <p className="text-sm text-muted-foreground">Notification preferences</p>
                              </div>
                              <div className="flex items-center">
                                <select value={notificationsEnabled ? 'yes' : 'no'} onChange={(e:any) => setNotificationsEnabled(e.target.value === 'yes')} className="border rounded-md p-2 ml-4">
                                  <option value="yes">Yes</option>
                                  <option value="no">No</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">Theme</h4>
                                <p className="text-sm text-muted-foreground">Dark mode or light mode</p>
                              </div>
                              <select value={theme} onChange={(e:any) => setTheme(e.target.value)} className="border rounded-md p-2">
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Privacy Section */}
                        <div className="bg-[#FFF8E7] p-4 rounded-2xl border border-[#8B4513]/10">
                          <h3 className="font-semibold mb-2">Privacy</h3>
                          <p className="text-sm text-muted-foreground mb-3">Manage who can see your profile and block users.</p>
                          <div className="space-y-2">
                            {/* Profile visibility removed - managed elsewhere or not needed */}

                            <div>
                              <h4 className="font-medium mb-2">Blocked users</h4>
                              {blockedUsers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No blocked users</p>
                              ) : (
                                <ul className="space-y-1">
                                  {blockedUsers.map((b) => (
                                    <li key={b.id} className="flex items-center justify-between">
                                      <span>{b.name}</span>
                                      <button className="text-sm text-red-600" onClick={() => { if (onUnblock) onUnblock(b.id); }}>Unblock</button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button onClick={() => setIsSettingsOpen(false)} className="px-6 py-2 bg-[#8B4513] text-white rounded-lg">Done</button>
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={() => onOpenHelp && onOpenHelp()} className="w-full p-4 bg-[#FFF8E7] border border-[#8B4513]/10 rounded-2xl hover:bg-[#FFF4E6] transition-all text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#D2691E]/20 rounded-full flex items-center justify-center">
                    <HelpCircle className="text-[#D2691E]" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-primary text-base">Help & Support</h3>
                    <p className="text-muted-foreground text-sm">FAQs, contact us, report issues</p>
                  </div>
                </button>

                <Separator className="bg-[#8B4513]/20 my-3" />

                <button onClick={() => setIsLogoutDialogOpen(true)} className="w-full p-4 bg-[#FFF8E7] border border-[#8B4513]/10 rounded-2xl hover:bg-[#FFF4E6] transition-all text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#D2691E]/20 rounded-full flex items-center justify-center">
                    <LogOut className="text-[#D2691E]" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-primary text-base">Log Out</h3>
                    <p className="text-muted-foreground text-sm">Sign out of your account</p>
                  </div>
                </button>
                {/* Logout Confirmation Dialog */}
                {/** Using AlertDialog for consistency */}
                <AlertDialog open={isLogoutDialogOpen} onOpenChange={(open: boolean) => setIsLogoutDialogOpen(open)}>
                  <AlertDialogContent className="bg-white border-[#8B4513]/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-primary">Log out?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        You will be logged out of your account. You can log in later. Do you want to proceed?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-[#8B4513]/20 text-primary hover:bg-[#FFF4E6]">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-[#B22222] hover:bg-[#8B0000] text-white"
                        onClick={() => {
                          // call optional prop to let parent navigate to splash
                          if (onLogout) onLogout();
                        }}
                      >
                        Yes, log out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Change Email Dialog */}
                <AlertDialog open={isChangeEmailOpen} onOpenChange={(open: boolean) => {
                  setIsChangeEmailOpen(open);
                  if (!open) {
                    setChangeStage('form');
                    setNewEmail('');
                  }
                }}>
                  <AlertDialogContent className="bg-white border-[#8B4513]/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-primary">Change Email</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        Your current email: <strong className="text-primary">user@example.com</strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    {changeStage === 'form' ? (
                      <div className="space-y-4 p-4">
                        <label className="text-sm">New email</label>
                        <Input value={newEmail} onChange={(e:any) => setNewEmail(e.target.value)} placeholder="you@domain.com" className="w-full" />
                        <div className="flex justify-end">
                          <AlertDialogCancel className="mr-2">Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-[#8B4513] text-white" onClick={() => {
                            // simple validation
                            if (!newEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail)) {
                              // show popup
                              setIsInvalidEmailOpen(true);
                              return;
                            }
                            // emulate change: close form dialog and open success popup
                            setIsChangeEmailOpen(false);
                            setIsEmailChangedPopupOpen(true);
                          }}>
                            OK
                          </AlertDialogAction>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-primary text-lg mb-4">Email changed successfully</p>
                        <div className="flex justify-center">
                          <button onClick={() => setIsChangeEmailOpen(false)} className="px-4 py-2 bg-[#8B4513] text-white rounded-md">Close</button>
                        </div>
                      </div>
                    )}
                  </AlertDialogContent>
                </AlertDialog>

                  {/* Email changed success popup */}
                  <AlertDialog open={isEmailChangedPopupOpen} onOpenChange={(open:boolean) => setIsEmailChangedPopupOpen(open)}>
                    <AlertDialogContent className="bg-white border-[#8B4513]/20">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-primary">Email changed successfully</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">Your email address has been updated.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction className="bg-[#8B4513] text-white" onClick={() => setIsEmailChangedPopupOpen(false)}>Close</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Invalid email popup */}
                  <AlertDialog open={isInvalidEmailOpen} onOpenChange={(open:boolean) => setIsInvalidEmailOpen(open)}>
                    <AlertDialogContent className="bg-white border-[#8B4513]/20">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-primary">Enter valid email</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">Please provide a valid email address.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction className="bg-[#8B4513] text-white" onClick={() => setIsInvalidEmailOpen(false)}>Close</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="w-full p-4 bg-[#B22222]/10 border border-[#B22222]/20 rounded-2xl hover:bg-[#B22222]/20 transition-all text-left flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#B22222]/20 rounded-full flex items-center justify-center">
                        <Trash2 className="text-[#B22222]" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[#B22222] text-base">Delete Account</h3>
                        <p className="text-[#B22222]/70 text-sm">Permanently delete your account</p>
                      </div>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white border-[#8B4513]/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-primary">Delete Account?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-[#8B4513]/20 text-primary hover:bg-[#FFF4E6]">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction className="bg-[#B22222] hover:bg-[#8B0000] text-white">
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                  {/* Change Password Dialog */}
                  <AlertDialog open={isChangePasswordOpen} onOpenChange={(open:boolean) => {
                    setIsChangePasswordOpen(open);
                    if (!open) {
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }
                  }}>
                    <AlertDialogContent className="bg-white border-[#8B4513]/20">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-primary">Change Password</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">Enter your current password and choose a new one.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-4 p-4">
                        <label className="text-sm">Old password</label>
                        <Input type="password" value={oldPassword} onChange={(e:any) => setOldPassword(e.target.value)} placeholder="Current password" className="w-full" />
                        <label className="text-sm">New password</label>
                        <Input type="password" value={newPassword} onChange={(e:any) => setNewPassword(e.target.value)} placeholder="New password" className="w-full" />
                        <label className="text-sm">Retype new password</label>
                        <Input type="password" value={confirmPassword} onChange={(e:any) => setConfirmPassword(e.target.value)} placeholder="Retype new password" className="w-full" />
                        <div className="flex justify-end">
                          <AlertDialogCancel className="mr-2">Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-[#8B4513] text-white" onClick={() => {
                            if (!oldPassword) { toast.error('Please enter your current password'); return; }
                            if (!newPassword || newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
                            if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
                            if (newPassword === oldPassword) {
                              // Notify user that new password must be different
                              setIsSamePasswordAlertOpen(true);
                              return;
                            }
                            // emulate change
                            setIsChangePasswordOpen(false);
                            setIsPasswordChangedPopupOpen(true);
                          }}>OK</AlertDialogAction>
                        </div>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Password changed success popup */}
                  <AlertDialog open={isPasswordChangedPopupOpen} onOpenChange={(open:boolean) => setIsPasswordChangedPopupOpen(open)}>
                    <AlertDialogContent className="bg-white border-[#8B4513]/20">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-primary">Password changed successfully</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">Your password has been updated.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction className="bg-[#8B4513] text-white" onClick={() => setIsPasswordChangedPopupOpen(false)}>Close</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Same-password alert */}
                  <AlertDialog open={isSamePasswordAlertOpen} onOpenChange={(open:boolean) => setIsSamePasswordAlertOpen(open)}>
                    <AlertDialogContent className="bg-white border-[#8B4513]/20">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-primary">Choose a different password</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">Your new password must be different from your current password.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction className="bg-[#8B4513] text-white" onClick={() => setIsSamePasswordAlertOpen(false)}>OK</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
