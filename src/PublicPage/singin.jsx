import React, { useState } from "react";
import Navbar from "../component/nav_bar";
import Navfooter from "../component/nav_footer";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js"; // axios instance

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Open OAuth popup and wait for response (expects backend to postMessage or redirect to frontend with token)
  const handleSocialLogin = (provider) => {
    setLoading(true);
    const url = `${API}/auth/${provider}`;
    const w = 600,
      h = 700;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(url, `oauth_${provider}`, `width=${w},height=${h},left=${left},top=${top}`);

    if (!popup) {
      // popup blocked -> fallback to full redirect
      window.location.href = url;
      return;
    }

    // message handler (preferred): backend should postMessage({ token, user }) to window.opener
    const onMessage = (ev) => {
      try {
        if (!ev.data) return;
        const { token, user } = ev.data;
        if (token) {
          localStorage.setItem("mk_token", token);
          if (user) localStorage.setItem("user", JSON.stringify(user));
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          window.removeEventListener("message", onMessage);
          try {
            popup.close();
          } catch {}
          navigate("/admindashboard");
          setLoading(false);
        }
      } catch (err) {
        /* ignore */
      }
    };
    window.addEventListener("message", onMessage, false);

    // polling fallback: if backend redirects popup to same-origin URL with ?token=... read it
    const poll = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(poll);
          window.removeEventListener("message", onMessage);
          setLoading(false);
          return;
        }
        // same-origin check
        const href = popup.location.href;
        if (!href) return;
        const urlObj = new URL(href);
        const token = urlObj.searchParams.get("token");
        const userStr = urlObj.searchParams.get("user");
        if (token) {
          localStorage.setItem("mk_token", token);
          if (userStr) {
            try {
              localStorage.setItem("user", JSON.stringify(JSON.parse(userStr)));
            } catch {
              localStorage.setItem("user", userStr);
            }
          }
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          clearInterval(poll);
          window.removeEventListener("message", onMessage);
          try {
            popup.close();
          } catch {}
          navigate("/admindashboard");
          setLoading(false);
        }
      } catch (e) {
        // cross-origin while OAuth in progress — ignore
      }
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      // simpan token + user (sesuaikan response dari backend)
      const token = res?.data?.token || null;
      const user = res?.data?.user || res?.data || null;
      if (token) localStorage.setItem("mk_token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));
      // set default Authorization header (opsional)
      if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // redirect langsung ke admin dashboard
      navigate("/admindashboard");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl">
          <div className="rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 bg-transparent">
            {/* Left: illustration & text */}
            <div className="bg-blue-100 p-12 flex flex-col justify-center items-center gap-6">
              <div className="max-w-md text-center">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Melayani Sepenuh Hati</h3>
                <h1 className="font-extrabold text-3xl md:text-4xl text-black leading-tight">Membangun Desa Maron Kulon</h1>
                <p className="mt-4 text-gray-600">Informasi dan pelayanan publik untuk kemajuan bersama.</p>
              </div>

              <div className="mt-6">
                <img src="/sign%20up.png" alt="Ilustrasi Sign Up" className="w-72 h-96 object-cover rounded-xl shadow-lg object-center" />
              </div>
            </div>

            {/* Right: signin card */}
            <div className="bg-white p-10 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <div className="flex items-center gap-3 mb-6">
                  <img src="/logo_desa.png" alt="logo desa" className="w-12 h-12 object-contain" />
                  <div>
                    <div className="text-sm text-gray-500">DESA MARON KULON</div>
                    <h2 className="text-2xl font-extrabold">Welcome!</h2>
                    <div className="text-sm text-gray-400">Sign in to your account</div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan email terdaftar"
                      className="mt-2 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="mt-2 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`mt-3 inline-flex items-center justify-center gap-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"} px-5 py-2 rounded-full font-semibold`}
                      >
                        {loading ? "Signing in..." : "SIGN IN"}
                      </button>

                      <Link to="/singup" className="mt-3 inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-800 px-5 py-2 rounded-full font-semibold hover:bg-gray-100">
                        SIGN UP
                      </Link>
                    </div>

                    <a href="#" className="text-sm text-blue-600 hover:underline">
                      Forgot Password?
                    </a>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <div className="text-xs text-gray-400 uppercase">Or Login With</div>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => handleSocialLogin("google")} className="flex-1 border border-gray-300 rounded-md py-2 flex items-center justify-center gap-2">
                      <img src="/logo%20google.jpg" alt="Google" className="w-5 h-5 object-contain" /> Google
                    </button>
                    <button type="button" onClick={() => handleSocialLogin("facebook")} className="flex-1 border border-gray-300 rounded-md py-2 flex items-center justify-center gap-2">
                      <img src="/logo%20facebook.png" alt="Facebook" className="w-5 h-5 object-contain" /> Facebook
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Navfooter />
    </div>
  );
}
