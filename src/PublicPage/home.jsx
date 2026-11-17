import React, { useState, useEffect } from "react";
import Navbar from "../component/nav_bar";
import Navfooter from "../component/nav_footer";
import api from "../api.js";

export default function HomePage() {
  const programData = [
    {
      title: "Bantuan Sosial",
      description: "Bantuan Pangan Non-Tunai berupa paket sembako untuk memenuhi kebutuhan pokok masyarakat kurang mampu.",
      image: "/bansos.png",
    },
    {
      title: "Bantuan Kamar Mandi",
      description: "Pemerintah menyediakan 47 kamar mandi untuk masyarakat agar tidak mandi lagi di sungai ",
      image: "/kamar_mandi.png",
    },
    {
      title: "Program RTLH",
      description: "RTLH adalah program bantuan bagi warga yang tinggal di rumah tidak layak huni. Saat ini telah dibangun 30 unit rumah.",
      image: "/rtlh.png",
    },
  ];

  const contactInfo = [
    {
      title: "ALAMAT",
      icon: (
        <svg
          className="w-8 h-8 mb-2 text-blue-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" />
          <path d="M13 11v10H3V12" />
          <path d="M21 12v8h-8" />
        </svg>
      ),
      description:
        "Kec. Kraksaan, Kab. Probolinggo",
    },
    {
      title: "TELEPON",
      icon: (
        <svg
          className="w-8 h-8 mb-2 text-blue-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013 5.18 2 2 0 015 3h3a2 2 0 012 1.72 12.14 12.14 0 004.21 6.71 12.14 12.14 0 006.71 4.21A2 2 0 0122 16.92z" />
        </svg>
      ),
      description: "+6297982742742",
    },
    {
      title: "EMAIL",
      icon: (
        <svg
          className="w-8 h-8 mb-2 text-blue-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M4 4h16v16H4z" />
          <path d="M4 4l8 8 8-8" />
        </svg>
      ),
      description: "kominfoprobolinggo@gmail.com",
    },
    {
      title: "JAM KERJA",
      icon: (
        <svg
          className="w-8 h-8 mb-2 text-blue-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      description: "Senin - Kamis, 07.30 - 16.00 WIB Jumat, 7.30 -11.00 WIB",
    },
  ];

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    message: "",
  });

  const [stats, setStats] = useState({ pendudukCount: 0, permohonanCount: 0, beritaCount: 0 });

  // ===== NEW: homeslider state + base url =====
  const [homes, setHomes] = useState([]);
  const base = api.defaults?.baseURL || "";

  useEffect(() => {
    let mounted = true;
    async function loadHomes() {
      try {
        const res = await api.get("/homeslider").catch(() => null);
        if (!mounted) return;
        if (res && Array.isArray(res.data)) setHomes(res.data);
      } catch (err) {
        console.error("Load homeslider error", err);
      }
    }
    loadHomes();
    return () => { mounted = false; };
  }, []);

  function getSliderImage(idx) {
    // if homes available, use them. If fewer than needed, cycle through entries.
    if (homes && homes.length > 0) {
      const item = homes[idx % homes.length];
      if (item && item.gambar) {
        const g = String(item.gambar);
        if (g.startsWith("http") || g.startsWith("data:")) return g;
        // handle stored relative paths like "/uploads/..." — prefix base
        if (g.startsWith("/")) return `${base}${g}`;
        return `${base}/${g}`;
      }
    }
    // fallback to existing static images (indexes 0..5)
    const fallbacks = ["/image_2.png","/image_1.png","/image_3.png","/image_4.png","/image_5.png","/image_2.png"];
    return fallbacks[idx] || "";
  }
  // ===== END NEW =====

  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      try {
        const res = await api.get("/stats").catch(() => null);
        if (res && res.data && (res.data.pendudukCount !== undefined || res.data.permohonanCount !== undefined)) {
          if (!mounted) return;
          setStats(res.data);
          return;
        }

        // fallback: hit endpoints and count
        const [pend, perm, brt] = await Promise.allSettled([
          api.get("/penduduk").catch(() => null),
          api.get("/permohonan").catch(() => null),
          api.get("/berita").catch(() => null),
        ]);
        if (!mounted) return;
        const pendudukCount = (pend.status === "fulfilled" && Array.isArray(pend.value?.data)) ? pend.value.data.length : 0;
        const permohonanCount = (perm.status === "fulfilled" && Array.isArray(perm.value?.data)) ? perm.value.data.length : 0;
        const beritaCount = (brt.status === "fulfilled" && Array.isArray(brt.value?.data)) ? brt.value.data.length : 0;
        setStats({ pendudukCount, permohonanCount, beritaCount });
      } catch (e) {
        console.error("Load stats error", e);
      }
    }
    loadStats();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `Pesan terkirim!\nNama: ${form.fullName}\nEmail: ${form.email}\nPesan: ${form.message}`
    );
    setForm({ fullName: "", email: "", message: "" });
  };

  return (
    <div className="">
      <Navbar />

      {/* Bagian 1 */}
      <section className="grid md:grid-cols-2 gap-20 items-center px-8 py-16 bg-white">
        <div>
          <h1 className="font-extrabold text-4xl md:text-5xl leading-tight text-black mb-5 px-15">
            <span className="pb-1">LAYANAN DIGITAL</span> <br />
            <span className="border-b-4 border-blue-50 pb-1">
              DESA MARON KULON
            </span>
          </h1>

          <p className="italic font-semibold text-gray-700 text-lg md:text-10xs px-15">
            "Mudah, Cepat, dan Informatif untuk Masyarakat"
          </p>

          <p className="mt-15 text-gray-700 leading-relaxed px-15">
            Website Desa Maron Kulon hadir untuk memberikan informasi terkini,
            pelayanan publik, dan publikasi kegiatan desa secara transparan
            dan akurat demi mendukung kemajuan masyarakat.
          </p>

          <div className="layout flex px-13">
            <button className="mt-10 bg-blue-600 text-white px-8 py-3 rounded-md font-semibold text-sm hover:bg-blue-700 transition-colors ml-2">
              SELENGKAPNYA
            </button>
          </div>
        </div>

        {/* GAMBAR KANAN */}
        <div className="flex items-center justify-center">
          <div className="flex items-start gap-6">
            <img
              src={getSliderImage(0)}
              alt="Gambar besar"
              className="rounded-2xl shadow-md w-72 h-96 object-cover"
            />

            <div className="flex flex-col h-96 justify-between">
              <img
                src={getSliderImage(1)}
                alt="kecil-atas"
                className="rounded-xl shadow-lg w-40 h-44 md:w-44 md:h-52 object-cover border-4 border-white"
              />
              <img
                src={getSliderImage(2)}
                alt="kecil-bawah"
                className="rounded-xl shadow-lg w-40 h-44 md:w-44 md:h-52 object-cover border-4 border-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bagian 2 */}
      <section className="grid md:grid-cols-2 items-center gap-20 px-10 md:px-20 py-20">
        <div className="grid grid-cols-2 gap-4 w-full max-w-xl mx-auto">
          <img
            src={getSliderImage(3)}
            alt="Desa"
            className="col-span-2 md:col-span-1 row-span-2 rounded-2xl shadow-lg object-cover h-[420px] w-full"
          />
          <img
            src={getSliderImage(4)}
            alt="Warga 1"
            className="rounded-xl shadow-md object-cover h-[200px] w-full border-2 border-blue-300"
          />
          <img
            src={getSliderImage(5)}
            alt="Warga 2"
            className="rounded-xl shadow-md object-cover h-[200px] w-full border-2 border-blue-300"
          />
        </div>

        <div>
          <span className="text-xs font-semibold text-gray-900 bg-blue-100 px-3 py-1 rounded-md">
            Tentang Kami
          </span>

          <h2 className="mt-4 font-extrabold text-3xl md:text-4xl leading-relaxed max-w-xl">
            KAMI SIAP MELAYANI, <br />
            BERINOVASI, DAN MEMBANGUN <br />
            DESA MARON KULON
          </h2>

          <p className="mt-5 text-gray-700 text-base leading-relaxed max-w-lg">
            Kecamatan Maron merupakan salah satu kecamatan di Kabupaten Probolinggo, Provinsi Jawa Timur, yang dikenal dengan julukan Kota Ketiga Probolinggo. Nama Maron berasal dari kata Kemaron, yaitu wadah besar dari tanah liat yang dibakar hingga berwarna merah bata dan biasa digunakan untuk mengaron nasi. Kecamatan ini memiliki 18 desa, yaitu Maron Wetan, Maron Kulon, Maron Kidul, Brabe, Brani Kulon, Brani Wetan, Brumbungan Kidul, Ganting Kulon, Ganting Wetan, Kedungsari, Pegalangan Kidul, Puspan, Satreyan, Suko, Sumberdawe, Sumberpoh, Wonorejo, dan Gerongan.
          </p>

          <button className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition">
            Detail Tentang Kami →
          </button>
        </div>
      </section>

      {/* PROGRAM DESA */}
      <div className="bg-blue-50 py-20 px-6 md:px-12 mx-auto space-y-20">
        <section>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-14">
            PROGRAM DESA
          </h2>

          <div className="grid gap-10 md:grid-cols-3">
            {programData.map((program, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-md overflow-hidden p-6 text-center"
              >
                {/* Gambar kosong agar tidak error */}
                {program.image ? (
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-[260px] object-cover rounded-lg border-4 border-blue-300"
                  />
                ) : (
                  <div className="w-full h-[260px] rounded-lg border-4 border-blue-300 bg-gray-200 flex items-center justify-center text-gray-500">
                  
                  </div>
                )}

                <h3 className="mt-5 font-bold text-lg text-gray-900">
                  {program.title}
                </h3>

                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                  {program.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Kontak */}
      <section className="text-center mt-40 mb-40 max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900">KONTAK KAMI</h2>

        <div className="flex justify-center mt-3 mb-6">
          <span className="text-gray-600 tracking-widest text-xl select-none">
            • • • • •
          </span>
        </div>

        <p className="text-gray-700 mb-14 max-w-2xl mx-auto text-base leading-relaxed">
          Hubungi kami untuk informasi lebih lanjut.
        </p>

        <div className="grid gap-50 md:grid-cols-4 justify-items-center">
          {contactInfo.map(({ title, icon, description }, idx) => (
            <div
              key={idx}
              className="bg-blue-200 rounded-2xl shadow-lg w-64 h-44 p-6 flex flex-col items-center text-center"
            >
              <div className="text-blue-700 text-4xl mb-3">{icon}</div>
              <h3 className="font-bold text-base uppercase text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-gray-700 text-sm leading-snug">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FORM */}
      <section className="bg-blue-50 py-20 px-6 md:px-12 mx-auto">
        <h2 className="text-center font-extrabold text-3xl mb-10 tracking-wide">
          TINGGALKAN PESAN
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 max-w-lg mx-auto text-center"
        >
          <div className="text-left">
            <label className="block text-sm font-extrabold uppercase mb-2">
              NAMA LENGKAP
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Masukkan nama lengkap"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 rounded-md px-4 py-3 text-gray-800"
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-extrabold uppercase mb-2">
              EMAIL
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Masukkan email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 rounded-md px-4 py-3 text-gray-800"
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-extrabold uppercase mb-2">
              PESAN
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="Masukkan pesan..."
              value={form.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full border border-gray-400 rounded-md px-4 py-3 resize-none text-gray-800"
            />
          </div>

          <div className="text-center mt-4">
            <button
              type="submit"
              className="bg-blue-300 text-black font-semibold rounded-md px-10 py-3 shadow-md hover:bg-blue-400 transition duration-200"
            >
              KIRIM
            </button>
          </div>
        </form>
      </section>

      {/* QUICK STATS */}
      <section className="max-w-7xl mx-auto px-8 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow flex flex-col">
            <div className="text-sm text-gray-500">Penduduk</div>
            <div className="text-4xl font-extrabold text-slate-800 mt-3">{stats.pendudukCount}</div>
            <div className="text-sm text-gray-400 mt-2">Total penduduk terdaftar</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow flex flex-col">
            <div className="text-sm text-gray-500">Permohonan</div>
            <div className="text-4xl font-extrabold text-slate-800 mt-3">{stats.permohonanCount}</div>
            <div className="text-sm text-gray-400 mt-2">Permohonan layanan masuk</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow flex flex-col">
            <div className="text-sm text-gray-500">Berita</div>
            <div className="text-4xl font-extrabold text-slate-800 mt-3">{stats.beritaCount}</div>
            <div className="text-sm text-gray-400 mt-2">Artikel & pengumuman</div>
          </div>
        </div>
      </section>

      <Navfooter />
    </div>
  );
}
