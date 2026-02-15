import { useState, useEffect } from "react";
import client from "../Config/config";
import { toast, Toaster } from 'react-hot-toast';

export default function Complaint() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, in-progress, resolved
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  // Categories for complaints
  const categories = [
    'Internet',
    'Electricity',
    'Water',
    'Maintenance',
    'Cleanliness',
    'Security',
    'Harassment',
    'Teacher Complaint',
    'Classroom Issue',
    'Lab Issue',
    'Library Issue',
    'Canteen',
    'Transport',
    'Other'
  ];

  useEffect(() => {
    getUser();
    fetchComplaints();
  }, []);

  // Get current user
  const getUser = async () => {
    const { data } = await client.auth.getUser();
    setUser(data.user);
  };

  // Fetch all complaints
  const fetchComplaints = async () => {
    const { data } = await client
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });
    
    setComplaints(data || []);
    calculateStats(data || []);
  };

  // Calculate statistics
  const calculateStats = (data) => {
    setStats({
      total: data.length,
      pending: data.filter(c => c.status === 'submitted' || c.status === 'pending').length,
      inProgress: data.filter(c => c.status === 'in-progress').length,
      resolved: data.filter(c => c.status === 'resolved').length
    });
  };

  // Submit new complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!category || !description) {
      toast.error("Please select category and write description!");
      return;
    }
    
    if (!user) {
      toast.error("Please login first!");
      return;
    }

    if (description.length < 10) {
      toast.error("Description must be at least 10 characters!");
      return;
    }

    setLoading(true);

    const { error } = await client
      .from("complaints")
      .insert([
        { 
          category, 
          description, 
          status: "submitted",
          user_id: user.id,
          created_at: new Date().toISOString()
        },
      ]);

    if (error) {
      console.log(error);
      toast.error("Error submitting complaint!");
      setLoading(false);
      return;
    }

    toast.success("Complaint submitted successfully!");
    setCategory("");
    setDescription("");
    fetchComplaints();
    setLoading(false);
  };

  // Update complaint status (for admins)
  const updateStatus = async (complaintId, newStatus) => {
    if (!user?.email?.includes('admin')) {
      toast.error("Only admins can update status!");
      return;
    }

    const { error } = await client
      .from("complaints")
      .update({ status: newStatus })
      .eq("id", complaintId);

    if (!error) {
      toast.success(`Status updated to ${newStatus}`);
      fetchComplaints();
    }
  };

  // Delete complaint (admin only)
  const deleteComplaint = async (complaintId) => {
    if (!user?.email?.includes('admin')) {
      toast.error("Only admins can delete complaints!");
      return;
    }

    if (window.confirm("Are you sure you want to delete this complaint?")) {
      const { error } = await client
        .from("complaints")
        .delete()
        .eq("id", complaintId);

      if (!error) {
        toast.success("Complaint deleted!");
        fetchComplaints();
      }
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    // Status filter
    if (filter === "pending" && c.status !== "submitted" && c.status !== "pending") return false;
    if (filter === "in-progress" && c.status !== "in-progress") return false;
    if (filter === "resolved" && c.status !== "resolved") return false;
    
    // Category filter
    if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
    
    return true;
  });

  // Get status badge color
  const getStatusBadge = (status) => {
    switch(status) {
      case 'submitted':
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">⏳ Pending</span>;
      case 'in-progress':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">🔄 In Progress</span>;
      case 'resolved':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">✅ Resolved</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  // Get time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-block p-4 bg-white rounded-full shadow-xl mb-4">
            <img 
              src="/saylani-logo.png" 
              width="80" 
              alt="Saylani Logo" 
              className="hover:scale-110 transition-transform duration-300"
            />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#66b032] to-[#0057a8] bg-clip-text text-transparent">
            Saylani Complaint Portal
          </h1>
          <p className="text-gray-600 text-lg">
            Submit and track your complaints easily 📝
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#66b032] hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm mb-1">Total Complaints</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm mb-1">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm mb-1">Resolved</p>
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 
                         focus:ring-2 focus:ring-[#66b032] focus:border-transparent 
                         outline-none bg-white"
              >
                <option value="all">📋 All Complaints</option>
                <option value="pending">⏳ Pending</option>
                <option value="in-progress">🔄 In Progress</option>
                <option value="resolved">✅ Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 
                         focus:ring-2 focus:ring-[#66b032] focus:border-transparent 
                         outline-none bg-white"
              >
                <option value="all">🏷️ All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Complaint Form - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6 border-2 border-transparent hover:border-[#66b032] transition-all duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-8 bg-[#66b032] rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-800">New Complaint</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 
                             focus:ring-2 focus:ring-[#66b032] focus:border-transparent 
                             outline-none transition-all bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows="6"
                    placeholder="Please describe your complaint in detail..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 
                             focus:ring-2 focus:ring-[#66b032] focus:border-transparent 
                             outline-none transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {description.length} / 500 characters
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-[#66b032] to-[#66b032]/80 
                           text-white rounded-lg font-semibold hover:shadow-lg 
                           disabled:opacity-50 disabled:cursor-not-allowed 
                           transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span>📝</span>
                      Submit Complaint
                    </>
                  )}
                </button>
              </form>

              {/* Quick Tips */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>💡</span>
                  Quick Tips
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#66b032]">•</span>
                    Be specific in description
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#66b032]">•</span>
                    Mention exact location if applicable
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#66b032]">•</span>
                    You'll be notified on status change
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Complaints List - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-8 bg-[#0057a8] rounded-full"></span>
                Complaints
              </h2>
              <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                {filteredComplaints.length} complaints
              </span>
            </div>

            {filteredComplaints.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-7xl mb-6">📭</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                  No Complaints Found
                </h3>
                <p className="text-gray-500">
                  {filter !== "all" || categoryFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Be the first to submit a complaint!"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map((complaint, index) => (
                  <div
                    key={complaint.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl 
                             hover:-translate-y-0.5 transition-all duration-300
                             border-l-4 animate-slide-in"
                    style={{ 
                      borderLeftColor: 
                        complaint.status === 'resolved' ? '#66b032' :
                        complaint.status === 'in-progress' ? '#0057a8' : '#f59e0b',
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header with status and category */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {getStatusBadge(complaint.status)}
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            {complaint.category}
                          </span>
                          <span className="text-sm text-gray-400">
                            {getTimeAgo(complaint.created_at)}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                          {complaint.description}
                        </p>

                        {/* Footer with user info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>👤</span>
                            <span>ID: {complaint.user_id?.slice(0, 8)}...</span>
                            <span>📅</span>
                            <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                          </div>

                          {/* Admin Actions */}
                          {user?.email?.includes('admin') && (
                            <div className="flex items-center gap-2">
                              <select
                                onChange={(e) => updateStatus(complaint.id, e.target.value)}
                                value={complaint.status}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-lg 
                                         focus:ring-2 focus:ring-[#66b032] focus:border-transparent 
                                         outline-none"
                              >
                                <option value="submitted">⏳ Pending</option>
                                <option value="in-progress">🔄 In Progress</option>
                                <option value="resolved">✅ Resolved</option>
                              </select>
                              
                              <button
                                onClick={() => deleteComplaint(complaint.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Show user their own complaints */}
                        {complaint.user_id === user?.id && !user?.email?.includes('admin') && (
                          <div className="mt-3 text-xs text-gray-400">
                            Your complaint • Status: {complaint.status}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Your Complaints Section (for regular users) */}
        {user && !user?.email?.includes('admin') && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#66b032] rounded-full"></span>
              Your Complaints
            </h3>
            
            {complaints.filter(c => c.user_id === user.id).length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                You haven't submitted any complaints yet.
              </p>
            ) : (
              <div className="space-y-3">
                {complaints
                  .filter(c => c.user_id === user.id)
                  .map(complaint => (
                    <div key={complaint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-700">{complaint.category}</p>
                        <p className="text-sm text-gray-500">{complaint.description.substring(0, 50)}...</p>
                      </div>
                      {getStatusBadge(complaint.status)}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slideDown 0.5s ease-out;
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
