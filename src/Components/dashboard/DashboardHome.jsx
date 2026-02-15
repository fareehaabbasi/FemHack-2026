import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';  // Import RecentActivity

const DashboardHome = ({ user }) => {
  const [stats, setStats] = useState({
    lostFound: 0,
    complaints: 0,
    volunteers: 0,
    resolved: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Setup real-time subscriptions
    const lostFoundSub = supabase
      .channel('lost_found_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lost_found_items' },
        () => fetchStats()
      )
      .subscribe();

    const complaintsSub = supabase
      .channel('complaints_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'complaints' },
        () => fetchStats()
      )
      .subscribe();

    const volunteersSub = supabase
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
      // Get counts from Supabase
      const { count: lostFoundCount } = await supabase
        .from('lost_found_items')
        .select('*', { count: 'exact', head: true });

      const { count: complaintsCount } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true });

      const { count: volunteersCount } = await supabase
        .from('volunteers')
        .select('*', { count: 'exact', head: true });

      const { count: resolvedCount } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved');

      setStats({
        lostFound: lostFoundCount || 0,
        complaints: complaintsCount || 0,
        volunteers: volunteersCount || 0,
        resolved: resolvedCount || 0
      });

      // Fetch recent activities from all tables
      await fetchRecentActivities();
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  // New function to fetch all recent activities
  const fetchRecentActivities = async () => {
    try {
      // Fetch from lost_found_items
      const { data: lostFound } = await supabase
        .from('lost_found_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch from complaints
      const { data: complaints } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch from volunteers
      const { data: volunteers } = await supabase
        .from('volunteers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      // Combine and format all activities
      const allActivities = [
        ...(lostFound?.map(item => ({
          ...item,
          type: item.type || 'lost', // 'lost' or 'found'
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
          title: item.full_name || 'New Volunteer' // Volunteers ke liye title
        })) || [])
      ];

      // Sort by created_at and take latest 5
      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setRecentItems(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  // Handle activity item click
  const handleActivityClick = (item) => {
    // Different actions based on item type
    switch(item.table) {
      case 'lost_found':
        alert(`📦 Lost/Found Item: ${item.title}`);
        // navigate(`/lost-found/${item.id}`); // Agar React Router use kar rahe hain
        break;
      case 'complaints':
        alert(`📝 Complaint: ${item.description?.substring(0, 50)}...`);
        // navigate(`/complaints/${item.id}`);
        break;
      case 'volunteers':
        alert(`🤝 Volunteer: ${item.full_name || item.title}`);
        // navigate(`/volunteers/${item.id}`);
        break;
      default:
        alert(`Viewing: ${item.title || 'Activity'}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-saylani-gradient text-white p-4 rounded-4 mb-4">
        <h2>Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋</h2>
        <p className="mb-0">Here's what's happening at Saylani Mass IT Hub today.</p>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <StatsCard 
            title="Lost & Found"
            value={stats.lostFound}
            icon="🔍"
            color="#66b032"
            trend="+12%"
          />
        </div>
        <div className="col-md-3">
          <StatsCard 
            title="Complaints"
            value={stats.complaints}
            icon="📝"
            color="#0057a8"
            trend="+5%"
          />
        </div>
        <div className="col-md-3">
          <StatsCard 
            title="Volunteers"
            value={stats.volunteers}
            icon="🤝"
            color="#66b032"
            trend="+8%"
          />
        </div>
        <div className="col-md-3">
          <StatsCard 
            title="Resolved"
            value={stats.resolved}
            icon="✅"
            color="#0057a8"
            trend="+15%"
          />
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="row">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Recent Activity</h5>
              {/* RecentActivity component yahan use kiya hai */}
              <RecentActivity 
                items={recentItems}
                onItemClick={handleActivityClick}
              />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Quick Actions</h5>
              <div className="d-grid gap-2">
                <button 
                  className="btn" 
                  style={{ backgroundColor: '#66b032', color: 'white' }}
                  onClick={() => window.location.href = '/lost-found'} // Navigation
                >
                  📦 Report Lost Item
                </button>
                <button 
                  className="btn" 
                  style={{ backgroundColor: '#0057a8', color: 'white' }}
                  onClick={() => window.location.href = '/complaints'}
                >
                  ⚡ Submit Complaint
                </button>
                <button 
                  className="btn btn-outline-success"
                  onClick={() => window.location.href = '/volunteer'}
                >
                  🤝 Register as Volunteer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;