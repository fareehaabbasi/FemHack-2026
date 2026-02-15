import { useStatcliente, useEffect, useState } from 'react';
import client from '../Config/config.js';

const useComplaints = (userId = null) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'in-progress', 'resolved', 'mine'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Categories for complaints
  const categories = [
    'Internet',
    'Electricity',
    'Water',
    'Maintenance',
    'Cleanliness',
    'Security',
    'Other'
  ];

  // Fetch all complaints
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      let query = client
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply status filter
      if (filter !== 'all' && filter !== 'mine') {
        query = query.eq('status', filter);
      }

      // Apply category filter
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      // Apply user filter
      if (filter === 'mine' && userId) {
        query = query.eq('user_id', userId);
      }

      // Apply date range filter
      if (dateRange.start) {
        query = query.gte('created_at', dateRange.start);
      }
      if (dateRange.end) {
        query = query.lte('created_at', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      setComplaints(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit new complaint
  const submitComplaint = async (complaintData) => {
    try {
      setLoading(true);
      const { data, error } = await client
        .from('complaints')
        .insert([{
          ...complaintData,
          status: 'submitted',
          priority: complaintData.priority || 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      // Send notification to admins
      await notifyAdmins('new_complaint', complaintData);

      // Refresh complaints
      await fetchComplaints();
      return { success: true, data: data[0] };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update complaint status
  const updateComplaintStatus = async (complaintId, newStatus, remarks = '') => {
    try {
      setLoading(true);
      const { error } = await client
        .from('complaints')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          remarks: remarks
        })
        .eq('id', complaintId);

      if (error) throw error;

      // Create notification for user
      await createNotification(
        complaintId,
        `Your complaint status has been updated to ${newStatus}`,
        'complaint'
      );

      // Refresh complaints
      await fetchComplaints();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Add comment to complaint
  const addComment = async (complaintId, comment, userEmail) => {
    try {
      const { error } = await client
        .from('complaint_comments')
        .insert([{
          complaint_id: complaintId,
          comment: comment,
          user_email: userEmail,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Refresh complaints to show new comment
      await fetchComplaints();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Get complaint statistics
  const getStats = async () => {
    try {
      const { data, error } = await client
        .from('complaints')
        .select('status, priority');

      if (error) throw error;

      const stats = {
        total: data.length,
        submitted: data.filter(c => c.status === 'submitted').length,
        inProgress: data.filter(c => c.status === 'in-progress').length,
        resolved: data.filter(c => c.status === 'resolved').length,
        highPriority: data.filter(c => c.priority === 'high').length,
        mediumPriority: data.filter(c => c.priority === 'medium').length,
        lowPriority: data.filter(c => c.priority === 'low').length
      };

      return stats;
    } catch (err) {
      console.error('Error getting stats:', err);
      return null;
    }
  };

  // Get single complaint by ID
  const getComplaintById = async (complaintId) => {
    try {
      const { data, error } = await client
        .from('complaints')
        .select(`
          *,
          complaint_comments (*)
        `)
        .eq('id', complaintId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Notify admins
  const notifyAdmins = async (type, data) => {
    try {
      // Get all admin users (you'll need an admin role in your users table)
      const { data: admins } = await client
        .from('profiles')
        .select('user_id')
        .eq('role', 'admin');

      const notifications = admins?.map(admin => ({
        user_id: admin.user_id,
        type: type,
        message: `New complaint: ${data.category}`,
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

  // Create notification
  const createNotification = async (complaintId, message, type) => {
    try {
      const { data: complaint } = await client
        .from('complaints')
        .select('user_id')
        .eq('id', complaintId)
        .single();

      if (complaint) {
        await client
          .from('notifications')
          .insert([{
            user_id: complaint.user_id,
            type: type,
            message: message,
            complaint_id: complaintId,
            created_at: new Date().toISOString(),
            read: false
          }]);
      }
    } catch (err) {
      console.error('Error creating notification:', err);
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchComplaints();

    const subscription = client
      .channel('complaints_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'complaints' },
        () => fetchComplaints()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filter, categoryFilter, dateRange.start, dateRange.end]);

  return {
    complaints,
    loading,
    error,
    categories,
    filter,
    setFilter,
    categoryFilter,
    setCategoryFilter,
    dateRange,
    setDateRange,
    submitComplaint,
    updateComplaintStatus,
    addComment,
    getComplaintById,
    getStats,
    refreshComplaints: fetchComplaints
  };
};

export default useComplaints;
