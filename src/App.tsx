import { useState } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { VideoSurvey } from './components/VideoSurvey';
import { ProfileSetup } from './components/ProfileSetup';
import { ProfileView } from './components/ProfileView';
import { HelpSupport } from './components/HelpSupport';
import { DiscoverView } from './components/DiscoverView';
import { ChatList } from './components/ChatList';
import { ChatView } from './components/ChatView';
import mockChats from './components/chatData';
import { NotificationsView } from './components/NotificationsView';
import { Search, MessageCircle, Bell, User } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentView, setCurrentView] = useState<'splash' | 'auth' | 'survey' | 'profileSetup' | 'main'>('splash');
  const [activeTab, setActiveTab] = useState<'discover' | 'chat' | 'notifications' | 'profile'>('discover');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [chats, setChats] = useState<any[]>(mockChats);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [blockedUsers, setBlockedUsers] = useState<Array<{id:string,name:string,chat?: any}>>([]);
  const [assignedVibes, setAssignedVibes] = useState<Record<string, {emoji:string, name:string}>>({});
  const [showHelp, setShowHelp] = useState(false);

  const handleSplashComplete = () => {
    setCurrentView('auth');
  };

  const handleSurveyComplete = () => {
    setCurrentView('profileSetup');
  };

  const handleProfileSetup = (profileData: any) => {
    setUserProfile(profileData);
    setCurrentView('main');
  };

  const handleOpenChat = (chatId: string | any) => {
    // If chatId is an object (profile), convert to string ID and store object
    const id = typeof chatId === 'string' ? chatId : chatId.id;
    // Try to find an existing chat by id
    let existing = chats.find((c) => c.id === id) ?? null;
    let chatObj: any = null;

    if (existing) {
      chatObj = existing;
    } else if (typeof chatId === 'string') {
      // no existing chat and we were given a string id -> nothing to attach
      chatObj = null;
    } else {
      // chatId is a profile object and no existing chat found -> create one
      chatObj = { id: chatId.id, name: chatId.name, image: chatId.image, lastMessage: '', timestamp: 'now', unread: false, messages: [] };
      setChats((prev) => [...prev, chatObj as any]);
    }
    setActiveChatId(id);
    setActiveChat(chatObj);
    setActiveTab('chat');
  };

  const handleMatch = (profile: any) => {
    // Add matched profile to chats if not already present
    const id = profile?.id;
    if (!id) return;
    setChats((prev) => {
      const exists = prev.find((c) => c.id === id);
      if (exists) return prev;
      const chatObj = { id, name: profile.name, image: profile.image, lastMessage: '', timestamp: 'now', unread: true, messages: [] };
      return [...prev, chatObj];
    });
  };

  const handleBackToChats = () => {
    setActiveChatId(null);
    setActiveChat(null);
  };

  const removeChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
      setActiveChat(null);
    }
  };

  // id is the chat id, name is optional display name; store display name in the blockedUsers list
  const addBlockedUser = (id: string, name?: string, chat?: any) => {
    const label = name || id;
    // try to capture the full chat object from state if not provided
    const chatToStore = chat ?? chats.find((c) => c.id === id) ?? undefined;
    setBlockedUsers((prev) => prev.find((b) => b.id === id) ? prev : [...prev, { id, name: label, chat: chatToStore }]);
    // Also remove from chats
    removeChat(id);
  };

  const removeBlockedUser = (idOrName: string) => {
    // find by id or name
    const found = blockedUsers.find(b => b.id === idOrName || b.name === idOrName);
    if (!found) return;
    // remove from blocked users
    setBlockedUsers((prev) => prev.filter(x => x.id !== found.id));
    // restore chat if we have chat metadata
    if (found.chat) {
      setChats((prev) => {
        const exists = prev.find((c) => c.id === found.id);
        if (exists) return prev;
        // put restored chat at the front so it's visible
        return [{ id: found.id, name: found.name, image: found.chat.image ?? '', lastMessage: found.chat.lastMessage ?? '', timestamp: found.chat.timestamp ?? 'now', unread: false, messages: found.chat.messages ?? [] }, ...prev];
      });
    } else {
      // create a minimal chat entry so it appears in the chat list
      setChats((prev) => {
        const exists = prev.find((c) => c.id === idOrName || c.name === idOrName);
        if (exists) return prev;
        return [{ id: idOrName, name: idOrName, image: '', lastMessage: '', timestamp: 'now', unread: false, messages: [] }, ...prev];
      });
    }
  };

  const deleteConversation = (id: string) => {
    setChats((prev) => prev.map((c) => c.id === id ? { ...c, messages: [], lastMessage: '' } : c));
    if (activeChatId === id) {
      setActiveChat((prev: any) => prev ? { ...prev, messages: [], lastMessage: '' } : prev);
    }
  };

  const handleSendMessage = (chatId: string, text: string) => {
    const message = {
      id: String(Date.now()),
      sender: 'me',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } as any;

    setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, messages: [...(c.messages ?? []), message], lastMessage: message.text, timestamp: message.timestamp, unread: false } : c));

    if (activeChatId === chatId) {
      setActiveChat((prev: any) => prev ? { ...prev, messages: [...(prev.messages ?? []), message], lastMessage: message.text, timestamp: message.timestamp } : prev);
    }
  };

  const handleLogout = () => {
    // Reset to splash screen (user can login later)
    setCurrentView('splash');
    // Optionally reset other state here
    setUserProfile(null);
    setActiveTab('discover');
    setActiveChatId(null);
    setActiveChat(null);
  };

  if (currentView === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (currentView === 'auth') {
    return <AuthScreen onComplete={() => setCurrentView('survey')} />;
  }

  if (currentView === 'survey') {
    return <VideoSurvey onComplete={handleSurveyComplete} />;
  }

  if (currentView === 'profileSetup') {
    return <ProfileSetup onComplete={handleProfileSetup} />;
  }

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#2C1810',
            border: '1px solid rgba(139, 69, 19, 0.2)',
          },
        }}
      />
      <div className="h-screen w-full bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6] flex">
        {/* Sidebar Navigation */}
        <nav className="w-72 bg-white/80 backdrop-blur-xl border-r border-[#8B4513]/20 p-8 flex flex-col shadow-lg">
          <div className="mb-12">
            <h1
              className="text-4xl bg-gradient-to-r from-[#DC143C] to-[#FF8C00] bg-clip-text text-transparent"
              style={{ fontWeight: 900, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' as any }}
            >
              Mate
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Where AI meets chemistry</p>
          </div>

          <div className="flex-1 space-y-3">
            <button
              onClick={() => { setActiveTab('discover'); setActiveChatId(null); setActiveChat(null); }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                activeTab === 'discover'
                  ? 'bg-gradient-to-r from-[#DC143C] to-[#FF8C00] text-white shadow-lg'
                  : 'text-muted-foreground hover:bg-[#FFF4E6]'
              }`}
            >
              <Search size={24} />
              <span className="text-lg">Discover</span>
            </button>
            <button
              onClick={() => { setActiveTab('chat'); setActiveChatId(null); setActiveChat(null); }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-[#DC143C] to-[#FF8C00] text-white shadow-lg'
                  : 'text-muted-foreground hover:bg-[#FFF4E6]'
              }`}
            >
              <MessageCircle size={24} />
              <span className="text-lg">Chat</span>
            </button>
            <button
              onClick={() => { setActiveTab('notifications'); setActiveChatId(null); setActiveChat(null); }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                activeTab === 'notifications'
                  ? 'bg-gradient-to-r from-[#DC143C] to-[#FF8C00] text-white shadow-lg'
                  : 'text-muted-foreground hover:bg-[#FFF4E6]'
              }`}
            >
              <Bell size={24} />
              <span className="text-lg">Notifications</span>
            </button>
            <button
              onClick={() => { setActiveTab('profile'); setActiveChatId(null); setActiveChat(null); }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#DC143C] to-[#FF8C00] text-white shadow-lg'
                  : 'text-muted-foreground hover:bg-[#FFF4E6]'
              }`}
            >
              <User size={24} />
              <span className="text-lg">Profile</span>
            </button>
          </div>
        </nav>
        
        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {activeChatId ? (
            <ChatView chatId={activeChatId} chat={activeChat} onBack={handleBackToChats} onUnmatch={(id: string) => removeChat(id)} onDeleteConversation={(id: string) => deleteConversation(id)} onSendMessage={(id: string, text: string) => handleSendMessage(id, text)} onBlock={(id: string, name?: string) => addBlockedUser(id, name)} />
          ) : (
            <>
              {activeTab === 'discover' && <DiscoverView userProfile={userProfile} onOpenChat={handleOpenChat} onMatch={handleMatch} assignedVibes={assignedVibes} onAssignVibe={(id, vibe) => setAssignedVibes({...assignedVibes, [id]: vibe})} />}
              {activeTab === 'chat' && <ChatList chats={chats} onOpenChat={handleOpenChat} />}
              {activeTab === 'notifications' && <NotificationsView />}
              {activeTab === 'profile' && !showHelp && (
                <ProfileView
                  userProfile={userProfile}
                  onRetakeSurvey={() => setCurrentView('survey')}
                  onLogout={handleLogout}
                  onOpenHelp={() => setShowHelp(true)}
                  blockedUsers={blockedUsers}
                  onUnblock={(name: string) => removeBlockedUser(name)}
                />
              )}
              {showHelp && <HelpSupport onBack={() => setShowHelp(false)} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}
