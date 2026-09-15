import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import client from "../../Config/config";

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await client.auth.getSession();

      const user = data?.session?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      // Only this email is allowed to access Dashboard
      if (user.email === "admin@gmail.com") {
        setIsAdmin(true);
      }

      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking access...</p>
      </div>
    );
  }

  // Not admin → Home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Admin → Dashboard
  return children;
}