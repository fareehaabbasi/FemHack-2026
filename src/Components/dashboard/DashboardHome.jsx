import React, { useState, useEffect } from 'react';
import client from '../../Config/config.js'
import StatsCard from '../../Components/dashboard/StatsCard.jsx';
import RecentActivity from '../../Components/dashboard/RecentActivity.jsx';

const DashboardHome = ({ user }) => {
  const [stats, setStats] = useState({
    lostFound: 0,
    complaints: 0,
    volunteers: 0,
    resolved: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    fetchStats();
    
    const lostFoundSub = client
      .channel('lost_found_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lost_found_items' },
        () => fetchStats()
      )
      .subscribe();

    const complaintsSub = client
      .channel('complaints_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'complaints' },
        () => fetchStats()
      )
      .subscribe();

    const volunteersSub = client
      .channel('volunteers_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'volunteers' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      lostFoundSub.unsubscribe();
      complaintsSub.unsubscribe();
      volunteersSub.unsubscribe();
    };
  }, []);

  const fetchStats = async () => {
    try {
      const { count: lostFoundCount } = await client
        .from('lost_found_items')
        .select('*', { count: 'exact', head: true });

      const { count: complaintsCount } = await client
        .from('complaints')
        .select('*', { count: 'exact', head: true });

      const { count: volunteersCount } = await client
        .from('volunteers')
        .select('*', { count: 'exact', head: true });

      const { count: resolvedCount } = await client
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved');

      setStats({
        lostFound: lostFoundCount || 0,
        complaints: complaintsCount || 0,
        volunteers: volunteersCount || 0,
        resolved: resolvedCount || 0
      });

      await fetchRecentActivities();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data: lostFound } = await client
        .from('lost_found_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: complaints } = await client
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: volunteers } = await client
        .from('volunteers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      const allActivities = [
        ...(lostFound?.map(item => ({
          ...item,
          type: item.type || 'lost',
          table: 'lost_found'
        })) || []),
        ...(complaints?.map(item => ({
          ...item,
          type: 'complaint',
          table: 'complaints'
        })) || []),
        ...(volunteers?.map(item => ({
          ...item,
          type: 'volunteer',
          table: 'volunteers',
          title: item.full_name || 'New Volunteer'
        })) || [])
      ];

      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setRecentItems(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const handleActivityClick = (item) => {
    switch(item.table) {
      case 'lost_found':
        alert(`📦 Lost/Found Item: ${item.title}`);
        break;
      case 'complaints':
        alert(`📝 Complaint: ${item.description?.substring(0, 50)}...`);
        break;
      case 'volunteers':
        alert(`🤝 Volunteer: ${item.full_name || item.title}`);
        break;
      default:
        alert(`Viewing: ${item.title || 'Activity'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            {/* Animated spinner with Saylani colors */}
            <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-t-[#66b032] border-r-[#0057a8] border-b-[#66b032] border-l-[#0057a8] rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#66b032] to-[#0057a8] rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {greeting}, {user?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p className="text-white/90 text-lg">
              Here's what's happening at Saylani Mass IT Hub today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <span className="text-lg font-semibold">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid with improved design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Lost & Found"
          value={stats.lostFound}
          icon="🔍"
          color="#66b032"
          trend="+12%"
          trendUp={true}
        />
        <StatsCard 
          title="Complaints"
          value={stats.complaints}
          icon="📝"
          color="#0057a8"
          trend="+5%"
          trendUp={true}
        />
        <StatsCard 
          title="Volunteers"
          value={stats.volunteers}
          icon="🤝"
          color="#66b032"
          trend="+8%"
          trendUp={true}
        />
        <StatsCard 
          title="Resolved"
          value={stats.resolved}
          icon="✅"
          color="#0057a8"
          trend="+15%"
          trendUp={true}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#66b032] rounded-full"></span>
                Recent Activity
              </h2>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                Last 5 activities
              </span>
            </div>
            <RecentActivity 
              items={recentItems}
              onItemClick={handleActivityClick}
            />
          </div>
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#0057a8] rounded-full"></span>
              Quick Actions
            </h2>
            
            <div className="space-y-4">
              <button 
                className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#66b032] to-[#66b032]/80 text-white p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                onClick={() => window.location.href = '/lost-found'}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-between">
                  <span className="font-semibold">📦 Report Lost Item</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>

              <button 
                className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0057a8] to-[#0057a8]/80 text-white p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                onClick={() => window.location.href = '/complaints'}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-between">
                  <span className="font-semibold">⚡ Submit Complaint</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>

              <button 
                className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-white p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                onClick={() => window.location.href = '/volunteer'}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-between">
                  <span className="font-semibold">🤝 Register as Volunteer</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Today's Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">New Items</span>
                  <span className="font-semibold text-[#66b032]">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Complaints</span>
                  <span className="font-semibold text-[#0057a8]">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Volunteers</span>
                  <span className="font-semibold text-[#66b032]">24</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;