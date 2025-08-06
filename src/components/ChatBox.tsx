import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';
import api from '../api/axios';

type MessageType = {
  _id: string;
  ticketId: string;
  sender: {
    _id: string;
    name: string;
    role: string;
  };
  message: string;
  createdAt: string;
  tempId?: string; // For optimistic updates
};

type ChatBoxProps = {
  ticketId: string;
};

const ChatBox = ({ ticketId }: ChatBoxProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isInitialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Prevent duplicate initialization
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Join the room first
        socket.emit('joinRoom', ticketId);
        setConnectionStatus('connected');

        // Fetch existing messages
        const res = await api.get(`/messages/${ticketId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load messages', err);
        setError('Failed to load chat messages. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    const handleIncoming = (msg: MessageType) => {
      // Only add if it's for this ticket and not from current user (to avoid self-duplicates)
      if (msg.ticketId === ticketId && msg.sender._id !== user?._id) {
        setMessages(prev => {
          // Check if message already exists by _id only (not tempId to avoid conflicts)
          const exists = prev.some(m => m._id === msg._id);
          return exists ? prev : [...prev, msg];
        });
      }
    };

    const handleConnect = () => {
      setConnectionStatus('connected');
      setError(null);
      socket.emit('joinRoom', ticketId);
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    const handleConnectError = () => {
      setConnectionStatus('disconnected');
      setError('Connection lost. Attempting to reconnect...');
    };

    socket.on('newMessage', handleIncoming);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      isInitialized.current = false;
      socket.emit('leaveRoom', ticketId);
      socket.off('newMessage', handleIncoming);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [ticketId, user?._id]); // Added user._id dependency

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setSending(true);
    
    // Create temporary message for optimistic update
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMessage: MessageType = {
      _id: tempId,
      tempId,
      ticketId,
      sender: {
        _id: user?._id || '',
        name: user?.name || 'You',
        role: user?.role || 'customer'
      },
      message: messageText,
      createdAt: new Date().toISOString()
    };

    // Optimistically add to UI
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const res = await api.post('/messages', { ticketId, message: messageText });
      
      // Replace temp message with real one
      setMessages(prev => prev.map(m => 
        m.tempId === tempId ? { ...res.data, tempId: undefined } : m
      ));
      
      // Emit to others (socket will handle sending to other users, not back to sender)
      socket.emit('sendMessage', res.data);
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message', err);
      setError('Failed to send message. Please try again.');
      // Remove the optimistic message
      setMessages(prev => prev.filter(m => m.tempId !== tempId));
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'text-purple-400';
      case 'agent':
        return 'text-blue-400';
      case 'customer':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return '👑';
      case 'agent':
        return '🛠️';
      case 'customer':
        return '👤';
      default:
        return '💬';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-400">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  // Sort messages once before rendering
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-slate-700/50 border-b border-slate-600/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <h4 className="font-semibold text-white">Support Chat</h4>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400' : 
              connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
            }`}></div>
            <span className="text-xs text-gray-400 capitalize">{connectionStatus}</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-red-400">⚠️</span>
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="h-80 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        {sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💭</span>
            </div>
            <p className="text-gray-400 mb-2">No messages yet</p>
            <p className="text-gray-500 text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          sortedMessages.map((msg, idx) => {
            const isOwn = user?._id === msg.sender._id;
            const showSender = idx === 0 || sortedMessages[idx - 1].sender._id !== msg.sender._id;
            
            return (
              <div key={msg._id || msg.tempId} className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[80%] gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar - Only show for first message in group */}
                  {showSender && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                      isOwn ? 'bg-blue-500' : 'bg-slate-600'
                    } self-end`}>
                      {getRoleIcon(msg.sender?.role || 'customer')}
                    </div>
                  )}
                  
                  {/* Message Content Container */}
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
                    {/* Sender Name and Time */}
                    {showSender && (
                      <div className={`text-xs mb-1 px-2 flex items-center gap-2 ${
                        isOwn ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <span className={getRoleColor(msg.sender?.role || 'customer')}>
                          {isOwn ? 'You' : msg.sender?.name}
                        </span>
                        <span className="text-gray-500">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`px-4 py-2 rounded-2xl max-w-full break-words ${
                      isOwn
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-slate-700 text-white rounded-bl-md'
                    } ${!showSender ? (isOwn ? 'mr-11' : 'ml-11') : ''}`}>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                        {msg.tempId && (
                          <span className="opacity-50 ml-1">⏳</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Time for grouped messages (shown on hover) */}
                    {!showSender && (
                      <div className={`text-xs text-gray-500 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isOwn ? 'text-right' : 'text-left'
                      } ${!showSender ? (isOwn ? 'mr-11' : 'ml-11') : ''}`}>
                        {formatTime(msg.createdAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-600/50 bg-slate-700/30 p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              className="w-full px-4 py-3 rounded-lg bg-slate-700/70 border border-slate-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700"
              placeholder={connectionStatus === 'connected' ? "Type your message..." : "Connecting..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={sending || connectionStatus !== 'connected'}
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 min-w-[80px] justify-center"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending || connectionStatus !== 'connected'}
          >
            {sending ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <span>🚀</span>
            )}
            {sending ? '' : 'Send'}
          </button>
        </div>
        
        {/* Character count and connection status */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <div>
            {connectionStatus === 'disconnected' && (
              <span className="text-red-400">Disconnected - Messages may not be delivered</span>
            )}
            {connectionStatus === 'connecting' && (
              <span className="text-yellow-400">Reconnecting...</span>
            )}
          </div>
          <div>
            {newMessage.length > 0 && (
              <span className={newMessage.length > 500 ? 'text-red-400' : 'text-gray-400'}>
                {newMessage.length}/1000
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;