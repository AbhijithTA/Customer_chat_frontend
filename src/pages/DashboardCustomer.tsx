import { useEffect, useState } from 'react';
import ChatBox from '../components/ChatBox';
import api from '../api/axios';
import Navbar from '../components/Navbar';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  

  const fetchTickets = async () => {
    try {
      setError(null);
      const res = await api.get('/tickets/my');
      setTickets(res.data.tickets);
    } catch (err) {
      console.error('Failed to load tickets', err);
      setError('Failed to load your tickets. Please try again.');
    }
  };

  const handleCreate = async () => {
    if (!newTicket.subject || !newTicket.message) {
      setValidationError('Please fill in both subject and message fields.');
      return;
    }

    setCreating(true);
    setValidationError(null);
    
    try {
      await api.post('/tickets', newTicket);
      setNewTicket({ subject: '', message: '', priority: 'medium' });
      await fetchTickets();
    } catch (err) {
      console.error('Failed to create ticket', err);
      setError('Failed to create ticket. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'low':
        return 'text-green-400 bg-green-900/20 border-green-500/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'new':
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      case 'in-progress':
      case 'assigned':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'resolved':
        return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'closed':
        return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '🔥';
      case 'medium':
        return '⚡';
      case 'low':
        return '💚';
      default:
        return '⚪';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'new':
        return '🆕';
      case 'in-progress':
      case 'assigned':
        return '⚙️';
      case 'resolved':
        return '✅';
      case 'closed':
        return '🔒';
      default:
        return '📄';
    }
  };

  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      await fetchTickets();
      setLoading(false);
    };
    
    loadTickets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 text-lg">Loading your support tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🎫</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              My Support Tickets
            </h1>
          </div>
          <p className="text-gray-400 ml-13">Create and manage your support requests</p>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-400">⚠️</span>
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {validationError && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">⚠️</span>
              <p className="text-yellow-400">{validationError}</p>
              <button
                onClick={() => setValidationError(null)}
                className="ml-auto text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400">📋</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{tickets.length}</p>
                <p className="text-sm text-gray-400">Total Tickets</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400">⚙️</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {tickets.filter(t => t.status.toLowerCase() === 'in-progress' || t.status.toLowerCase() === 'assigned').length}
                </p>
                <p className="text-sm text-gray-400">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-green-400">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {tickets.filter(t => t.status.toLowerCase() === 'resolved').length}
                </p>
                <p className="text-sm text-gray-400">Resolved</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-red-400">🔥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {tickets.filter(t => t.priority.toLowerCase() === 'high').length}
                </p>
                <p className="text-sm text-gray-400">High Priority</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Ticket Form */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✍️</span>
            <h2 className="text-xl font-semibold text-white">Create New Ticket</h2>
          </div>
          
          <div className="max-w-2xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject *
              </label>
              <input
                type="text"
                placeholder="Brief description of your issue"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                disabled={creating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                placeholder="Please provide detailed information about your issue"
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                disabled={creating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority Level
              </label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                disabled={creating}
              >
                <option value="low">🟢 Low - General inquiry</option>
                <option value="medium">⚡ Medium - Standard support</option>
                <option value="high">🔥 High - Urgent issue</option>
              </select>
            </div>

            <button
              onClick={handleCreate}
              disabled={creating || !newTicket.subject.trim() || !newTicket.message.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              {creating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Creating Ticket...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Create Ticket
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span>📨</span>
            Your Support Tickets
            {tickets.length > 0 && (
              <span className="text-sm text-gray-400 font-normal">({tickets.length} total)</span>
            )}
          </h2>

          {tickets.length === 0 ? (
            <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📪</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Support Tickets Yet</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                You haven't created any support tickets yet. Use the form above to create your first ticket and get help from our support team.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-200">
                  {/* Ticket Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white pr-4 line-clamp-2">
                      {ticket.subject}
                    </h3>
                    <div className="flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)} whitespace-nowrap flex items-center gap-1`}>
                        <span>{getPriorityIcon(ticket.priority)}</span>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)} whitespace-nowrap flex items-center gap-1`}>
                        <span>{getStatusIcon(ticket.status)}</span>
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  {/* Ticket ID */}
                  <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Ticket ID</p>
                    <p className="text-sm font-mono text-gray-300">#{ticket._id.slice(-8).toUpperCase()}</p>
                  </div>

                  {/* Message Preview */}
                  <div className="mb-4 p-3 bg-slate-700/20 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Message</p>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {ticket.message}
                    </p>
                  </div>

                  {/* Chat Button */}
                  <button
                    onClick={() => setActiveChat(ticket._id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>💬</span>
                    Open Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Section */}
        {activeChat && (
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <span>💬</span>
                Chat for Ticket
                <span className="text-sm text-gray-400 font-normal">
                  #{activeChat.slice(-8).toUpperCase()}
                </span>
              </h2>
              <button
                onClick={() => setActiveChat(null)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <ChatBox ticketId={activeChat} />
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}