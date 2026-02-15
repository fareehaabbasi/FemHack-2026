import { useState, useEffect } from "react";
import client from "../Config/config";
import { toast, Toaster } from 'react-hot-toast';
import logp from "../assets/Images/logo.png"

export default function Volunteer() {
  const [name, setName] = useState("");
  const [event, setEvent] = useState("");
  const [availability, setAvailability] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, upcoming, past
  const [eventFilter, setEventFilter] = useState("all");

  // Available events
  const events = [
    'Tech Workshop',
    'Community Outreach',
    'Teaching Assistant',
    'Event Management',
    'Fundraising',
    'Administrative Support',
    'Lab Assistant',
    'Library Helper',
    'Registration Desk',
    'Cleanup Drive',
    'Food Distribution',
    'Other'
  ];

  useEffect(() => {
    getUser();
    fetchVolunteers();
  }, []);

  // Get current user
  const getUser = async () => {
    const { data } = await client.auth.getUser();
    setUser(data.user);
  };

  // Fetch all volunteers
  const fetchVolunteers = async () => {
    const { data } = await client
      .from("volunteer")
      .select("*")
      .order("created_at", { ascending: false });
    
    setVolunteers(data || []);
  };

  // Register as volunteer
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !event || !availability) {
      toast.error("Please fill all fields!");
      return;
    }
    
    if (!user) {
      toast.error("Please login first!");
      return;
    }

    setLoading(true);

    const { error } = await client
      .from("volunteer")
      .insert([
        { 
          name, 
          event, 
          availability,
          user_id: user.id,
          created_at: new Date().toISOString()
        },
      ]);

    if (error) {
      console.log(error);
      toast.error("Error registering as volunteer!");
      setLoading(false);
      return;
    }

    toast.success("Successfully registered as volunteer!");
    setName("");
    setEvent("");
    setAvailability("");
    fetchVolunteers();
    setLoading(false);
  };

  // Delete registration (admin or own)
  const deleteVolunteer = async (volunteerId, userId) => {
    // Allow if admin or the person who registered
    if (!user?.email?.includes('admin') && user?.id !== userId) {
      toast.error("You can only delete your own registration!");
      return;
    }

    if (window.confirm("Are you sure you want to remove this registration?")) {
      const { error } = await client
        .from("volunteer")
        .delete()
        .eq("id", volunteerId);

      if (!error) {
        toast.success("Registration removed!");
        fetchVolunteers();
      }
    }
  };

  // Filter volunteers
  const filteredVolunteers = volunteers.filter(v => {
    // Event filter
    if (eventFilter !== "all" && v.event !== eventFilter) return false;
    
    // Date filter (you can customize this based on your needs)
    if (filter === "upcoming") {
      // You can add date comparison logic here
      return true;
    }
    
    return true;
  });

  // Get event badge color
  const getEventColor = (eventName) => {
    const colors = {
      'Tech Workshop': 'bg-blue-100 text-blue-800',
      'Community Outreach': 'bg-green-100 text-green-800',
      'Teaching Assistant': 'bg-purple-100 text-purple-800',
      'Event Management': 'bg-yellow-100 text-yellow-800',
      'Fundraising': 'bg-pink-100 text-pink-800',
      'Administrative Support': 'bg-gray-100 text-gray-800',
      'Lab Assistant': 'bg-indigo-100 text-indigo-800',
      'Library Helper': 'bg-teal-100 text-teal-800',
      'Registration Desk': 'bg-orange-100 text-orange-800',
      'Cleanup Drive': 'bg-emerald-100 text-emerald-800',
      'Food Distribution': 'bg-rose-100 text-rose-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[eventName] || 'bg-gray-100 text-gray-800';
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
              src={logp}
              width="80" 
              alt="Saylani Logo" 
              className="hover:scale-110 transition-transform duration-300"
            />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#66b032] to-[#0057a8] bg-clip-text text-transparent">
            Saylani Volunteer Program
          </h1>
          <p className="text-gray-600 text-lg">
            Make a difference in your community 🤝
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#66b032] hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm mb-1">Total Volunteers</p>
            <p className="text-3xl font-bold text-gray-800">{volunteers.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm mb-1">This Week</p>
            <p className="text-3xl font-bold text-blue-600">
              {volunteers.filter(v => {
                const date = new Date(v.created_at);
                const now = new Date();
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                return date > weekAgo;
              }).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm mb-1">Events</p>
            <p className="text-3xl font-bold text-purple-600">{events.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm mb-1">Your Registration</p>
            <p className="text-3xl font-bold text-green-600">
              {volunteers.filter(v => v.user_id === user?.id).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Event
              </label>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 
                         focus:ring-2 focus:ring-[#66b032] focus:border-transparent 
                         outline-none bg-white"
              >
                <option value="all">🎯 All Events</option>
                {events.map(event => (
                  <option key={event} value={event}>{event}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 
                         focus:ring-2 focus:ring-[#66b032] focus:border-transparent 
                         outline-none bg-white"
              >
                <option value="all">📅 All Registrations</option>
                <option value="upcoming">⏳ Upcoming</option>
                <option value="past">✅ Past</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6 border-2 border-transparent hover:border-[#66b032] transition-all duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-8 bg-[#66b032] rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-800">Register as Volunteer</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 
                             focus:ring-2 focus:ring-[#66b032] focus:border-transparent 
                             outline-none transition-all"
                  />
                </div>

                {/* Event Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Event <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 
                             focus:ring-2 focus:ring-[#66b032] focus:border-transparent 
                             outline-none transition-all bg-white"
                  >
                    <option value="">Choose an event</option>
                    {events.map(event => (
                      <option key={event} value={event}>{event}</option>
                    ))}
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    required
                    rows="4"
                    placeholder="e.g., Weekends, Monday-Friday 2-5 PM, Specific dates..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 
                             focus:ring-2 focus:ring-[#66b032] focus:border-transparent 
                             outline-none transition-all resize-none"
                  />
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
                      Registering...
                    </>
                  ) : (
                    <>
                      <span>🤝</span>
                      Register Now
                    </>
                  )}
                </button>
              </form>

              {/* Quick Tips */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>💡</span>
                  Why Volunteer?
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#66b032]">•</span>
                    Gain valuable experience
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#66b032]">•</span>
                    Help your community
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#66b032]">•</span>
                    Meet new people
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#66b032]">•</span>
                    Get volunteer certificate
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Volunteers List - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-8 bg-[#0057a8] rounded-full"></span>
                Volunteer Registrations
              </h2>
              <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                {filteredVolunteers.length} volunteers
              </span>
            </div>

            {filteredVolunteers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-7xl mb-6">🤝</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                  No Volunteers Yet
                </h3>
                <p className="text-gray-500">
                  Be the first to register as a volunteer!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVolunteers.map((volunteer, index) => (
                  <div
                    key={volunteer.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl 
                             hover:-translate-y-0.5 transition-all duration-300
                             border-l-4 border-[#66b032] animate-slide-in relative"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Delete button (visible for admin or owner) */}
                    {(user?.email?.includes('admin') || user?.id === volunteer.user_id) && (
                      <button
                        onClick={() => deleteVolunteer(volunteer.id, volunteer.user_id)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 
                                 transition-colors"
                      >
                        🗑️
                      </button>
                    )}

                    {/* Volunteer Info */}
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-r from-[#66b032] to-[#0057a8] 
                                    rounded-full flex items-center justify-center text-white 
                                    text-xl font-bold">
                        {volunteer.name?.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1">
                        {/* Name and Date */}
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {volunteer.name}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {getTimeAgo(volunteer.created_at)}
                          </span>
                        </div>

                        {/* Event Badge */}
                        <div className="mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventColor(volunteer.event)}`}>
                            {volunteer.event}
                          </span>
                        </div>

                        {/* Availability */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">📅 Availability</p>
                          <p className="text-sm text-gray-700">
                            {volunteer.availability}
                          </p>
                        </div>

                        {/* User ID (for admin) */}
                        {user?.email?.includes('admin') && (
                          <p className="text-xs text-gray-400 mt-2">
                            User ID: {volunteer.user_id?.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Your Registration Section */}
        {user && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#66b032] rounded-full"></span>
              Your Volunteer Registrations
            </h3>
            
            {volunteers.filter(v => v.user_id === user.id).length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                You haven't registered for any events yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {volunteers
                  .filter(v => v.user_id === user.id)
                  .map(volunteer => (
                    <div key={volunteer.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(volunteer.event)}`}>
                          {volunteer.event}
                        </span>
                        <button
                          onClick={() => deleteVolunteer(volunteer.id, volunteer.user_id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">
                        📅 {volunteer.availability}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Registered {getTimeAgo(volunteer.created_at)}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Animations */}
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