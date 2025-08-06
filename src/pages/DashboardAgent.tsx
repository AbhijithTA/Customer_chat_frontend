import { useEffect, useState } from 'react';
import ChatBox from '../components/ChatBox';
import api from '../api/axios';
import Navbar from '../components/Navbar';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  const token = localStorage.getItem('token');

  const fetchTickets = async () => {
    try {
      setError(null);
      const res = await api.get('/tickets/assigned');
      setTickets(res.data.tickets);
    } catch (err) {
      console.error('Error fetching assigned tickets:', err);
      setError('Failed to fetch assigned tickets. Please try again.');
    }
  };

  const updateStatus = async (ticketId: string, status: string) => {
    setUpdatingStatus(prev => new Set(prev).add(ticketId));
    try {
      await api.put(`/tickets/${ticketId}/status`, { status });
      await fetchTickets(); 
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setError('Failed to update ticket status. Please try again.');
    } finally {
      setUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(ticketId);
        return newSet;
      });
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
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      case 'in-progress':
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
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return '📋';
      case 'in-progress':
        return '⚡';
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
            <p className="text-gray-400 text-lg">Loading your assigned tickets...</p>
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
    
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🛠️</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Agent Dashboard
            </h1>
          </div>
          <p className="text-gray-400 ml-13">Manage your assigned support tickets</p>
        </div>

    
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

  
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400">📋</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{tickets.length}</p>
                <p className="text-sm text-gray-400">Assigned Tickets</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400">⚡</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {tickets.filter(t => t.status === 'in-progress').length}
                </p>
                <p className="text-sm text-gray-400">In Progress</p>
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
                  {tickets.filter(t => t.priority === 'high').length}
                </p>
                <p className="text-sm text-gray-400">High Priority</p>
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
                  {tickets.filter(t => t.status === 'resolved').length}
                </p>
                <p className="text-sm text-gray-400">Resolved Today</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span>🎫</span>
            Your Assigned Tickets
            {tickets.length > 0 && (
              <span className="text-sm text-gray-400 font-normal">({tickets.length} total)</span>
            )}
          </h2>

          {tickets.length === 0 ? (
            <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Tickets Assigned</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                You don't have any tickets assigned to you at the moment. Check back later or contact your admin if you expect to have tickets assigned.
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

        
                  <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Ticket ID</p>
                    <p className="text-sm font-mono text-gray-300">#{ticket._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setActiveChat(ticket._id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <span>💬</span>
                      Open Chat
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(ticket._id, 'resolved')}
                        disabled={updatingStatus.has(ticket._id) || ticket.status === 'resolved'}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {updatingStatus.has(ticket._id) ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <span>✅</span>
                        )}
                        Resolve
                      </button>
                      
                      <button
                        onClick={() => updateStatus(ticket._id, 'closed')}
                        disabled={updatingStatus.has(ticket._id) || ticket.status === 'closed'}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {updatingStatus.has(ticket._id) ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <span>🔒</span>
                        )}
                        Close
                      </button>
                    </div>

        
                    {ticket.status === 'open' && (
                      <button
                        onClick={() => updateStatus(ticket._id, 'in-progress')}
                        disabled={updatingStatus.has(ticket._id)}
                        className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {updatingStatus.has(ticket._id) ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <span>⚡</span>
                        )}
                        Start Working
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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