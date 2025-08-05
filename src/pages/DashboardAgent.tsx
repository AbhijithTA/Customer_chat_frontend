import { useEffect, useState } from 'react';
import axios from 'axios';
import ChatBox from '../components/ChatBox';
import api from '../api/axios';

type Ticket = {
  _id: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
};

export default function DashboardAgent() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets/assigned');
      setTickets(res.data);
    } catch (err) {
      console.error('Error fetching assigned tickets:', err);
    }
  };

  const updateStatus = async (ticketId: string, status: string) => {
    try {
     await api.put(`/tickets/${ticketId}/status`, { status });
      fetchTickets(); 
    } catch (err) {
      console.error('Error updating ticket status:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">🛠️ Agent Dashboard</h1>

      {/* Ticket List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map((ticket) => (
          <div key={ticket._id} className="bg-zinc-800 text-white p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-1">{ticket.subject}</h3>
            <p className="text-sm mb-1">Status: {ticket.status}</p>
            <p className="text-sm mb-2">Priority: {ticket.priority}</p>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setActiveChat(ticket._id)}
                className="bg-yellow-500 text-black px-3 py-1 rounded-md text-sm"
              >
                Chat
              </button>
              <button
                onClick={() => updateStatus(ticket._id, 'resolved')}
                className="bg-green-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => updateStatus(ticket._id, 'closed')}
                className="bg-red-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Box */}
      {activeChat && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-2">💬 Chat for Ticket</h2>
          <ChatBox ticketId={activeChat} />
        </div>
      )}
    </div>
  );
}
