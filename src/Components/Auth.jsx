import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../Config/config";
import Swal from "sweetalert2";

export default function Auth() {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // ---------- INPUT CHANGE ----------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ---------- SIGNUP ----------
  const handleSignup = async () => {
    const { username, email, password } = formData;

    if (!username || !email || !password) {
      Swal.fire({
        title: "Missing Fields",
        text: "Please enter all fields!",
        icon: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // Create Supabase Auth account
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        Swal.fire({
          title: "Signup Failed!",
          text: error.message,
          icon: "error",
        });
        return;
      }

      // Add user information to users-data table
      if (data?.user?.id) {
        const { error: userError } = await client
          .from("users-data")
          .insert([
            {
              name: username,
              email: email,
              role: "user",
              uid: data.user.id,
            },
          ]);

        if (userError) {
          Swal.fire({
            title: "Account Created",
            text: "Your account was created, but some profile information could not be saved.",
            icon: "warning",
          });
        } else {
          Swal.fire({
            title: "Signup Successful!",
            text: "Your account has been created successfully.",
            icon: "success",
          });
        }
      }

      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
      });

      // Switch back to Login
      setIsSignup(false);
    } catch (error) {
      Swal.fire({
        title: "Something went wrong!",
        text: error.message,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------- LOGIN ----------
  const handleLogin = async () => {
  const { email, password } = formData;

  if (!email || !password) {
    Swal.fire({
      title: "Missing Fields",
      text: "Please enter email and password!",
      icon: "error",
    });
    return;
  }

  try {
    setLoading(true);

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Swal.fire({
        title: "Login Failed!",
        text: error.message,
        icon: "error",
      });
      return;
    }

    if (data?.user) {
      // Check if this is the admin account
      const isAdmin = data.user.email === "admin@gmail.com";

      if (isAdmin) {
        await Swal.fire({
          title: "Admin Login Successful!",
          text: "Welcome Admin!",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({
          title: "Login Successful!",
          text: "Welcome back!",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
      }

      // Admin → Dashboard
  if (data.user.email === "admin@gmail.com") {
    navigate("/Dashboard");
  } else {
    // Normal User → Home
    navigate("/");
  };
    }
  } catch (error) {
    Swal.fire({
      title: "Something went wrong!",
      text: error.message,
      icon: "error",
    });
  } finally {
    setLoading(false);
  }
};

  // ---------- SWITCH LOGIN / SIGNUP ----------
  const handleSwitch = () => {
    setIsSignup(!isSignup);

    setFormData({
      username: "",
      email: "",
      password: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">

      {/* Card */}
      <div className="w-[400px] p-8 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl text-white">

        {/* Heading */}
        <h2 className="text-3xl font-bold text-center mb-6">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        <div className="space-y-4">

          {/* Username */}
          {isSignup && (
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              disabled={loading}
              className="w-full h-12 px-4 rounded-lg bg-white/20 placeholder-gray-200 outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
            />
          )}

          {/* Email */}
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
            disabled={loading}
            className="w-full h-12 px-4 rounded-lg bg-white/20 placeholder-gray-200 outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
          />

          {/* Password */}
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                isSignup ? handleSignup() : handleLogin();
              }
            }}
            className="w-full h-12 px-4 rounded-lg bg-white/20 placeholder-gray-200 outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
          />

          {/* Submit Button */}
          <button
            onClick={isSignup ? handleSignup : handleLogin}
            disabled={loading}
            className="w-full h-12 bg-white text-purple-600 font-semibold rounded-lg hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "SIGN UP"
              : "SIGN IN"}
          </button>
        </div>

        {/* Switch Login / Signup */}
        <p className="text-center mt-6 text-sm">
          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}

          <span
            onClick={!loading ? handleSwitch : undefined}
            className={`ml-2 font-bold underline ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
