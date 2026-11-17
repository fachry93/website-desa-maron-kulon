import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar.jsx";
import api from "../api.js";

export default function BeritaBaru() {
  const [judul, setJudul] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [gambarUrl, setGambarUrl] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kategoriList, setKategoriList] = useState([]);
  const [listBerita, setListBerita] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [gambarFile, setGambarFile] = useState(null);
  const [preview, setPreview] = useState("");

  async function loadKategori() {
    try {
      const res = await api.get("/kategori");
      setKategoriList(res.data || []);
    } catch (e) {
      console.error("Load kategori error:", e);
    }
  }

  async function loadBerita() {
    try {
      const res = await api.get("/berita");
      setListBerita(res.data || []);
    } catch (e) {
      console.error("Load berita error:", e);
    }
  }

  useEffect(() => {
    loadKategori();
    loadBerita();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (!judul.trim() || !kategoriId) {
      setMsg("Judul dan kategori wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("judul", judul.trim());
      fd.append("kategoriId", String(kategoriId)); // kirim sebagai string
      fd.append("deskripsi", deskripsi || "");
      fd.append("tanggal", tanggal ? new Date(tanggal).toISOString() : new Date().toISOString());
      if (gambarFile) {
        fd.append("gambar", gambarFile);
      } else if (gambarUrl) {
        fd.append("gambar", gambarUrl);
      }

      for (const pair of fd.entries()) console.log(pair[0], pair[1]);

      if (isEditing && editId) {
        const res = await api.patch(`/berita/${editId}`, fd); // jangan set Content-Type
        setMsg("Berita berhasil diperbarui");
        setListBerita((prev) => prev.map((b) => (b.id === res.data.id ? res.data : b)));
        setIsEditing(false);
        setEditId(null);
      } else {
        const res = await api.post("/berita", fd); // jangan set Content-Type
        setMsg("Berita berhasil diunggah");
        setListBerita((prev) => [...prev, res.data]);
      }

      // reset form
      setJudul("");
      setKategoriId("");
      setGambarUrl("");
      setGambarFile(null);
      setPreview("");
      setTanggal("");
      setDeskripsi("");
    } catch (err) {
      console.error("Submit berita error:", err);
      setMsg(err?.response?.data?.error || "Gagal mengunggah berita");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0] || null;
    setGambarFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview("");
  }

  function handleEdit(item) {
    setIsEditing(true);
    setEditId(item.id);

    // baca dari response API (coba beberapa kemungkinan nama properti)
    setJudul(item.judul || item.title || "");
    setKategoriId(String(
      // backend mungkin mengembalikan kategori object or kategoriId
      item.kategori?.id ?? item.kategoriId ?? ""
    ));
    // gambar bisa berada di imgSrc (mapped) atau gambar (raw)
    const g = item.imgSrc || item.gambar || "";
    setGambarUrl(g);
    setGambarFile(null);
    setPreview(g ? (g.startsWith("http") ? g : `${api.defaults.baseURL || ""}${g}`) : "");
    setTanggal(item.tanggal ? new Date(item.tanggal).toISOString().slice(0, 10) : "");
    // deskripsi bisa di content atau deskripsi
    setDeskripsi(item.content || item.deskripsi || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!confirm("Hapus berita ini?")) return;
    try {
      await api.delete(`/berita/${id}`);
      setListBerita((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Delete berita error:", err);
      alert("Gagal menghapus berita");
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-lg font-semibold mb-6">Berita Baru</h1>

        <form onSubmit={handleSubmit} className="bg-blue-100 p-6 rounded-lg shadow max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Judul</label>
              <input
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                type="text"
                className="w-full border bg-white p-2 rounded mt-1"
                placeholder="Masukkan judul"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Kategori</label>
              <select
                value={kategoriId}
                onChange={(e) => setKategoriId(e.target.value)}
                className="w-full border bg-white p-2 rounded mt-1"
              >
                <option value="">Pilih kategori</option>
                {kategoriList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Gambar (file)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border bg-white p-2 rounded mt-1"
              />
              <div className="text-xs text-gray-500 mt-1">Atau isi URL di bawah jika pakai gambar eksternal.</div>
              <input
                value={gambarUrl}
                onChange={(e) => setGambarUrl(e.target.value)}
                type="text"
                className="w-full border bg-white p-2 rounded mt-2"
                placeholder="https://... (opsional)"
              />
              {preview ? (
                <img src={preview} alt="preview" className="mt-2 w-full max-h-48 object-cover rounded" />
              ) : gambarUrl ? (
                <img src={gambarUrl.startsWith("http") ? gambarUrl : `${api.defaults.baseURL || ""}${gambarUrl}`} alt="current" className="mt-2 w-full max-h-48 object-cover rounded" />
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tanggal Publish</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  type="date"
                  className="w-full border bg-white p-2 rounded"
                />
                <span className="text-blue-600 text-lg">📅</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full border bg-white p-2 rounded mt-1 h-64 resize-y"
              placeholder="Tulis isi berita lengkap di sini. Dapat menggunakan paragraf dan baris baru."
            />
          </div>

          {msg && <div className="mt-3 text-sm text-red-600">{msg}</div>}

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded"
            >
              {loading ? "Menyimpan..." : isEditing ? "Perbarui" : "Upload"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditId(null);
                  setJudul("");
                  setKategoriId("");
                  setGambarUrl("");
                  setGambarFile(null);
                  setPreview("");
                  setTanggal("");
                  setDeskripsi("");
                }}
                className="ml-3 bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* CRUD List */}
        <section className="max-w-6xl mx-auto mt-8 bg-white p-4 rounded shadow">
          <h2 className="text-md font-semibold mb-4">Daftar Berita</h2>

          {listBerita.length === 0 ? (
            <div className="text-sm text-gray-500">Belum ada berita.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-3 text-left">No</th>
                    <th className="py-2 px-3 text-left">Judul</th>
                    <th className="py-2 px-3 text-left">Gambar</th>
                    <th className="py-2 px-3 text-left">Kategori</th>
                    <th className="py-2 px-3 text-left">Tanggal</th>
                    <th className="py-2 px-3 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {listBerita.map((b, i) => (
                    <tr key={b.id} className="border-t">
                      <td className="py-2 px-3">{i + 1}</td>
                      <td className="py-2 px-3">{b.judul}</td>
                      <td className="py-2 px-3">
                        {b.gambar ? (
                          <img src={b.gambar.startsWith("http") ? b.gambar : `${api.defaults.baseURL || ""}${b.gambar}`} alt={b.judul} className="w-28 h-16 object-cover rounded" />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-3">{b.kategori?.nama || b.kategoriId || "-"}</td>
                      <td className="py-2 px-3">{b.tanggal ? new Date(b.tanggal).toLocaleString() : "-"}</td>
                      <td className="py-2 px-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(b)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                          <button onClick={() => handleDelete(b.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="text-center py-4 text-sm text-gray-600 mt-6">
          Copyright © 2025 All rights reserved | Desa Maron Kulon
        </footer>
      </main>
    </div>
  );
}
