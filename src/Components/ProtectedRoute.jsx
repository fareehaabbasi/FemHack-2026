import { useEffect, useState } from "react";
import client from "../Config/config";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await client.auth.getUser();
      if (!data.user) {
        navigate("/Authentication");
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return children;
}
