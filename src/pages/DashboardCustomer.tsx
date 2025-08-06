import { useEffect, useState } from 'react';
import axios from 'axios';
import ChatBox from '../components/ChatBox';
import api from '../api/axios';

type Ticket = {
  _id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
};

export default function DashboardCustomer() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '', priority: 'medium' });
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets/my');
      setTickets(res.data.tickets);
    } catch (err) {
      console.error('Failed to load tickets', err);
    }
  };

  const handleCreate = async () => {
    if (!newTicket.subject || !newTicket.message) return;
    try {
      await api.post('/tickets', newTicket);
      setNewTicket({ subject: '', message: '', priority: 'medium' });
      fetchTickets();
    } catch (err) {
      console.error('Failed to create ticket', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">🎫 My Support Tickets</h1>

      {/* New Ticket Form */}
      <div className="bg-zinc-800 p-4 rounded-md text-white mb-6 max-w-xl">
        <h2 className="text-lg font-bold mb-2">Create Ticket</h2>
        <input
          type="text"
          placeholder="Subject"
          value={newTicket.subject}
          onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
          className="w-full px-3 py-2 rounded bg-zinc-700 text-white mb-2"
        />
        <textarea
          placeholder="Message"
          value={newTicket.message}
          onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
          className="w-full px-3 py-2 rounded bg-zinc-700 text-white mb-2"
        />
        <select
          value={newTicket.priority}
          onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
          className="w-full px-3 py-2 rounded bg-zinc-700 text-white mb-2"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          onClick={handleCreate}
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-md"
        >
          Create
        </button>
      </div>

      {/* Ticket List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map((ticket) => (
          <div key={ticket._id} className="bg-zinc-800 text-white p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-1">{ticket.subject}</h3>
            <p className="text-sm mb-1">Status: {ticket.status}</p>
            <p className="text-sm mb-2">Priority: {ticket.priority}</p>
            <button
              onClick={() => setActiveChat(ticket._id)}
              className="bg-yellow-500 text-black px-4 py-1 rounded-md text-sm"
            >
              Chat
            </button>
          </div>
        ))}
      </div>

     
      {activeChat && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-2">💬 Chat for Ticket</h2>
          <ChatBox ticketId={activeChat} />
        </div>
      )}
    </div>
  );
}
