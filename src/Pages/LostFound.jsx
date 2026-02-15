import { useState, useEffect } from "react";
import client from "../Config/config";
import { toast, Toaster } from 'react-hot-toast';
import logo from "../assets/Images/logo.png";

export default function LostFound() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, lost, found
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUser();
    fetchItems();
  }, []);

  const getUser = async () => {
    const { data } = await client.auth.getUser();
    setUser(data.user);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Please fill all fields!");
      return;
    }
    if (!user) {
      toast.error("Please login first!");
      return;
    }

    setLoading(true);
    const { error } = await client.from("lost_found_items").insert([
      {
        title,
        description,
        status: "Pending",
        user_id: user.id,
        created_at: new Date().toISOString()
      },
    ]);

    if (error) {
      console.log(error);
      toast.error("Error posting item!");
      setLoading(false);
      return;
    }

    toast.success("Item posted successfully!");
    setTitle("");
    setDescription("");
    fetchItems();
    setLoading(false);
  };

  const fetchItems = async () => {
    const { data } = await client
      .from("lost_found_items")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  };

  const markAsFound = async (itemId) => {
    const { error } = await client
      .from("lost_found_items")
      .update({ status: "Found" })
      .eq("id", itemId);

    if (!error) {
      toast.success("Item marked as found!");
      fetchItems();
    }
  };

  const deleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const { error } = await client
        .from("lost_found_items")
        .delete()
        .eq("id", itemId);

      if (!error) {
        toast.success("Item deleted!");
        fetchItems();
      }
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    // Status filter
    if (filter === "lost" && item.status === "Found") return false;
    if (filter === "found" && item.status !== "Found") return false;
   
    // Search filter
    if (searchTerm) {
      return item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.description.toLowerCase().includes(searchTerm.toLowerCase());
    }
   
    return true;
  });

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
        {/* Header with Logo */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-block p-4 bg-white rounded-full shadow-xl mb-4">
            <img
              src={logo}
              width="80"
              alt="Saylani Logo"
              className="hover:scale-110 transition-transform duration-300"
            />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#66b032] to-[#0057a8] bg-clip-text text-transparent">
            Saylani Lost & Found
          </h1>
          <p className="text-gray-600 text-lg">
            Report or track lost items on campus 🎓
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-[#66b032]">
            <p className="text-gray-600 text-sm">Total Items</p>
            <p className="text-2xl font-bold text-gray-800">{items.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {items.filter(i => i.status === "Pending").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Found</p>
            <p className="text-2xl font-bold text-green-600">
              {items.filter(i => i.status === "Found").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-[#0057a8]">
            <p className="text-gray-600 text-sm">Your Items</p>
            <p className="text-2xl font-bold text-[#0057a8]">
              {items.filter(i => i.user_id === user?.id).length}
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300
                           focus:ring-2 focus:ring-[#66b032] focus:border-transparent
                           outline-none transition-all"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === "all"
                    ? "bg-[#66b032] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("lost")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === "lost"
                    ? "bg-[#0057a8] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Lost
              </button>
              <button
                onClick={() => setFilter("found")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === "found"
                    ? "bg-[#66b032] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Found
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6 border-2 border-transparent hover:border-[#66b032] transition-all duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-8 bg-[#66b032] rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-800">Post an Item</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-300
                             focus:ring-2 focus:ring-[#66b032] focus:border-transparent
                             outline-none transition-all"
                    placeholder="e.g., Laptop, Water Bottle, Wallet"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-gray-300
                             focus:ring-2 focus:ring-[#66b032] focus:border-transparent
                             outline-none transition-all resize-none"
                    placeholder="Describe the item in detail - color, brand, location, etc."
                    rows="5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

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
                      Posting...
                    </>
                  ) : (
                    <>
                      <span></span>
                      Post Item
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
                    Mention where you lost/found it
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#66b032]">•</span>
                    Add color, brand, unique features
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Items Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-8 bg-[#0057a8] rounded-full"></span>
                Posted Items
              </h2>
              <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                {filteredItems.length} items
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-7xl mb-6"></div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                  No Items Found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm
                    ? "No items match your search"
                    : "Be the first to post an item!"}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="px-6 py-2 bg-[#66b032] text-white rounded-lg
                             hover:bg-[#66b032]/90 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl
                             hover:-translate-y-0.5 transition-all duration-300
                             border-l-4 animate-slide-in"
                    style={{
                      borderLeftColor: item.status === "Found" ? "#66b032" : "#0057a8",
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header with status */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium
                            ${item.status === "Found"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {item.status === "Found" ? " Found" : " Pending"}
                          </span>
                          <span className="text-sm text-gray-500">
                            Posted by {item.user_email?.split('@')[0] || 'Anonymous'}
                          </span>
                          <span className="text-sm text-gray-400">
                            {getTimeAgo(item.created_at)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 mb-4">
                          {item.description}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          {item.status !== "Found" && (
                            <button
                              onClick={() => markAsFound(item.id)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg
                                       text-sm font-medium hover:bg-green-600
                                       transition-colors flex items-center gap-1"
                            >
                              <span></span>
                              Mark Found
                            </button>
                          )}
                         
                          {/* Show delete only for item owner or admin */}
                          {(item.user_id === user?.id || user?.email?.includes('admin')) && (
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg
                                       text-sm font-medium hover:bg-red-600
                                       transition-colors flex items-center gap-1"
                            >
                              <span></span>
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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