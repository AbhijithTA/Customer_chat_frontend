import { useEffect, useState } from 'react';
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

  useEffect(() => {
    socket.emit('joinRoom', ticketId);

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${ticketId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    };

    fetchMessages();

    const handleIncoming = (msg: MessageType) => {
      if (msg.ticketId === ticketId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('newMessage', handleIncoming);

    return () => {
      socket.emit('leaveRoom', ticketId);
      socket.off('newMessage', handleIncoming);
    };
  }, [ticketId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await api.post('/messages', { ticketId, message: newMessage });

      // Add to local state
      setMessages((prev) => [...prev, res.data]);

      // Emit to others
      socket.emit('sendMessage', res.data);

      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-4 mt-4 text-white w-full max-w-xl mx-auto">
      <h4 className="font-semibold text-yellow-400 mb-2">Chat</h4>

      <div className="h-60 overflow-y-auto flex flex-col gap-2 px-2">
        {messages.map((msg, idx) => {
          const isOwn = user && msg.sender?._id === user._id;

          return (
            <div
              key={idx}
              className={`max-w-[75%] p-2 rounded-xl transition-all ${
                isOwn
                  ? 'self-end bg-yellow-400 text-black rounded-br-sm'
                  : 'self-start bg-zinc-700 text-white rounded-bl-sm'
              }`}
            >
              <div className="text-xs opacity-80 mb-1">{msg.sender?.name || 'You'}</div>
              <div className="text-sm leading-snug">{msg.message}</div>
            </div>
          );
        })}
      </div>

      <div className="flex mt-4 gap-2">
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded-md bg-zinc-700 text-white outline-none"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-md text-sm"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
