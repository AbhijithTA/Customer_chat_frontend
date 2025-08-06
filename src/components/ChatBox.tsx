import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);


  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initializing the  chat connection
  useEffect(() => {
    let fetched = false;

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError(null);

        socket.emit('joinRoom', ticketId);
        setConnectionStatus('connected');

        const res = await api.get(`/messages/${ticketId}`);
        const incoming: MessageType[] = res.data;
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const uniqueIncoming = incoming.filter((msg) => !existingIds.has(msg._id));
          return [...prev, ...uniqueIncoming];
        });


        fetched = true;
      } catch (err) {
        console.error('Failed to load messages', err);
        setError('Failed to load chat messages. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    const handleIncoming = (msg: MessageType) => {
      if (!fetched || msg.ticketId !== ticketId) return;

      setMessages(prev => {
        const exists = prev.some(m => m._id === msg._id);
        return exists ? prev : [...prev, msg];
      });
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

    const handleTyping = (data: { userId: string; name: string }) => {
      if (data.userId !== user?._id && !typingUsers.includes(data.name)) {
        setTypingUsers(prev => [...prev, data.name]);
      }
    };

    const handleStopTyping = (data: { userId: string; name: string }) => {
      setTypingUsers(prev => prev.filter(name => name !== data.name));
    };

    socket.on('newMessage', handleIncoming);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);

    return () => {
      socket.emit('leaveRoom', ticketId);
      socket.off('newMessage', handleIncoming);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [ticketId]);

  // Handle typing indicators
  useEffect(() => {
    if (!user?._id || !user?.name) return;

    if (isTyping) {
      socket.emit('typing', { ticketId, userId: user._id, name: user.name });
    } else {
      socket.emit('stopTyping', { ticketId, userId: user._id, name: user.name });
    }
  }, [isTyping, ticketId, user?._id, user?.name]);


  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setSending(true);
    setIsTyping(false);

    try {
      const res = await api.post('/messages', { ticketId, message: messageText });

      // ✅ Don't manually add to messages here!
      socket.emit('sendMessage', res.data);

      setNewMessage('');
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message', err);
      setError('Failed to send message. Please try again.');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Support Ticket Chat</h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' :
              connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
            <span className="text-sm capitalize">{connectionStatus}</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-auto bg-white">
        <div className="space-y-3">
          {messages.map((msg) => {
            const isOwn = user?._id?.toString() === msg.sender._id?.toString();

            return (
              <div
                key={msg._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${isOwn
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold">{msg.sender.name}</span>
                    <span className="text-xs opacity-80 ml-2">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.message}</p>

                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-500 italic">
              {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-gray-50">
        {error && (
          <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            placeholder="Type your message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={sending || connectionStatus !== 'connected'}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending || connectionStatus !== 'connected'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg disabled:bg-gray-400"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;