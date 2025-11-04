import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { useState } from 'react';
import mockChats from './chatData';

interface ChatListProps {
  onOpenChat: (chatId: string) => void;
  chats?: any[];
}

export function ChatList({ onOpenChat, chats }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const sourceChats = chats ?? mockChats;

  const filteredChats = sourceChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-foreground text-3xl mb-4">Messages</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="pl-12 bg-white/10 backdrop-blur-xl border-white/20 text-foreground placeholder:text-muted-foreground rounded-2xl"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-auto px-4">
        {filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-white/60">No messages yet</p>
              <p className="text-white/40 text-sm mt-2">Start matching to begin conversations!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 pb-4">
            {filteredChats.map((chat, index) => (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onOpenChat(chat.id)}
                className="w-full p-4 bg-gradient-to-r from-white/5 to-white/2 backdrop-blur-xl border border-[#8B4513]/10 rounded-2xl hover:bg-white/10 transition-all text-left flex items-center gap-4"
              >
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={chat.image}
                    alt={chat.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  {chat.unread && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC143C] rounded-full border-2 border-white/20 shadow-sm" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-foreground truncate">{chat.name}</h3>
                    <span className="text-muted-foreground text-xs">{chat.timestamp}</span>
                  </div>
                  <p className={`text-sm truncate ${chat.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
