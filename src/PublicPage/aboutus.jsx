import React, { useEffect, useState } from "react";
import Navbar from "../component/nav_bar";
import Navfooter from "../component/nav_footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function TentangKami() {
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  useEffect(() => {
    const abort = new AbortController();
    const load = async () => {
      try {
        setLoadingStaff(true);
        const res = await fetch(`${API}/staf`, { signal: abort.signal });
        if (!res.ok) throw new Error("Gagal memuat staf");
        const data = await res.json();
        setStaff(data);
      } catch (e) {
        console.error("Load staf error:", e);
      } finally {
        setLoadingStaff(false);
      }
    };
    load();
    return () => abort.abort();
  }, []);

  const getPublicUrl = (p) => {
    if (!p) return null;
    if (/^https?:\/\//.test(p)) return p;
    const base = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
    return p.startsWith("/") ? `${base}${p}` : `${base}/${p}`;
  };

  return (
    <div className="">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 py-20">

        {/* Bagian Header (Tengah) */}
        <div className="text-center">
          {/* Label kecil */}
          <div className="mb-3">
            <span className="inline-block bg-blue-300 text-blue-900 font-semibold text-sm px-3 py-1 rounded-md">
              Tentang Kami
            </span>
          </div>

          {/* Judul utama */}
          <h2 className="font-extrabold text-2xl md:text-3xl max-w-4xl leading-snug mb-10 mx-auto">
            KAMI SIAP MELAYANI, BERINOVASI, DAN MEMBANGUN DESA MARON KULON
          </h2>
        </div>

        {/* Konten 2 kolom */}
        <div className="flex flex-col md:flex-row md:space-x-16 items-center">

          {/* KIRI — SATU GAMBAR */}
          <div className="flex-1 mb-10 md:mb-0 flex justify-center md:justify-start">
            <img
              src="/image.png"
              alt="Tentang Desa"
              className="w-80 md:w-96 rounded-xl shadow-md"
            />
          </div>

          {/* KANAN — TEKS */}
          <article className="flex-1 max-w-xl text-gray-700 text-sm md:text-base leading-relaxed">
            <p>
              Di Timur pasar ada suatu benda yang bernama kuali (Kemaron). Nama Desa Maron berasal
              dari nama benda tersebut yaitu Kemaron. Desa Maron sangat luas, Desa tersebut Kepala
              Desanya Bernama Bujuk Miranti. Bujuk Miranti mempunyai 3 orang istri, istri pertama
              mempunyai 2 anak laki laki. Istri ketiga mempunyai 1 anak laki-laki. Bujuk Miranti
              masa pensiun menyerahkan jabatan kepala desa kepada ketiga orang anak laki-lakinya.
            </p>

            <p className="mt-5">
              Waktu jaman kolonial Belanda dipecah menjadi 3 Desa yaitu: Desa Maron Kidul Kepala
              Desanya Raden Sinawan, Desa Maron Wetan Kepala Desanya Raden Rengganis, dan Desa
              Maron Kulon Kepala Desanya Raden Surawan. Raden Surawan adalah anak pertama dari
              istri kedua Bujuk Miranti. Jarak tempuh Desa Maron Kulon ke Kec. Maron adalah 1,5 km,
              sekitar 2 menit kendaraan bermotor. Sedangkan jarak ke Kabupaten Probolinggo adalah
              22 km dengan waktu tempuh 45 menit.
            </p>
          </article>

        </div>
      </section>

      {/* ============================= */}
      {/* BAGIAN STRUKTUR ORGANISASI   */}
      {/* ============================= */}
      <section className="max-w-7xl mx-auto px-6 py-10">

        <h2 className="text-center font-extrabold text-2xl md:text-3xl mb-6">
          STRUKTUR ORGANISASI DESA
        </h2>

        <div className="flex justify-center">
          <img
            src="/struktur_organisasi.png"
            alt="Struktur Organisasi Desa Maron Kulon"
            className="w-full max-w-4xl rounded-xl shadow-lg border"
          />
        </div>

      </section>

      {/* ============================= */}
      {/* BAGIAN VISI & MISI            */}
      {/* ============================= */}
      <section className="max-w-5xl mx-auto px-6 py-20">

      {/* VISI */}
      <div className="text-center mb-24">
        <h2 className="font-extrabold text-2xl md:text-3xl mb-6">VISI</h2>

        <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto text-sm md:text-base">
        Terwujudnya masyarakat Maron Kulon jaya adil, makmur,  sejahtera, bermartabat, dan transparan dalam anggaran  Pembangunan.
        </p>
      </div>

        {/* MISI */}
      <div className="bg-[#E5F0FF] py-16 px-6 rounded-xl shadow-sm">
        <h2 className="text-center font-extrabold text-2xl md:text-3xl mb-10">MISI</h2>
      
      <div className="text-gray-700 leading-relaxed max-w-3xl mx-auto text-sm md:text-base space-y-4">
        <p>
        a) Melakukan reformasi sistem kinerja aparatur pemerintah  desa guna meningkatkan kualitas pelayanan kepada  masyarakat.
        </p>

        <p>
        b) Menyelenggarakan pemerintah yang bersih terbebas dari  korupsi dan bentuk – bentuk lainnya.
        </p>

        <p>
        c) Menyelenggarakan pemerintah desa secara terbuka dan  tanggung jawab sesuai dengan peraturan perundang undangan
        </p>
     </div>
   </div>

  </section>

  {/* ============================= */}
  {/* BAGIAN STAF (Card UI)        */}
  {/* ============================= */}
  <section className="max-w-7xl mx-auto px-6 py-16">
    <h2 className="text-center font-extrabold text-2xl md:text-3xl mb-8">STAF DESA MARON KULON</h2>

    {loadingStaff ? (
      <div className="text-center text-gray-500">Memuat data staf...</div>
    ) : staff.length === 0 ? (
      <div className="text-center text-gray-600">Belum ada data staf.</div>
    ) : (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {staff.map((s) => {
          const photo = getPublicUrl(s.photo) || "/default-user.png";
          return (
            <article
              key={s.id}
              className="group relative bg-white rounded-2xl shadow-lg overflow-hidden border transform transition duration-300 hover:-translate-y-2"
            >
              {/* card image area */}
              <div className="relative w-full h-48 bg-gradient-to-b from-gray-100 to-white overflow-hidden">
                <img
                  src={photo}
                  alt={s.nama}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-400 ease-out group-hover:scale-105"
                  style={{ objectPosition: "center 28%" }}
                  onError={(e) => { e.currentTarget.src = "/default-user.png"; }}
                />
                {/* subtle overlay */}
                <div className="absolute inset-0 bg-black/6 backdrop-blur-sm pointer-events-none" />
              </div>

              {/* avatar & content */}
              <div className="px-5 pb-6 pt-4">
                <div className="flex items-center -mt-10">
                  <div className="relative flex-shrink-0">
                    {/* gradient ring container */}
                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform transition duration-300 group-hover:scale-105 shadow-lg">
                      {/* inner white frame to separate gradient and photo */}
                      <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                        <img
                          src={photo}
                          alt={s.nama}
                          className="w-full h-full object-cover"
                          style={{ objectPosition: "center 28%" }}
                          onError={(e) => { e.currentTarget.src = "/default-user.png"; }}
                        />
                      </div>
                    </div>
                    {/* small badge with initials */}
                    <div className="absolute -bottom-1 -right-1">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <span className="text-xs font-semibold text-indigo-600">
                          {(s.nama || "")
                            .split(" ")
                            .map(n => n[0])
                            .filter(Boolean)
                            .slice(0,2)
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                   <div className="ml-4">
                     <h3 className="text-lg font-semibold text-gray-800 leading-tight">{s.nama}</h3>
                     <p className="text-sm text-indigo-600">{s.jabatan || s.jabatanId || "Staf Desa"}</p>
                   </div>
                </div>

                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  {s.telepon && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h2l2 5-2 2a11 11 0 005 5l2-2 5 2v2a2 2 0 01-2 2H6a3 3 0 01-3-3V5z"/></svg>
                      <span>{s.telepon}</span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m0 8V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2z"/></svg>
                      <span>{s.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-gray-500">NIK: {s.nik || "-"}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        // open modal by setting window.location hash (simple) or implement modal state below
                        const imgWindow = window.open(photo, "_blank", "noopener,noreferrer");
                        if (imgWindow) imgWindow.focus();
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100"
                    >
                      Lihat Foto
                    </button>
                    <a
                      href={`tel:${s.telepon || ""}`}
                      className="text-xs text-gray-500 hover:text-gray-700"
                      aria-label="hubungi"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 7a2 2 0 012-2h3l2 5-2 2a11 11 0 005 5l2-2 5 2v3a2 2 0 01-2 2h-1"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    )}
  </section>

  {/* NOTE: jika ingin modal besar inline, bisa tambahkan state modal dan markup di bawah; saat ini tombol "Lihat Foto" membuka foto di tab baru untuk perfomance dan kesederhanaan */}

      <Navfooter />
    </div>
  );
}
