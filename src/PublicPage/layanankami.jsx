import React, { useEffect, useState, useRef } from "react";
import Navbar from "../component/nav_bar";
import Navfooter from "../component/nav_footer";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

/** helper to resolve image path */
function resolveImage(src) {
  if (!src) return "/placeholder-service.jpg";
  if (src.startsWith("http") || src.startsWith("//")) return src;
  if (src.startsWith("/")) return `${API}${src}`;
  return `${API}/${src}`;
}

// <-- tambah helper component untuk render isiForm / GForm embed -->
function GoogleFormViewer({ text }) {
  const [showEmbed, setShowEmbed] = useState(false);
  if (!text) return null;
  const m = String(text).match(/https?:\/\/docs\.google\.com\/forms\/d\/[^\s"']+/);
  if (!m) {
    return <pre className="text-sm bg-gray-50 p-3 rounded-md overflow-auto whitespace-pre-wrap break-words">{typeof text === "string" ? text : JSON.stringify(text, null, 2)}</pre>;
  }
  let url = m[0];
  try {
    const u = new URL(url);
    if (!u.pathname.includes("/viewform")) {
      u.pathname = u.pathname.replace(/\/$/, "") + "/viewform";
    }
    u.search = "embedded=true";
    url = u.toString();
  } catch (e) {}
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-700">Form terdeteksi di isiForm:</div>
      <div className="flex gap-2">
        <a href={url.replace("?embedded=true", "")} target="_blank" rel="noreferrer" className="text-xs px-3 py-1 bg-white border rounded shadow-sm hover:bg-gray-50">Buka Form di Tab Baru</a>
        <button type="button" onClick={() => setShowEmbed(s => !s)} className="text-xs px-3 py-1 bg-blue-600 text-white rounded shadow-sm">
          {showEmbed ? "Sembunyikan Embed" : "Tampilkan Embed"}
        </button>
      </div>
      {showEmbed && (
        <div className="mt-3 border rounded overflow-hidden">
          <iframe src={url} title="Google Form" className="w-full h-[700px] border-0" />
          <div className="text-xs text-gray-500 p-2">Jika embed tidak muncul (diblock oleh Google), gunakan tombol "Buka Form di Tab Baru".</div>
        </div>
      )}
    </div>
  );
}

export default function LayananKami() {
  const navigate = useNavigate();
  const [layananList, setLayananList] = useState([]);            // layanan yang disediakan desa/admin
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [categories, setCategories] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false);

  // form / pengajuan
  const [formData, setFormData] = useState({
    namaLengkap: "",
    noTelepon: "",
    status: "",
    email: "",
    alamatLengkap: "",
    alasanPengajuan: "",
    tanggalPengajuan: "",
    dokumen: null,
    layananId: null,
  });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [flash, setFlash] = useState("");
  const [recentRequests, setRecentRequests] = useState([]);
  const [permohonanList, setPermohonanList] = useState([]);

  const formRef = useRef();

  useEffect(() => {
    loadLayanan();
    try {
      const raw = localStorage.getItem("requests") || "[]";
      setRecentRequests(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const cats = Array.from(new Set(layananList.map(l => l.kategori?.nama || l.kategori || "Umum")));
    setCategories(["Semua", ...cats]);
    applyFilter();
    // eslint-disable-next-line
  }, [layananList]);

  useEffect(() => applyFilter(), [query, category]); // eslint-disable-line

  async function loadLayanan() {
    try {
      const res = await fetch(`${API}/layanan`);
      const json = await res.json();
      setLayananList(Array.isArray(json) ? json : []);
    } catch (e) {
      console.error("Load layanan error", e);
      setLayananList([]);
    }
  }

  async function syncPermohonan() {
    try {
      const res = await fetch(`${API}/permohonan`);
      const all = await res.json();
      if (!Array.isArray(all)) return setPermohonanList([]);
      if (formData.email && formData.email.trim()) {
        setPermohonanList(all.filter(p => String(p.email || "").toLowerCase() === formData.email.trim().toLowerCase()));
      } else {
        setPermohonanList(all.slice(0, 20));
      }
      setFlash("Sinkron permohonan berhasil.");
      setTimeout(() => setFlash(""), 2000);
    } catch (e) {
      console.error("Sync permohonan error", e);
      setFlash("Gagal sinkron permohonan.");
      setTimeout(() => setFlash(""), 2000);
    }
  }

  function applyFilter() {
    const q = query.trim().toLowerCase();
    const filtered = layananList.filter(l => {
      const title = (l.nama || "").toLowerCase();
      const desc = (l.syarat || "").toLowerCase();
      const cat = (l.kategori?.nama || l.kategori || "Umum");
      const okQuery = !q || title.includes(q) || desc.includes(q) || (l.catatan || "").toLowerCase().includes(q) || (l.isiForm || "").toLowerCase().includes(q);
      const okCat = category === "Semua" || cat === category;
      return okQuery && okCat;
    });
    setFiltered(filtered);
  }

  function openDetail(l) {
    setSelectedService(l);
    setShowModal(true);
  }

  function quickApply(l) {
    setFormData(f => ({
      ...f,
      layananId: l.id,
      alasanPengajuan: f.alasanPengajuan || `Permohonan layanan: ${l.nama}`,
    }));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: undefined }));
  }

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    setFormData(p => ({ ...p, dokumen: file || null }));
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  }

  function validate(data) {
    const e = {};
    if (!data.namaLengkap?.trim()) e.namaLengkap = "Nama lengkap diperlukan";
    if (!data.noTelepon?.trim()) e.noTelepon = "No. telepon diperlukan";
    if (!data.email?.trim()) e.email = "Email diperlukan";
    if (!data.alamatLengkap?.trim()) e.alamatLengkap = "Alamat diperlukan";
    if (!data.alasanPengajuan?.trim()) e.alasanPengajuan = "Jelaskan alasan pengajuan";
    if (!data.tanggalPengajuan) e.tanggalPengajuan = "Pilih tanggal pengajuan";
    return e;
  }

  function saveRequestToLocal(req) {
    try {
      const key = "requests";
      const raw = localStorage.getItem(key) || "[]";
      const arr = JSON.parse(raw);
      arr.unshift(req);
      localStorage.setItem(key, JSON.stringify(arr.slice(0, 50)));
      setRecentRequests(arr.slice(0, 50));
    } catch {}
  }

  function resetForm() {
    setFormData({
      namaLengkap: "",
      noTelepon: "",
      status: "",
      email: "",
      alamatLengkap: "",
      alasanPengajuan: "",
      tanggalPengajuan: "",
      dokumen: null,
      layananId: null,
    });
    setPreview(null);
    setErrors({});
    setUploadProgress(0);
    setFlash("");
  }

  function submitWithProgress(form, url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText || "{}")); } catch { resolve({}); }
        } else {
          reject({ status: xhr.status, text: xhr.responseText });
        }
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(form);
    });
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    setFlash("");
    const v = validate(formData);
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    const fd = new FormData();
    fd.append("nama", formData.namaLengkap);
    fd.append("noTelepon", formData.noTelepon);
    fd.append("status", formData.status || "");
    fd.append("email", formData.email);
    fd.append("alamatLengkap", formData.alamatLengkap);
    fd.append("catatan", formData.alasanPengajuan);
    fd.append("tanggalPengajuan", formData.tanggalPengajuan);
    if (formData.layananId) fd.append("layananId", String(formData.layananId));
    if (formData.dokumen) fd.append("gambar", formData.dokumen);

    setSubmitting(true);
    setUploadProgress(2);

    try {
      const created = await submitWithProgress(fd, `${API}/permohonan`);
      setFlash("Permintaan berhasil dikirim.");
      saveRequestToLocal({
        id: created.id || Date.now(),
        nama: formData.namaLengkap,
        tanggal: new Date().toISOString(),
        status: created.status || "pending",
        layananId: formData.layananId || null,
      });
      resetForm();
      if (formData.email) await syncPermohonan();
    } catch (err) {
      console.error("Submit permohonan error:", err);
      setFlash("Gagal mengirim. Coba lagi.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }

  function copyLink() {
    navigator.clipboard?.writeText(window.location.href);
    setFlash("Link halaman disalin.");
    setTimeout(() => setFlash(""), 2000);
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <header className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-slate-800">Layanan Publik Desa</h1>
            <p className="text-sm text-slate-500 mt-1">Pilih layanan yang Anda butuhkan. Pengajuan diproses oleh petugas desa.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari layanan, syarat, atau deskripsi..."
                className="pl-10 pr-3 py-2 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-200 focus:outline-none w-full bg-white"
              />
            </div>

            <button onClick={() => setShowAllDetails(v => !v)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm hover:bg-gray-50">
              {showAllDetails ? "Sembunyikan Isi Lengkap" : "Tampilkan Semua Isi Layanan"}
            </button>

            <button onClick={copyLink} className="px-3 py-2 bg-blue-600 text-white rounded-lg shadow-sm text-sm hover:bg-blue-700">Salin Link</button>
          </div>
        </header>

        <section className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex-shrink-0 text-xs px-4 py-2 rounded-full ${category === c ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(l => (
              <div key={l.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-transparent hover:border-gray-100 transition overflow-hidden">
                <div className="flex gap-4 p-4">
                  <img src={resolveImage(l.gambar || "")} alt={l.nama} className="w-28 h-20 object-cover rounded-md flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <h3 className="font-semibold text-slate-800">{l.nama}</h3>
                      <span className="ml-auto text-xs text-gray-500">{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ""}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-3">{l.syarat || l.catatan || "Tidak ada syarat terdaftar."}</p>

                    <div className="mt-4 flex items-center gap-2">
                      <button onClick={() => openDetail(l)} className="text-sm px-3 py-1 bg-white border rounded-md hover:bg-gray-50">Detail</button>
                      <button onClick={() => quickApply(l)} className="ml-auto text-sm px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md shadow-sm">Ajukan</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!filtered.length && (
              <div className="col-span-full text-center text-gray-500 py-8 bg-white rounded-lg">Tidak menemukan layanan yang cocok.</div>
            )}
          </div>
        </section>

        {showAllDetails && (
          <section className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Semua Isi Layanan (Detail Lengkap)</h2>
            <div className="space-y-4">
              {layananList.map((l) => (
                <article key={l.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-50">
                  <div className="flex flex-col md:flex-row gap-4">
                    <img src={resolveImage(l.gambar || "")} alt={l.nama} className="w-full md:w-64 h-44 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-800">{l.nama}</h3>
                      <div className="text-xs text-gray-400 mt-1">{l.createdAt ? new Date(l.createdAt).toLocaleString() : ""} {l.updatedAt ? ` • updated ${new Date(l.updatedAt).toLocaleString()}` : ""}</div>

                      <div className="mt-4">
                        <h4 className="font-medium text-slate-700">Persyaratan</h4>
                        <div className="text-sm text-slate-600 whitespace-pre-line mt-1">{l.syarat || "Tidak ada persyaratan terdaftar."}</div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium text-slate-700">Catatan / Deskripsi</h4>
                        <div className="text-sm text-slate-600 whitespace-pre-line mt-1">{l.catatan || l.isiForm || "Deskripsi tidak tersedia."}</div>
                      </div>

                      {l.isiForm && (
                        <div className="mt-4">
                          <h4 className="font-medium text-slate-700">Form Data (template)</h4>
                          <div className="mt-2">
                            <GoogleFormViewer text={l.isiForm} />
                          </div>
                        </div>
                      )}

                      <div className="mt-5 flex gap-3">
                        <button onClick={() => quickApply(l)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm">Ajukan</button>
                        <button onClick={() => openDetail(l)} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">Buka Modal</button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {!layananList.length && <div className="text-gray-500">Belum ada layanan terdaftar.</div>}
            </div>
          </section>
        )}

        <section ref={formRef} className="bg-gradient-to-r from-white to-sky-50 rounded-xl p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Pengajuan Anda</h2>
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-500">Lihat riwayat pengajuan Anda atau buat pengajuan baru.</div>
              <button onClick={syncPermohonan} className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50">Sinkronkan dengan Server</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Nama Lengkap</label>
                  <input name="namaLengkap" value={formData.namaLengkap} onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border ${errors.namaLengkap ? "border-red-400" : "border-gray-200"} bg-white`} />
                  {errors.namaLengkap && <div className="text-xs text-red-500 mt-1">{errors.namaLengkap}</div>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">No. Telepon</label>
                  <input name="noTelepon" value={formData.noTelepon} onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border ${errors.noTelepon ? "border-red-400" : "border-gray-200"} bg-white`} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Status</label>
                  <input name="status" value={formData.status} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white" placeholder="Contoh: Kepala Keluarga" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border ${errors.email ? "border-red-400" : "border-gray-200"} bg-white`} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Alamat Lengkap</label>
                <textarea name="alamatLengkap" value={formData.alamatLengkap} onChange={handleChange}
                  rows={3} className={`w-full px-3 py-2 rounded-lg border ${errors.alamatLengkap ? "border-red-400" : "border-gray-200"} bg-white`} />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Alasan Pengajuan / Catatan</label>
                <textarea name="alasanPengajuan" value={formData.alasanPengajuan} onChange={handleChange}
                  rows={4} className={`w-full px-3 py-2 rounded-lg border ${errors.alasanPengajuan ? "border-red-400" : "border-gray-200"} bg-white`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tanggal Pengajuan</label>
                  <input name="tanggalPengajuan" type="date" value={formData.tanggalPengajuan} onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border ${errors.tanggalPengajuan ? "border-red-400" : "border-gray-200"} bg-white`} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Pilih Layanan (opsional)</label>
                  <select name="layananId" value={formData.layananId || ""} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white">
                    <option value="">-- Pilih layanan --</option>
                    {layananList.map(l => <option key={l.id} value={l.id}>{l.nama}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Unggah Dokumen (jpg, png, pdf)</label>
                <input name="dokumen" type="file" accept="image/*,application/pdf" onChange={handleFileChange}
                  className="w-full text-sm" />
                {preview && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-28 h-28 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center border">
                      {formData.dokumen && formData.dokumen.type === "application/pdf" ? <div className="text-xs text-gray-600 px-2">PDF</div> : <img src={preview} alt="preview" className="object-cover w-full h-full" />}
                    </div>
                    <div className="text-sm text-slate-600">Preview dokumen terlampir</div>
                    <button type="button" onClick={() => { setFormData(p => ({ ...p, dokumen: null })); setPreview(null); }} className="ml-auto text-xs text-red-600">Hapus</button>
                  </div>
                )}
              </div>

              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded h-2 mt-2 overflow-hidden">
                  <div style={{ width: `${uploadProgress}%` }} className="h-2 bg-blue-600" />
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm">
                  {submitting ? "Mengirim..." : "Kirim Permohonan"}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-white border rounded-lg">Reset</button>
                <div className="ml-auto text-sm text-slate-600">{flash}</div>
              </div>
            </div>

            <aside className="bg-white rounded-lg p-4 shadow-sm space-y-4 border border-gray-50">
              <div>
                <h3 className="font-semibold">Layanan Populer</h3>
                <ul className="mt-2 space-y-3 text-sm">
                  {layananList.slice(0, 6).map(l => (
                    <li key={l.id} className="flex items-start gap-3">
                      <img src={resolveImage(l.gambar || "")} alt={l.nama} className="w-14 h-12 object-cover rounded-md" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{l.nama}</div>
                        <div className="text-xs text-slate-500">{(l.syarat || "").slice(0, 80)}</div>
                      </div>
                      <button onClick={() => quickApply(l)} className="text-xs text-blue-600">Ajukan</button>
                    </li>
                  ))}
                  {!layananList.length && <li className="text-xs text-gray-400">Belum ada layanan terdaftar</li>}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">Riwayat Pengajuan Anda</h3>
                <div className="mt-2 space-y-2 text-sm">
                  {(permohonanList.length ? permohonanList : recentRequests).length ? (permohonanList.length ? permohonanList : recentRequests).map(r => (
                    <div key={r.id} className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold">{r.nama}</div>
                        <div className="text-xs text-slate-500">{new Date(r.tanggal).toLocaleString()}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${r.status === "completed" || r.status === "Diterima" ? "bg-green-100 text-green-700" : r.status === "processing" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{r.status || "pending"}</div>
                    </div>
                  )) : <div className="text-xs text-gray-400">Belum ada permintaan</div>}
                </div>
                <div className="mt-2 text-xs text-slate-500">Tekan "Sinkronkan dengan Server" untuk melihat permohonan yang tersimpan di server.</div>
              </div>

              <div>
                <h3 className="font-semibold">Bantuan</h3>
                <div className="text-xs text-slate-600 mt-2">
                  Hubungi kantor desa jika membutuhkan bantuan pengisian. <button className="text-blue-600" onClick={() => navigate('/kontak')}>Kontak</button>
                </div>
              </div>
            </aside>
          </form>
        </section>

        {showModal && selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <div className="relative z-50 bg-white rounded-2xl shadow-xl w-11/12 md:w-3/4 max-h-[92vh] overflow-hidden">
              <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-50">✕</button>
              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-56 w-full flex-shrink-0">
                  <img src={resolveImage(selectedService.gambar || "")} alt={selectedService.nama} className="w-full h-56 md:h-full object-cover rounded-l-2xl" />
                </div>

                <div className="flex-1 overflow-auto p-6">
                  <header className="mb-3">
                    <h3 className="text-2xl font-bold text-slate-800">{selectedService.nama}</h3>
                    <div className="text-xs text-gray-500 mt-1">{selectedService.createdAt ? new Date(selectedService.createdAt).toLocaleString() : ""}{selectedService.updatedAt ? ` • updated ${new Date(selectedService.updatedAt).toLocaleString()}` : ""}</div>
                  </header>

                  <section className="mb-4">
                    <h4 className="font-medium text-slate-700">Persyaratan</h4>
                    <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">{selectedService.syarat || "Tidak ada persyaratan khusus."}</div>
                  </section>

                  <section className="mb-4">
                    <h4 className="font-medium text-slate-700">Catatan / Deskripsi</h4>
                    <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">{selectedService.catatan || "Deskripsi tidak tersedia."}</div>
                  </section>

                  {selectedService.isiForm && (
                    <section className="mb-4">
                      <h4 className="font-medium text-slate-700">Form Data (template)</h4>
                      <div className="mt-2">
                        <GoogleFormViewer text={selectedService.isiForm} />
                      </div>
                    </section>
                  )}

                  {selectedService.gambar && (
                    <section className="mb-4">
                      <h4 className="font-medium text-slate-700">Lampiran</h4>
                      <div className="mt-2 flex items-center gap-3">
                        <a className="text-sm text-blue-600 underline" href={`${API}${selectedService.gambar.startsWith('/') ? '' : '/'}${selectedService.gambar.replace(/^\//, '')}`} target="_blank" rel="noreferrer">Buka / Download Lampiran</a>
                      </div>
                    </section>
                  )}

                  <footer className="mt-6 flex gap-3">
                    <button onClick={() => { quickApply(selectedService); setShowModal(false); }} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm">Ajukan Sekarang</button>
                    <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="px-3 py-2 bg-white border rounded-lg">Salin Link</button>
                    <div className="ml-auto text-sm text-slate-500">Klik di luar modal untuk menutup.</div>
                  </footer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Navfooter />
    </>
  );
}
