import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MoreVertical, Send } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface ChatViewProps {
  chatId: string;
  chat?: any;
  onBack: () => void;
  onUnmatch?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onSendMessage?: (chatId: string, text: string) => void;
  onBlock?: (id: string, name?: string, chat?: any) => void;
}

const mockMessages = [
  {
    id: '1',
    sender: 'them',
    text: 'Hey! How are you doing?',
    timestamp: '10:30 AM'
  },
  {
    id: '2',
    sender: 'me',
    text: 'Hi! I\'m doing great, thanks! How about you?',
    timestamp: '10:32 AM'
  },
  {
    id: '3',
    sender: 'them',
    text: 'Pretty good! I saw you like photography. Do you have any favorite spots in the city?',
    timestamp: '10:33 AM'
  },
  {
    id: '4',
    sender: 'me',
    text: 'Yes! I love going to the waterfront during golden hour. The light is just perfect.',
    timestamp: '10:35 AM'
  }
];

import mockChats from './chatData';

export function ChatView({ chatId, chat, onBack, onUnmatch, onDeleteConversation, onSendMessage, onBlock }: ChatViewProps) {
  const initialMessages = chat?.messages ?? mockMessages;
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showUnmatchDialog, setShowUnmatchDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  const chatPartner = chat ?? mockChats.find((c) => c.id === chatId) ?? {
    name: 'Unknown',
    image: 'https://via.placeholder.com/150'
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      const message = {
        id: String(Date.now()),
        sender: 'me' as const,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };
  setMessages((prev: any) => [...prev, message]);
      if (onSendMessage) onSendMessage(chatId, message.text);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
      {/* Header */}
  <div className="backdrop-blur-xl bg-white/80 border-b border-[#8B4513]/10 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-foreground hover:text-[#DC143C] transition-colors">
          <ArrowLeft size={24} />
        </button>
        
        <img
          src={chatPartner.image}
          alt={chatPartner.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        
  <h2 className="text-foreground flex-1">{chatPartner.name}</h2>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-foreground hover:text-[#DC143C] transition-colors">
              <MoreVertical size={24} />
            </button>
          </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/90 backdrop-blur-xl border-white/20 text-white">
            <DropdownMenuItem
              onClick={() => setShowReportDialog(true)}
              className="hover:bg-white/10 cursor-pointer"
            >
              Report
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowBlockDialog(true)}
              className="hover:bg-white/10 cursor-pointer text-red-400"
            >
              Block
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowUnmatchDialog(true)}
              className="hover:bg-white/10 cursor-pointer text-red-400"
            >
              Unmatch
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="hover:bg-white/10 cursor-pointer"
            >
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
  {messages.map((message: any, index: number) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] ${message.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.sender === 'me'
                    ? 'bg-gradient-to-r from-[#DC143C] to-[#FF8C00] text-white'
                    : 'bg-white text-foreground border border-[#8B4513]/10'
                }`}
              >
                <p>{message.text}</p>
              </div>
              <span className="text-muted-foreground text-xs px-2">{message.timestamp}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="backdrop-blur-xl bg-white/5 border-t border-white/10 p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 backdrop-blur-xl border border-[#8B4513] text-black placeholder:text-gray-400 rounded-2xl"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl px-6 disabled:opacity-50"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <AlertDialogContent className="bg-black/90 backdrop-blur-xl border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Report User</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to report this user? This will help us maintain a safe community.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white">
              Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unmatch Dialog */}
      <AlertDialog open={showUnmatchDialog} onOpenChange={setShowUnmatchDialog}>
        <AlertDialogContent className="bg-black/90 backdrop-blur-xl border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Unmatch with {chatPartner.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will remove your match and you won't be able to message each other anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-black hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={() => { if (onUnmatch) onUnmatch(chatId); setShowUnmatchDialog(false); onBack(); }}>
              Unmatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent className="bg-black/90 backdrop-blur-xl border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Block {chatPartner.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              They will be unmatched and all data will be deleted. You will not be able to read their messages nor send messages to them until you unblock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-black hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={() => {
              if (onBlock) onBlock(chatId, chatPartner.name, chatPartner);
              setShowBlockDialog(false);
              onBack();
            }}>
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Conversation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-black/90 backdrop-blur-xl border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will permanently delete this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-black hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={() => { if (onDeleteConversation) onDeleteConversation(chatId); setShowDeleteDialog(false); setMessages([]); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
