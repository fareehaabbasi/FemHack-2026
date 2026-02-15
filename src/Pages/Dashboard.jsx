import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../Config/config';
import DashboardHome from '../Components/dashboard/DashboardHome';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await client.auth.getUser();
      
      if (!user) {
        // Agar user login nahi hai to login page par bhejo
        navigate('/Authentication');
        return;
      }

      setUser(user);
      setLoading(false);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/Authentication');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          {/* Animated Loader */}
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-t-[#66b032] border-r-[#0057a8] border-b-[#66b032] border-l-[#0057a8] rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          
          <h2 className="mt-6 text-2xl font-semibold text-gray-700">
            Loading Dashboard...
          </h2>
          
          <p className="mt-2 text-gray-500">
            Please wait while we verify your credentials
          </p>

          {/* Loading Progress Bar */}
          <div className="mt-6 w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-[#66b032] to-[#0057a8] rounded-full animate-pulse"
                 style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Agar user hai to DashboardHome show karo
  return (
    <>
      <DashboardHome user={user} />
    </>
  );
};

export default Dashboard;