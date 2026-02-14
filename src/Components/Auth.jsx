import { useState } from "react";
import client from "../Config/config";
import Swal from "sweetalert2";

export default function AuthCard() {
  const [isSignup, setIsSignup] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---------- SIGNUP ----------
  const handleSignup = async () => {
    const { username, email, password } = formData;

    if (!username || !email || !password) {
      Swal.fire("Please enter all fields!", "", "error");
      return;
    }

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error) return Swal.fire(error.message, "", "error");

    await client.from("users-data").insert([
      {
        name: username,
        email,
        role: "user",
        uid: data?.user?.id,
      },
    ]);

    Swal.fire("Signup Successful!", "", "success");

    setIsSignup(false);
    setFormData({ username: "", email: "", password: "" });
  };

  // ---------- LOGIN ----------
  const handleLogin = async () => {
    const { email, password } = formData;

    if (!email || !password) {
      Swal.fire("Please enter all fields!", "", "error");
      return;
    }

    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return Swal.fire("Login Failed!", error.message, "error");

    Swal.fire("Login Successful!", "", "success");

    setTimeout(() => {
      window.location.href = "/post";
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">

      {/* Card */}
      <div className="w-[400px] p-8 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl text-white">

        <h2 className="text-3xl font-bold text-center mb-6">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        <div className="space-y-4">

          {isSignup && (
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full h-12 px-4 rounded-lg bg-white/20 placeholder-gray-200 outline-none focus:ring-2 focus:ring-white"
            />
          )}

          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
            className="w-full h-12 px-4 rounded-lg bg-white/20 placeholder-gray-200 outline-none focus:ring-2 focus:ring-white"
          />

          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            className="w-full h-12 px-4 rounded-lg bg-white/20 placeholder-gray-200 outline-none focus:ring-2 focus:ring-white"
          />

          <button
            onClick={isSignup ? handleSignup : handleLogin}
            className="w-full h-12 bg-white text-purple-600 font-semibold rounded-lg hover:scale-105 transition"
          >
            {isSignup ? "SIGN UP" : "SIGN IN"}
          </button>
        </div>

        {/* Switch */}
        <p className="text-center mt-6 text-sm">
          {isSignup ? "Already have an account?" : "Don't have an account?"}

          <span
            onClick={() => setIsSignup(!isSignup)}
            className="ml-2 font-bold cursor-pointer underline"
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
