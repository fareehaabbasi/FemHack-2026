import { useState, useEffect } from 'react';
import client from '../Config/config.js';

const useVolunteers = (userId = null) => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected', 'mine'
  const [eventFilter, setEventFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    availableToday: 0
  });

  // Events list
  const events = [
    'Tech Workshop',
    'Community Outreach',
    'Teaching Assistant',
    'Event Management',
    'Fundraising',
    'Administrative Support',
    'Other'
  ];

  // Fetch all volunteers
  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      let query = client
        .from('volunteers')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply status filter
      if (filter !== 'all' && filter !== 'mine') {
        query = query.eq('status', filter);
      }

      // Apply event filter
      if (eventFilter !== 'all') {
        query = query.eq('event', eventFilter);
      }

      // Apply user filter
      if (filter === 'mine' && userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVolunteers(data || []);
      
      // Update stats
      updateStats(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching volunteers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update statistics
  const updateStats = (data) => {
    const today = new Date().toISOString().split('T')[0];
    
    setStats({
      total: data.length,
      pending: data.filter(v => v.status === 'pending').length,
      approved: data.filter(v => v.status === 'approved').length,
      rejected: data.filter(v => v.status === 'rejected').length,
      availableToday: data.filter(v => 
        v.availability?.includes(today) && v.status === 'approved'
      ).length
    });
  };

  // Register as volunteer
  const registerVolunteer = async (volunteerData) => {
    try {
      setLoading(true);
      
      // Check if already registered
      if (userId) {
        const { data: existing } = await client
          .from('volunteers')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existing) {
          return { 
            success: false, 
            error: 'You have already registered as a volunteer' 
          };
        }
      }

      const { data, error } = await client
        .from('volunteers')
        .insert([{
          ...volunteerData,
          status: 'pending',
          registered_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      // Send confirmation email (you'll need to implement this)
      await sendConfirmationEmail(volunteerData.email);

      // Notify admins
      await notifyAdmins('new_volunteer', volunteerData);

      // Refresh volunteers
      await fetchVolunteers();
      return { success: true, data: data[0] };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update volunteer status
  const updateVolunteerStatus = async (volunteerId, newStatus, remarks = '') => {
    try {
      setLoading(true);
      const { error } = await client
        .from('volunteers')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          remarks: remarks
        })
        .eq('id', volunteerId);

      if (error) throw error;

      // Get volunteer email for notification
      const { data: volunteer } = await client
        .from('volunteers')
        .select('email')
        .eq('id', volunteerId)
        .single();

      // Send status update notification
      await sendStatusNotification(volunteer?.email, newStatus);

      // Refresh volunteers
      await fetchVolunteers();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update volunteer profile
  const updateVolunteerProfile = async (volunteerId, updates) => {
    try {
      setLoading(true);
      const { error } = await client
        .from('volunteers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', volunteerId);

      if (error) throw error;

      // Refresh volunteers
      await fetchVolunteers();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get volunteer by ID
  const getVolunteerById = async (volunteerId) => {
    try {
      const { data, error } = await client
        .from('volunteers')
        .select('*')
        .eq('id', volunteerId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Get volunteers by event
  const getVolunteersByEvent = async (eventName) => {
    try {
      const { data, error } = await client
        .from('volunteers')
        .select('*')
        .eq('event', eventName)
        .eq('status', 'approved');

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  // Check availability
  const checkAvailability = (volunteerId, date) => {
    const volunteer = volunteers.find(v => v.id === volunteerId);
    return volunteer?.availability?.includes(date) || false;
  };

  // Send confirmation email (mock function)
  const sendConfirmationEmail = async (email) => {
    console.log(`Sending confirmation email to ${email}`);
    // Implement actual email sending here
  };

  // Send status notification (mock function)
  const sendStatusNotification = async (email, status) => {
    console.log(`Sending ${status} notification to ${email}`);
    // Implement actual notification here
  };

  // Notify admins
  const notifyAdmins = async (type, data) => {
    try {
      const { data: admins } = await client
        .from('profiles')
        .select('user_id')
        .eq('role', 'admin');

      const notifications = admins?.map(admin => ({
        user_id: admin.user_id,
        type: type,
        message: `New volunteer registration: ${data.full_name}`,
        data: data,
        created_at: new Date().toISOString()
      }));

      if (notifications?.length) {
        await client
          .from('notifications')
          .insert(notifications);
      }
    } catch (err) {
      console.error('Error notifying admins:', err);
    }
  };

  // Generate volunteer report
  const generateReport = async (startDate, endDate) => {
    try {
      const { data, error } = await client
        .from('volunteers')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const report = {
        totalRegistrations: data.length,
        approved: data.filter(v => v.status === 'approved').length,
        pending: data.filter(v => v.status === 'pending').length,
        rejected: data.filter(v => v.status === 'rejected').length,
        byEvent: {},
        byDate: {}
      };

      // Group by event
      data.forEach(v => {
        report.byEvent[v.event] = (report.byEvent[v.event] || 0) + 1;
        
        const date = v.created_at.split('T')[0];
        report.byDate[date] = (report.byDate[date] || 0) + 1;
      });

      return report;
    } catch (err) {
      console.error('Error generating report:', err);
      return null;
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchVolunteers();

    const subscription = client
      .channel('volunteers_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'volunteers' },
        () => fetchVolunteers()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filter, eventFilter]);

  return {
    volunteers,
    loading,
    error,
    stats,
    events,
    filter,
    setFilter,
    eventFilter,
    setEventFilter,
    registerVolunteer,
    updateVolunteerStatus,
    updateVolunteerProfile,
    getVolunteerById,
    getVolunteersByEvent,
    checkAvailability,
    generateReport,
    refreshVolunteers: fetchVolunteers
  };
};

export default useVolunteers;
