import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client  from '../Config/config';

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    lostFound: 0,
    complaints: 0,
    volunteers: 0,
    resolved: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: lostFound } = await client
        .from('lost_found_items')
        .select('*', { count: 'exact', head: true });

      const { count: complaints } = await client
        .from('complaints')
        .select('*', { count: 'exact', head: true });

      const { count: volunteers } = await client
        .from('volunteers')
        .select('*', { count: 'exact', head: true });

      const { count: resolved } = await client
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved');

      setStats({
        lostFound: lostFound || 0,
        complaints: complaints || 0,
        volunteers: volunteers || 0,
        resolved: resolved || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      // Get recent lost/found items
      const { data: lostFound } = await client
        .from('lost_found_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);

      // Get recent complaints
      const { data: complaints } = await client
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);

      // Get recent volunteers
      const { data: volunteers } = await client
        .from('volunteers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);

      const activities = [
        ...(lostFound?.map(item => ({ ...item, type: 'lost-found' })) || []),
        ...(complaints?.map(item => ({ ...item, type: 'complaint' })) || []),
        ...(volunteers?.map(item => ({ ...item, type: 'volunteer' })) || [])
      ];

      setRecentActivities(activities.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 4));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  const features = [
    {
      icon: '🔍',
      title: 'Lost & Found',
      description: 'Report lost items or help others find their belongings. Track status in real-time.',
      color: '#66b032',
      path: '/lost-found',
      bg: 'bg-green-50'
    },
    {
      icon: '📝',
      title: 'Complaints',
      description: 'Submit complaints about internet, electricity, water, maintenance, and more.',
      color: '#0057a8',
      path: '/complaints',
      bg: 'bg-blue-50'
    },
    {
      icon: '🤝',
      title: 'Volunteer',
      description: 'Register as a volunteer for campus events and make a difference.',
      color: '#f59e0b',
      path: '/volunteer',
      bg: 'bg-orange-50'
    },
    {
      icon: '📊',
      title: 'Dashboard',
      description: 'Track all your activities, complaints, and volunteer work in one place.',
      color: '#66b032',
      path: '/dashboard',
      bg: 'bg-green-50'
    }
  ];

  const testimonials = [
    {
      name: 'Ali Raza',
      role: 'Student',
      image: '👨‍🎓',
      comment: 'Lost my laptop in the library, within 2 hours someone reported it on the portal. Amazing!',
      rating: 5
    },
    {
      name: 'Fatima Khan',
      role: 'Teacher',
      image: '👩‍🏫',
      comment: 'The complaint system is very efficient. My internet issue was resolved within a day.',
      rating: 5
    },
    {
      name: 'Ahmed Hassan',
      role: 'Volunteer',
      image: '👨‍💼',
      comment: 'Volunteering through this portal has been a great experience. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#66b032] rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0057a8] rounded-full blur-3xl"></div>
        </div>

        {/* Navbar */}
        <nav className="relative z-10 container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
             
              <span className="text-2xl font-bold bg-gradient-to-r from-[#66b032] to-[#0057a8] bg-clip-text text-transparent">
                Saylani Mass IT Hub
              </span>
            </div>
            <div className="flex items-center gap-4">
             
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-[#66b032] to-[#0057a8] bg-clip-text text-transparent">
                  Connect, Report,
                </span>
                <br />
                <span className="text-gray-800">and Make a Difference</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Welcome to Saylani Mass IT Hub Portal – your one-stop solution for 
                lost & found items, complaints, and volunteer registration. 
                Join our community of 5000+ students and staff.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-gradient-to-r from-[#66b032] to-[#0057a8] text-white 
                           rounded-xl font-semibold text-lg hover:shadow-2xl 
                           transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
                >
                  <span>Get Started</span>
                  <span className="text-2xl">→</span>
                </button>
                
                <button
                  onClick={() => {
                    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg 
                           hover:shadow-xl transition-all duration-300 border-2 border-gray-200
                           hover:border-[#66b032] flex items-center gap-2"
                >
                  <span>Learn More</span>
                  <span className="text-2xl">↓</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                <div>
                  <p className="text-3xl font-bold text-[#66b032]">{stats.lostFound}+</p>
                  <p className="text-gray-600">Items Posted</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#0057a8]">{stats.complaints}+</p>
                  <p className="text-gray-600">Complaints</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#66b032]">{stats.volunteers}+</p>
                  <p className="text-gray-600">Volunteers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#0057a8]">{stats.resolved}+</p>
                  <p className="text-gray-600">Resolved</p>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image/Animation */}
            <div className="relative hidden lg:block">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#66b032] rounded-full 
                              flex items-center justify-center text-white font-bold text-lg
                              animate-bounce-slow">
                  New!
                </div>
                
                {/* Live Activity Feed */}
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live Activity
                </h3>
                
                <div className="space-y-4">
                  {!loading && recentActivities.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg 
                                            hover:bg-gray-100 transition-colors animate-slide-in"
                         style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="w-10 h-10 rounded-full bg-[#66b032] bg-opacity-10 
                                    flex items-center justify-center text-xl">
                        {activity.type === 'lost-found' ? '🔍' : 
                         activity.type === 'complaint' ? '📝' : '🤝'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {activity.title || activity.full_name || 'New Activity'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-500">Real-time updates from campus</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
                  fill="white"/>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Everything You Need in One Portal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamlined solutions for students and staff to manage campus life efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => navigate(feature.path)}
              className="group cursor-pointer"
            >
              <div className={`${feature.bg} rounded-2xl p-8 transition-all duration-500 
                            hover:scale-105 hover:shadow-2xl relative overflow-hidden`}>
                {/* Background Icon */}
                <div className="absolute -right-6 -top-6 text-8xl opacity-10 
                              group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center 
                                justify-center text-3xl mb-6 shadow-lg
                                group-hover:rotate-12 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center text-[#66b032] font-medium 
                                group-hover:gap-2 transition-all">
                    <span>Learn More</span>
                    <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-r from-[#66b032]/5 to-[#0057a8]/5 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up with your email and join the Saylani community',
                icon: '📝'
              },
              {
                step: '02',
                title: 'Submit Request',
                description: 'Post lost items, file complaints, or register as volunteer',
                icon: '🚀'
              },
              {
                step: '03',
                title: 'Track Progress',
                description: 'Get real-time updates and notifications on your requests',
                icon: '📊'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center
                              hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#66b032] to-[#0057a8] 
                                rounded-2xl flex items-center justify-center text-white 
                                text-2xl font-bold mx-auto mb-6">
                    {item.step}
                  </div>
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 text-4xl text-[#66b032]">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of satisfied students and staff
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl 
                       transition-all duration-300 hover:-translate-y-2"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#66b032] to-[#0057a8] 
                              rounded-full flex items-center justify-center text-3xl text-white">
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              
              <p className="text-gray-600 italic">"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#66b032] to-[#0057a8] py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join Saylani Mass IT Hub today and be part of our growing community
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-[#0057a8] rounded-xl font-semibold text-lg 
                       hover:shadow-2xl transition-all duration-300 hover:-translate-y-1
                       flex items-center gap-2"
            >
              <span>Create Free Account</span>
              <span className="text-2xl">→</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 border-2 border-white text-white rounded-xl 
                       font-semibold text-lg hover:bg-white hover:text-[#66b032] 
                       transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src="/saylani-logo.png" alt="Saylani Logo" className="w-16 h-16 mb-4" />
              <p className="text-gray-400">
                Empowering students through technology and community service.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#66b032] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#66b032] transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-[#66b032] transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-[#66b032] transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#66b032] transition-colors">Lost & Found</a></li>
                <li><a href="#" className="hover:text-[#66b032] transition-colors">Complaints</a></li>
                <li><a href="#" className="hover:text-[#66b032] transition-colors">Volunteer</a></li>
                <li><a href="#" className="hover:text-[#66b032] transition-colors">Dashboard</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📍 Karachi, Pakistan</li>
                <li>📞 +92 21 111 729 526</li>
                <li>✉️ info@saylani.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Saylani Mass IT Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default HomePage;