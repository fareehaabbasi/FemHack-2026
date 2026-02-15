import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useVolunteers from '../hooks/useVolunteers';
import LoadingSpinner, { SkeletonLoader } from '../Components/common/LoadingSpinner';
import ErrorAlert from '../Components/common/ErrorAlert';
import StatusBadge from '../Components/common/StatusBadge';

const Volunteer = ({ user }) => {
  const navigate = useNavigate();
  const {
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
    checkAvailability,
    refreshVolunteers
  } = useVolunteers(user?.id);

  const [showForm, setShowForm] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: user?.email || '',
    phone: '',
    event: '',
    skills: [],
    availability: [],
    experience: '',
    motivation: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [selectedDates, setSelectedDates] = useState([]);

  // Available skills suggestions
  const skillSuggestions = [
    'Teaching', 'Programming', 'Event Management', 
    'Public Speaking', 'Graphic Design', 'Content Writing',
    'Social Media', 'Fundraising', 'Administrative',
    'First Aid', 'Cooking', 'Photography'
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle skills
  const addSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Handle availability dates
  const toggleDate = (date) => {
    setSelectedDates(prev => {
      if (prev.includes(date)) {
        return prev.filter(d => d !== date);
      } else {
        return [...prev, date];
      }
    });
  };

  // Generate next 7 days for availability
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await registerVolunteer({
      ...formData,
      user_id: user?.id,
      availability: selectedDates,
      registered_at: new Date().toISOString()
    });

    if (result.success) {
      alert('✅ Registered successfully! Your application is pending approval.');
      setShowForm(false);
      setFormData({
        full_name: '',
        email: user?.email || '',
        phone: '',
        event: '',
        skills: [],
        availability: [],
        experience: '',
        motivation: ''
      });
      setSelectedDates([]);
    } else {
      alert(`❌ Error: ${result.error}`);
    }

    setSubmitting(false);
  };

  // View volunteer details
  const viewVolunteerDetails = async (volunteerId) => {
    const data = await getVolunteerById(volunteerId);
    setSelectedVolunteer(data);
  };

  // Update volunteer status (admin only)
  const handleStatusUpdate = async (volunteerId, newStatus) => {
    if (window.confirm(`Update status to ${newStatus}?`)) {
      const result = await updateVolunteerStatus(volunteerId, newStatus);
      if (result.success) {
        alert(`✅ Status updated to ${newStatus}`);
        setSelectedVolunteer(null);
      }
    }
  };

  // Filter volunteers
  const filteredVolunteers = volunteers.filter(v => {
    if (filter !== 'all' && v.status !== filter) return false;
    if (eventFilter !== 'all' && v.event !== eventFilter) return false;
    return true;
  });

  if (loading && volunteers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Volunteer Program
          </h1>
          <p className="text-gray-600">
            Join our mission to make a difference at Saylani Mass IT Hub
          </p>
        </div>
        <button
          className="px-6 py-3 bg-gradient-to-r from-[#66b032] to-[#66b032]/80 text-white rounded-xl 
                     font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300
                     flex items-center gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>✕ Cancel</>
          ) : (
            <>
              <span className="text-xl">🤝</span>
              Register as Volunteer
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#66b032]">
            <p className="text-gray-600 text-sm mb-1">Total Volunteers</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm mb-1">Approved</p>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#0057a8]">
            <p className="text-gray-600 text-sm mb-1">Available Today</p>
            <p className="text-3xl font-bold text-[#0057a8]">{stats.availableToday}</p>
          </div>
        </div>
      )}

      {/* Registration Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Volunteer Registration Form
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                           focus:ring-[#66b032] focus:border-transparent outline-none transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  readOnly={!!user?.email}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                           focus:ring-[#66b032] focus:border-transparent outline-none transition-all
                           bg-gray-50"
                  placeholder="Your email"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                           focus:ring-[#66b032] focus:border-transparent outline-none transition-all"
                  placeholder="03XX-XXXXXXX"
                />
              </div>

              {/* Event Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Event *
                </label>
                <select
                  name="event"
                  value={formData.event}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                           focus:ring-[#66b032] focus:border-transparent outline-none transition-all"
                >
                  <option value="">Choose an event</option>
                  {events.map(event => (
                    <option key={event} value={event}>{event}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.skills.map(skill => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-[#66b032]/10 text-[#66b032] rounded-full 
                             text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                           focus:ring-[#66b032] focus:border-transparent outline-none transition-all"
                  placeholder="Add a skill"
                  list="skills"
                />
                <datalist id="skills">
                  {skillSuggestions.map(skill => (
                    <option key={skill} value={skill} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={() => addSkill(skillInput)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
                           transition-colors font-medium"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Available Dates
              </label>
              <div className="flex flex-wrap gap-2">
                {getNextDays().map(date => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => toggleDate(date)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all duration-200
                              ${selectedDates.includes(date)
                                ? 'bg-[#66b032] text-white border-[#66b032]'
                                : 'border-gray-300 hover:border-[#66b032] text-gray-700'
                              }`}
                  >
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Experience
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                         focus:ring-[#66b032] focus:border-transparent outline-none transition-all"
                placeholder="Tell us about any relevant experience..."
              ></textarea>
            </div>

            {/* Motivation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why do you want to volunteer? *
              </label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                         focus:ring-[#66b032] focus:border-transparent outline-none transition-all"
                placeholder="Share your motivation to join..."
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#66b032] to-[#66b032]/80 
                       text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 
                       disabled:cursor-not-allowed transition-all duration-300"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      )}

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
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 
                       focus:ring-[#66b032] focus:border-transparent outline-none"
            >
              <option value="all">All Volunteers</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Event
            </label>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 
                       focus:ring-[#66b032] focus:border-transparent outline-none"
            >
              <option value="all">All Events</option>
              {events.map(event => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Volunteers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volunteers List - Takes 2 columns */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Volunteers ({filteredVolunteers.length})
          </h2>
          
          {filteredVolunteers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No volunteers found
              </h3>
              <p className="text-gray-500">
                Be the first to register as a volunteer!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVolunteers.map(volunteer => (
                <div
                  key={volunteer.id}
                  onClick={() => viewVolunteerDetails(volunteer.id)}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl 
                           hover:-translate-y-0.5 transition-all duration-300 cursor-pointer
                           border-l-4 border-[#66b032]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {volunteer.full_name}
                        </h3>
                        <StatusBadge status={volunteer.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>📧</span>
                          <span className="text-sm">{volunteer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>📱</span>
                          <span className="text-sm">{volunteer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>🎯</span>
                          <span className="text-sm">{volunteer.event}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>📅</span>
                          <span className="text-sm">
                            {new Date(volunteer.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Skills */}
                      {volunteer.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {volunteer.skills.slice(0, 3).map(skill => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {volunteer.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                              +{volunteer.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <span className="text-[#66b032] text-xl ml-4">→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Volunteer Details Panel */}
        <div className="lg:col-span-1">
          {selectedVolunteer ? (
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">
                  Volunteer Details
                </h3>
                <button
                  onClick={() => setSelectedVolunteer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#66b032] to-[#0057a8] 
                                rounded-full mx-auto flex items-center justify-center text-3xl text-white">
                    {selectedVolunteer.full_name?.charAt(0)}
                  </div>
                  <h4 className="font-semibold text-lg mt-2">
                    {selectedVolunteer.full_name}
                  </h4>
                  <StatusBadge status={selectedVolunteer.status} />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <span className="w-6">📧</span>
                      <span className="text-sm">{selectedVolunteer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <span className="w-6">📱</span>
                      <span className="text-sm">{selectedVolunteer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <span className="w-6">🎯</span>
                      <span className="text-sm">{selectedVolunteer.event}</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedVolunteer.skills?.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="font-medium text-gray-700 mb-2">Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedVolunteer.skills.map(skill => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability */}
                {selectedVolunteer.availability?.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="font-medium text-gray-700 mb-2">Availability</h5>
                    <div className="space-y-2">
                      {selectedVolunteer.availability.map(date => (
                        <div key={date} className="flex items-center gap-2 text-sm text-gray-600">
                          <span>📅</span>
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {selectedVolunteer.experience && (
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="font-medium text-gray-700 mb-2">Experience</h5>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedVolunteer.experience}
                    </p>
                  </div>
                )}

                {/* Motivation */}
                {selectedVolunteer.motivation && (
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="font-medium text-gray-700 mb-2">Motivation</h5>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedVolunteer.motivation}
                    </p>
                  </div>
                )}

                {/* Admin Controls */}
                {user?.email?.includes('admin') && (
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="font-medium text-gray-700 mb-3">Update Status</h5>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(selectedVolunteer.id, 'approved')}
                        className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg 
                                 hover:bg-green-600 transition-colors text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedVolunteer.id, 'rejected')}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg 
                                 hover:bg-red-600 transition-colors text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-4">👆</div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Select a Volunteer
              </h4>
              <p className="text-gray-500 text-sm">
                Click on any volunteer to view their complete profile
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Volunteer;