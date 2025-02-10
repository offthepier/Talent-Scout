import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Calendar, X } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { supabaseClient } from '../lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  attachment_url?: string;
  created_at: string;
}

interface ChatSystemProps {
  receiverId: string;
  receiverName: string;
}

export function ChatSystem({ receiverId, receiverName }: ChatSystemProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showTrialForm, setShowTrialForm] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const channel = supabaseClient.supabase
      .channel('chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id},receiver_id=eq.${receiverId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    // Load existing messages
    loadMessages();

    return () => {
      channel.unsubscribe();
    };
  }, [user, receiverId]);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data } = await supabaseClient.supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    try {
      const { data, error } = await supabaseClient.supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: receiverId,
            content: newMessage.trim()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setMessages((prev) => [...prev, data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-[600px] glass rounded-2xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{receiverName}</h3>
          <p className="text-sm text-white/60">Online</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTrialForm(true)}
          className="px-4 py-2 bg-[#FF3366] text-white rounded-lg flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Schedule Trial
        </motion.button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/60">Loading messages...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.sender_id === user?.id
                    ? 'bg-[#FF3366] text-white'
                    : 'bg-white/10 text-white'
                }`}
              >
                <p>{message.content}</p>
                {message.attachment_url && (
                  <a
                    href={message.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/80 hover:text-white flex items-center gap-1 mt-1"
                  >
                    <Paperclip className="w-3 h-3" />
                    Attachment
                  </a>
                )}
                <span className="text-xs text-white/60 block mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </motion.div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!newMessage.trim()}
            className="p-2 bg-[#FF3366] text-white rounded-lg disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </form>

      {/* Trial Booking Form */}
      <AnimatePresence>
        {showTrialForm && (
          <TrialBookingForm
            playerId={receiverId}
            playerName={receiverName}
            onClose={() => setShowTrialForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface TrialBookingFormProps {
  playerId: string;
  playerName: string;
  onClose: () => void;
}

function TrialBookingForm({ playerId, playerName, onClose }: TrialBookingFormProps) {
  const { user } = useAuthStore();
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabaseClient.supabase
        .from('trials')
        .insert([
          {
            scout_id: user.id,
            player_id: playerId,
            trial_date: `${date}T${time}`,
            location,
            notes,
            status: 'pending'
          }
        ]);

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error booking trial:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="w-full max-w-md bg-[#0A1128] p-6 rounded-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Schedule Trial</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="Enter trial location"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional notes..."
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-[#FF3366] text-white rounded-lg hover:bg-[#FF6B6B] transition-colors disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Schedule Trial'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}