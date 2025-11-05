import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MoreVertical, Send, Check, Loader2 } from 'lucide-react';
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
  onReport?: (id: string, name?: string, reasons?: string[], notes?: string, chat?: any) => void;
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

type Message = {
  id: string;
  localId?: string;
  sender: 'me' | 'them';
  text: string;
  timestamp?: string; // ISO string
  sentAt?: number | null;
  deliveredAt?: number | null;
  readAt?: number | null;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
};

export function ChatView({ chatId, chat, onBack, onUnmatch, onDeleteConversation, onSendMessage, onBlock, onReport }: ChatViewProps) {
  const initialMessages: Message[] = (chat?.messages ?? mockMessages).map((m: any) => ({
    id: m.id,
    sender: m.sender,
    text: m.text,
    timestamp: m.timestamp ?? new Date().toISOString(),
    sentAt: m.sentAt ?? null,
    deliveredAt: m.deliveredAt ?? null,
    readAt: m.readAt ?? null,
    status: m.status ?? (m.sender === 'me' ? 'sent' : undefined),
  }));
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const reportOptions = [
    'Spam',
    'Harassment or hate speech',
    'Inappropriate photos',
    'Fake profile',
    'Other'
  ];
  const [selectedReportReasons, setSelectedReportReasons] = useState<string[]>([]);
  const [reportNotes, setReportNotes] = useState('');

  const toggleReason = (reason: string) => {
    setSelectedReportReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const submitReport = () => {
    // TODO: Replace with API call / reporting flow
    console.log('Report submitted', { chatId, reasons: selectedReportReasons, notes: reportNotes });
    setShowReportDialog(false);
    setSelectedReportReasons([]);
    setReportNotes('');
    // Inform parent (App) so it can persist reported users and block them
    if (typeof onReport === 'function') {
      onReport(chatId, chatPartner.name, selectedReportReasons, reportNotes, chatPartner);
    }
  };
  const [showUnmatchDialog, setShowUnmatchDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  const chatPartner = chat ?? mockChats.find((c) => c.id === chatId) ?? {
    name: 'Unknown',
    image: 'https://via.placeholder.com/150'
  };

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text) return;

    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const now = Date.now();
    const localMessage: Message = {
      id: localId,
      localId,
      sender: 'me',
      text,
      timestamp: new Date(now).toISOString(),
      sentAt: now,
      status: 'sending',
    };

    setMessages((prev) => [...prev, localMessage]);
    setNewMessage('');

    // try to use parent onSendMessage as a potential API hook; treat it as async-friendly
    try {
      if (typeof onSendMessage === 'function') {
        const ack = await Promise.resolve((onSendMessage as any)(chatId, text));
        // ack may contain id, timestamps; reconcile
        setMessages((prev) => prev.map((m) => m.localId === localId ? {
          ...m,
          id: ack?.id ?? m.id,
          localId: undefined,
          status: ack?.status ?? 'sent',
          sentAt: ack?.sentAt ?? m.sentAt,
          deliveredAt: ack?.deliveredAt ?? m.deliveredAt,
          readAt: ack?.readAt ?? m.readAt,
        } : m));
      } else {
        // no backend — simulate short ack delay
        setTimeout(() => {
          setMessages((prev) => prev.map((m) => m.localId === localId ? { ...m, status: 'sent' } : m));
        }, 350);
      }
    } catch (err) {
      console.error('send failed', err);
      // keep as sending or set a failed flag in future
    }
  };

  // helpers to mark delivered/read
  const markMessageDelivered = (messageId: string, ts: number = Date.now()) => {
    setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, deliveredAt: ts, status: m.status === 'read' ? 'read' : 'delivered' } : m));
  };
  const markMessageRead = (messageId: string, ts: number = Date.now()) => {
    setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, readAt: ts, deliveredAt: m.deliveredAt ?? ts, status: 'read' } : m));
  };

  // expose simple window helpers for manual testing without backend
  useEffect(() => {
    (window as any).mockDeliverMessage = (id: string) => markMessageDelivered(id);
    (window as any).mockReadMessage = (id: string) => markMessageRead(id);
    return () => {
      delete (window as any).mockDeliverMessage;
      delete (window as any).mockReadMessage;
    };
  }, []);

  // use storage events to simulate cross-tab realtime for mock helpers
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith('mock.delivered.')) {
        const id = e.key.replace('mock.delivered.', '');
        markMessageDelivered(id, Number(e.newValue) || Date.now());
      }
      if (e.key.startsWith('mock.read.')) {
        const id = e.key.replace('mock.read.', '');
        markMessageRead(id, Number(e.newValue) || Date.now());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Minimal Socket handler (Socket.IO-like) — safe no-op if no socket provided
  useEffect(() => {
    // expect a Socket.IO client attached to window.appSocket or similar
    const socket = (window as any).appSocket as any | undefined;
    if (!socket || typeof socket.on !== 'function') return;

    const onAck = (payload: any) => {
      // payload: { tempId, id, sentAt, status }
      const { tempId, id, sentAt, status, deliveredAt, readAt } = payload || {};
      if (!tempId) return;
      setMessages((prev) => prev.map((m) => m.localId === tempId ? {
        ...m,
        id: id ?? m.id,
        localId: undefined,
        status: status ?? 'sent',
        sentAt: sentAt ?? m.sentAt,
        deliveredAt: deliveredAt ?? m.deliveredAt,
        readAt: readAt ?? m.readAt,
      } : m));
    };

    const onDelivered = (payload: any) => {
      // payload: { id, deliveredAt }
      if (!payload?.id) return;
      markMessageDelivered(payload.id, payload.deliveredAt || Date.now());
    };

    const onRead = (payload: any) => {
      // payload: { id, readAt }
      if (!payload?.id) return;
      markMessageRead(payload.id, payload.readAt || Date.now());
    };

    socket.on('message.ack', onAck);
    socket.on('message.delivered', onDelivered);
    socket.on('message.read', onRead);

    return () => {
      try {
        socket.off('message.ack', onAck);
        socket.off('message.delivered', onDelivered);
        socket.off('message.read', onRead);
      } catch (e) {
        // ignore
      }
    };
  }, [setMessages]);

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
                {message.sender === 'me' && (
                  <div className="mt-1 flex items-center justify-end gap-2 text-xs">
                    {message.status === 'sending' && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    {message.status === 'sent' && <Check className="w-4 h-4 text-gray-400" />}
                    {message.status === 'delivered' && <Check className="w-4 h-4 text-gray-400" />}
                    {message.status === 'read' && <Check className="w-4 h-4 text-red-500" />}
                    <div className="text-muted-foreground ml-1">
                      {message.readAt ? `Read ${new Date(message.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
                        message.deliveredAt ? `Delivered ${new Date(message.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
                        message.sentAt ? `Sent ${new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-muted-foreground text-xs px-2">{message.sender === 'them' ? new Date(message.timestamp ?? '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
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

          <div className="px-4 pb-4">
            <div className="space-y-2">
              {reportOptions.map(option => (
                <label key={option} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedReportReasons.includes(option)}
                    onChange={() => toggleReason(option)}
                    className="w-4 h-4 accent-[#DC143C] rounded"
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>

            <textarea
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="Additional details (optional)"
              className="mt-3 w-full min-h-[80px] p-2 rounded-md bg-white/5 border border-white/10 text-white resize-vertical"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-black hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
              onClick={submitReport}
              disabled={selectedReportReasons.length === 0}
            >
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
