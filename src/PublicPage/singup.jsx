import React, { useState } from "react";
import Navbar from "../component/nav_bar";
import Navfooter from "../component/nav_footer";
import api from "../api.js"; // axios instance
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // quick social signup redirect (backend must support /auth/google & /auth/facebook)
  const handleSocialLogin = (provider) => {
    window.location.href = `${API}/auth/${provider}`;
  };

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = "Nama lengkap wajib diisi.";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Email tidak valid.";
    if (password.length < 8) e.password = "Password minimal 8 karakter.";
    if (!/[A-Z]/.test(password)) e.password = (e.password ? e.password + " " : "") + "Harus memiliki huruf besar.";
    if (!/[a-z]/.test(password)) e.password = (e.password ? e.password + " " : "") + "Harus memiliki huruf kecil.";
    if (!/[0-9]/.test(password)) e.password = (e.password ? e.password + " " : "") + "Harus memiliki angka.";
    if (!/[^A-Za-z0-9]/.test(password)) e.password = (e.password ? e.password + " " : "") + "Harus memiliki simbol.";
    if (password !== confirm) e.confirm = "Konfirmasi password tidak cocok.";
    if (!agree) e.agree = "Anda harus menyetujui syarat dan ketentuan.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      // kirim username sebagai email supaya backend (yang menggunakan username) cocok
      const payload = { username: email, password };
      await api.post("/users", payload);
      alert("Akun dibuat");
      navigate("/singin");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Gagal membuat akun");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[url('/map-bg.png')] bg-no-repeat bg-center bg-cover">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl">
          <div className="rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
            {/* LEFT */}
            <div className="bg-blue-100 p-12 flex flex-col justify-center items-center gap-6">
              <div className="max-w-md text-center">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Melayani Sepenuh Hati</h3>
                <h1 className="font-extrabold text-3xl md:text-4xl text-black leading-tight">Membangun Desa Maron Kulon</h1>
                <p className="mt-4 text-gray-600">Informasi, pelayanan publik, dan publikasi kegiatan desa secara transparan.</p>
              </div>
              <div className="mt-6">
                <img src="/sign%20up.png" alt="Ilustrasi Sign Up" className="w-72 h-96 object-cover rounded-xl shadow-lg" />
              </div>
            </div>

            {/* RIGHT: signup card */}
            <div className="bg-white p-10 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <div className="flex items-center gap-3 mb-4">
                  <img src="/logo_desa.png" alt="Logo Desa" className="w-10 h-10 object-contain" />
                  <div>
                    <div className="text-sm text-gray-500">DESA MARON KULON</div>
                    <div className="text-lg font-semibold">Daftar Akun</div>
                  </div>
                </div>
                <h2 className="text-2xl font-extrabold mb-6">Sign Up</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="mt-2 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    {errors.fullName && <div className="text-red-600 text-sm mt-1">{errors.fullName}</div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan email"
                      className="mt-2 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="mt-2 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Password harus mengandung minimal 8 karakter, huruf besar, huruf kecil, angka, dan simbol.
                    </div>
                    {errors.password && <div className="text-red-600 text-sm mt-1">{errors.password}</div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Masukkan konfirmasi password"
                      className="mt-2 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    {errors.confirm && <div className="text-red-600 text-sm mt-1">{errors.confirm}</div>}
                  </div>

                  <div className="flex items-start gap-2">
                    <input id="agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
                    <label htmlFor="agree" className="text-sm text-gray-600">
                      I agree to the platform's <a className="text-blue-600 underline">Terms of Service</a> and <a className="text-blue-600 underline">Privacy Policy</a>.
                    </label>
                  </div>
                  {errors.agree && <div className="text-red-600 text-sm">{errors.agree}</div>}

                  <div>
                    <button type="submit" className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-700">
                      CREATE ACCOUNT
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <div className="text-xs text-gray-400 uppercase">Or Sign Up With</div>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => handleSocialLogin('google')} className="flex-1 border border-gray-300 rounded-md py-2 flex items-center justify-center gap-2">
                      <img src="/logo%20google.jpg" alt="Google" className="w-5 h-5 object-contain" /> Google
                    </button>
                    <button type="button" onClick={() => handleSocialLogin('facebook')} className="flex-1 border border-gray-300 rounded-md py-2 flex items-center justify-center gap-2">
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