import { useState, useEffect } from 'react';
import client from '../Config/config.js';

const useLostFound = (userId = null) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'lost', 'found', 'mine'
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all lost/found items
  const fetchItems = async () => {
    try {
      setLoading(true);
      let query = client
        .from('lost_found_items')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter === 'lost') {
        query = query.eq('type', 'lost');
      } else if (filter === 'found') {
        query = query.eq('type', 'found');
      } else if (filter === 'mine' && userId) {
        query = query.eq('user_id', userId);
      }

      // Apply search
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching lost/found items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new item
  const addItem = async (itemData) => {
    try {
      setLoading(true);
      const { data, error } = await client
        .from('lost_found_items')
        .insert([{
          ...itemData,
          created_at: new Date().toISOString(),
          status: itemData.type === 'lost' ? 'pending' : 'found'
        }])
        .select();

      if (error) throw error;
      
      // Refresh items
      await fetchItems();
      return { success: true, data: data[0] };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update item status
  const updateItemStatus = async (itemId, newStatus) => {
    try {
      setLoading(true);
      const { error } = await client
        .from('lost_found_items')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;
      
      // Create notification
      await createNotification(itemId, `Item status updated to ${newStatus}`);
      
      // Refresh items
      await fetchItems();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const deleteItem = async (itemId) => {
    try {
      setLoading(true);
      const { error } = await client
        .from('lost_found_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      // Refresh items
      await fetchItems();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get single item by ID
  const getItemById = async (itemId) => {
    try {
      setLoading(true);
      const { data, error } = await client
        .from('lost_found_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Match lost with found items
  const matchItems = async () => {
    try {
      // Get all lost items
      const { data: lostItems } = await client
        .from('lost_found_items')
        .select('*')
        .eq('type', 'lost')
        .eq('status', 'pending');

      // Get all found items
      const { data: foundItems } = await client
        .from('lost_found_items')
        .select('*')
        .eq('type', 'found')
        .eq('status', 'found');

      const matches = [];

      // Simple keyword matching
      lostItems?.forEach(lost => {
        foundItems?.forEach(found => {
          const lostWords = lost.title.toLowerCase().split(' ');
          const foundWords = found.title.toLowerCase().split(' ');
          
          // Check if any word matches
          const hasMatch = lostWords.some(word => 
            foundWords.includes(word) && word.length > 2
          );

          if (hasMatch) {
            matches.push({
              lostItem: lost,
              foundItem: found,
              score: calculateMatchScore(lost, found)
            });
          }
        });
      });

      return matches.sort((a, b) => b.score - a.score);
    } catch (err) {
      console.error('Error matching items:', err);
      return [];
    }
  };

  // Calculate match score
  const calculateMatchScore = (lost, found) => {
    let score = 0;
    const lostTitle = lost.title.toLowerCase();
    const foundTitle = found.title.toLowerCase();
    const lostDesc = lost.description?.toLowerCase() || '';
    const foundDesc = found.description?.toLowerCase() || '';

    // Title match
    if (lostTitle === foundTitle) score += 50;
    else if (lostTitle.includes(foundTitle) || foundTitle.includes(lostTitle)) score += 30;

    // Description match
    const commonWords = lostDesc.split(' ').filter(word => 
      foundDesc.includes(word) && word.length > 3
    );
    score += commonWords.length * 5;

    return score;
  };

  // Create notification
  const createNotification = async (itemId, message) => {
    try {
      await client
        .from('notifications')
        .insert([{
          item_id: itemId,
          message: message,
          created_at: new Date().toISOString(),
          read: false
        }]);
    } catch (err) {
      console.error('Error creating notification:', err);
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchItems();

    const subscription = client
      .channel('lost_found_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lost_found_items' },
        () => fetchItems()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filter, searchTerm]);

  return {
    items,
    loading,
    error,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    addItem,
    updateItemStatus,
    deleteItem,
    getItemById,
    matchItems,
    refreshItems: fetchItems
  };
};

export default useLostFound;