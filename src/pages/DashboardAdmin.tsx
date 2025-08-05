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
  user?: { name: string };
  assignedTo?: { _id: string; name: string };
};

type Agent = {
  _id: string;
  name: string;
};

export default function DashboardAdmin() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets/all');
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get('/users?role=agent');
      setAgents(res.data);
    } catch (err) {
      console.error('Failed to fetch agents', err);
    }
  };

  const assignTicket = async (ticketId: string, agentId: string) => {
    try {
     await api.post('/tickets/assign', { ticketId, agentId });
      fetchTickets(); // Refresh
    } catch (err) {
      console.error('Failed to assign ticket', err);
    }
  };

  const updateStatus = async (ticketId: string, status: string) => {
    try {
      await api.put(`/tickets/${ticketId}/status`, { status });
      fetchTickets();
    } catch (err) {
      console.error('Failed to update ticket status', err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchAgents();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">👑 Admin Dashboard</h1>

      {/* All Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map((ticket) => (
          <div key={ticket._id} className="bg-zinc-800 text-white p-4 rounded-md">
            <h3 className="text-lg font-bold">{ticket.subject}</h3>
            <p className="text-sm">From: {ticket.user?.name || 'Unknown'}</p>
            <p className="text-sm">Priority: {ticket.priority}</p>
            <p className="text-sm">Status: {ticket.status}</p>
            <p className="text-sm mb-2">
              Assigned To: {ticket.assignedTo?.name || 'Not Assigned'}
            </p>

            {/* Assign Dropdown */}
            <select
              onChange={(e) => assignTicket(ticket._id, e.target.value)}
              className="bg-zinc-700 text-white px-3 py-2 rounded w-full mb-2"
              defaultValue=""
            >
              <option value="" disabled>
                Assign to agent
              </option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
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
                Resolve
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

      {/* Chat */}
      {activeChat && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-2">💬 Chat for Ticket</h2>
          <ChatBox ticketId={activeChat} />
        </div>
      )}
    </div>
  );
}
