import { useState, useEffect } from "react";
import client from "../Config/config";

export default function LostFound() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);

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
      alert("Fill all fields");
      return;
    }
    if (!user) {
      alert("User not logged in");
      return;
    }

    const { error } = await client.from("lost_found_items").insert([
      { title, description, status: "Pending", user_id: user.id },
    ]);

    if (error) {
      console.log(error);
      alert("Error posting item");
      return;
    }

    setTitle("");
    setDescription("");
    fetchItems();
  };

  const fetchItems = async () => {
    const { data } = await client
      .from("lost_found_items")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  };

  return (
    <div className="container py-5">

      {/* Header */}
      <div className="text-center mb-5">
        <img src="/saylani-logo.png" width="80" alt="Saylani Logo" />
        <h2 className="fw-bold mt-3" style={{ color: "#0057a8" }}>
          Saylani Lost & Found
        </h2>
        <p className="text-muted">Report or track lost items on campus</p>
      </div>

      <div className="row justify-content-center gx-4">

        {/* Form Section */}
        <div className="col-lg-4">
          <div className="card shadow-sm p-4 mb-4 border-0 rounded-4">
            <h4 className="mb-4" style={{ color: "#0057a8" }}>Post an Item</h4>

            <form onSubmit={handleSubmit}>
              <input
                className="form-control mb-3 rounded-3 border-1"
                placeholder="Item Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="form-control mb-3 rounded-3 border-1"
                placeholder="Item Description"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button
                className="btn w-100 rounded-3 fw-semibold"
                style={{ backgroundColor: "#66b032", color: "white" }}
              >
                Post Item
              </button>
            </form>
          </div>
        </div>

        {/* Items Section */}
        <div className="col-lg-6">
          <h4 className="mb-3" style={{ color: "#0057a8" }}>Posted Items</h4>

          {items.length === 0 ? (
            <p className="text-muted">No items posted yet</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="card shadow-sm mb-3 p-3 rounded-4 border-0"
                style={{ borderLeft: `5px solid ${item.status === "Found" ? "#66b032" : "#0057a8"}` }}
              >
                <h5 className="mb-2">{item.title}</h5>
                <p className="text-muted">{item.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span
                    className={`badge ${
                      item.status === "Found"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {item.status}
                  </span>

                  {item.status !== "Found" && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={async () => {
                        await client
                          .from("lost_found_items")
                          .update({ status: "Found" })
                          .eq("id", item.id);
                        fetchItems();
                      }}
                    >
                      Mark Found
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
