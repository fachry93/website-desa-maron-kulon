import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar.jsx";
import api from "../api.js";

export default function Layanan() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    gambar: "", // keep existing path if editing
    syarat: "",
    catatan: "",
    isiForm: "",
  });
  const [gambarFile, setGambarFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/layanan");
      setList(res.data || []);
    } catch (e) {
      console.error("Load layanan error:", e);
      setError("Gagal memuat layanan (cek backend /layanan)");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm({ nama: "", gambar: "", syarat: "", catatan: "", isiForm: "" });
    setGambarFile(null);
    setPreview("");
    setIsEditing(false);
    setEditId(null);
    setError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    if (!form.nama.trim()) return setError("Nama layanan wajib diisi");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("nama", form.nama);
      fd.append("syarat", form.syarat || "");
      fd.append("catatan", form.catatan || "");
      fd.append("isiForm", form.isiForm || "");
      // append file only if user selected a new file
      if (gambarFile) fd.append("gambar", gambarFile);
      // if not uploading file (new) and editing, keep existing path by sending gambar field
      if (!gambarFile && isEditing && form.gambar) fd.append("gambar", form.gambar);

      if (isEditing && editId) {
        const res = await api.patch(`/layanan/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setList((prev) => prev.map((it) => (it.id === res.data.id ? res.data : it)));
      } else {
        const res = await api.post("/layanan", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setList((prev) => [res.data, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error("Save layanan error:", err);
      setError(err?.response?.data?.error || "Gagal menyimpan layanan");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0] || null;
    setGambarFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview("");
    }
  }

  function handleEdit(item) {
    setForm({
      nama: item.nama || "",
      gambar: item.gambar || "",
      syarat: item.syarat || "",
      catatan: item.catatan || "",
      isiForm: item.isiForm || "",
    });
    setGambarFile(null);
    setPreview(item.gambar ? (item.gambar.startsWith('http') ? item.gambar : `${api.defaults?.baseURL || ''}${item.gambar}`) : "");
    setIsEditing(true);
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!confirm("Hapus layanan ini?")) return;
    try {
      await api.delete(`/layanan/${id}`);
      setList((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Delete layanan error:", err);
      alert("Gagal menghapus layanan");
    }
  }

  const base = api.defaults?.baseURL || "";

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <h1 className="text-xl font-semibold text-gray-700 mb-6">Layanan</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Form */}
          <form onSubmit={handleSave} className="bg-blue-200 w-full md:w-72 p-5 rounded-md shadow space-y-3">
            <label className="text-sm font-medium text-gray-700">Jenis Layanan</label>
            <input
              value={form.nama}
              onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
              type="text"
              className="w-full mt-1 p-2 rounded border bg-white"
              placeholder="Masukkan Layanan"
            />

            <label className="text-sm font-medium text-gray-700">Masukkan gambar (file)</label>
            <input
              onChange={handleFileChange}
              type="file"
              accept="image/*"
              className="w-full mt-1 p-1 rounded border bg-white text-xs"
            />
            {/* preview */}
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-40 object-cover rounded" />
            ) : form.gambar ? (
              <img src={form.gambar.startsWith('http') ? form.gambar : `${base}${form.gambar}`} alt="current" className="w-full h-40 object-cover rounded" />
            ) : (
              <div className="text-xs text-gray-400">No image</div>
            )}

            <label className="text-sm font-medium text-gray-700">Syarat</label>
            <textarea
              value={form.syarat}
              onChange={(e) => setForm((f) => ({ ...f, syarat: e.target.value }))}
              className="w-full mt-1 p-2 rounded border bg-white h-20 text-sm"
              placeholder="Masukkan Deskripsi Syarat"
            />

            <label className="text-sm font-medium text-gray-700">Catatan</label>
            <textarea
              value={form.catatan}
              onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))}
              className="w-full mt-1 p-2 rounded border bg-white h-20 text-sm"
              placeholder="Masukkan Catatan"
            />

            <label className="text-sm font-medium text-gray-700">Isi Form</label>
            <textarea
              value={form.isiForm}
              onChange={(e) => setForm((f) => ({ ...f, isiForm: e.target.value }))}
              className="w-full mt-1 p-2 rounded border bg-white h-24 text-sm"
              placeholder="Format / fields yang diperlukan"
            />

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="mt-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1 rounded">
                {loading ? "Menyimpan..." : isEditing ? "Perbarui" : "Save"}
              </button>
              <button type="button" onClick={resetForm} className="mt-1 bg-gray-300 hover:bg-gray-400 text-black text-xs px-4 py-1 rounded">
                Batal
              </button>
            </div>
          </form>

          {/* List */}
          <div className="flex-1 bg-blue-100 p-4 rounded shadow overflow-x-auto">
            <h2 className="font-semibold mb-4">Layanan yang sedang berjalan</h2>

            {loading && list.length === 0 && <div className="text-sm text-gray-500">Loading...</div>}
            {!loading && list.length === 0 && <div className="text-sm text-gray-500">Belum ada layanan.</div>}

            <div className="min-w-full">
              <table className="w-full text-sm table-fixed">
                <thead>
                  <tr className="bg-white">
                    <th className="py-2 px-2 w-8">No</th>
                    <th className="py-2 px-2 text-left">Nama Layanan</th>
                    <th className="py-2 px-2 text-left w-48">Gambar</th>
                    <th className="py-2 px-2 text-left">Syarat</th>
                    <th className="py-2 px-2 text-left">Catatan</th>
                    <th className="py-2 px-2 w-36">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item, idx) => (
                    <tr key={item.id} className="border-t bg-white">
                      <td className="py-2 px-2 text-center">{idx + 1}</td>
                      <td className="py-2 px-2">{item.nama}</td>
                      <td className="py-2 px-2">
                        {item.gambar ? (
                          <img
                            src={item.gambar.startsWith('http') ? item.gambar : `${base}${item.gambar}`}
                            alt={item.nama}
                            className="w-full md:w-32 h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="text-xs text-gray-400">No image</div>
                        )}
                      </td>
                      <td className="py-2 px-2 text-sm">{item.syarat || "-"}</td>
                      <td className="py-2 px-2 text-sm">{item.catatan || "-"}</td>
                      <td className="py-2 px-2">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(item)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        <footer className="text-center py-4 text-sm text-gray-600 mt-6">
          Copyright © 2025 All rights reserved | Desa Maron Kulon
        </footer>
      </main>
    </div>
  );
}
