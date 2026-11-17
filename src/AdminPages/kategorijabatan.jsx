import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar.jsx";
import api from "../api.js";

export default function KategoriJabatan() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [nama, setNama] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/kategorijabatan"); // sesuaikan endpoint backend jika beda
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Load kategori jabatan error:", err);
      setMsg("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  function startAdd() {
    setEditingId(null);
    setNama("");
    setShowForm(true);
    setMsg("");
  }

  function startEdit(item) {
    setEditingId(item.id);
    setNama(item.nama || "");
    setShowForm(true);
    setMsg("");
  }

  async function handleSave(e) {
    e?.preventDefault();
    if (!nama.trim()) return setMsg("Nama kategori wajib diisi");
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/kategorijabatan/${editingId}`, { nama: nama.trim() });
        setMsg("Kategori diupdate");
      } else {
        await api.post("/kategorijabatan", { nama: nama.trim() });
        setMsg("Kategori ditambahkan");
      }
      setShowForm(false);
      await load();
    } catch (err) {
      console.error("Save kategori error:", err);
      setMsg(err?.response?.data?.error || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus kategori ini?")) return;
    try {
      await api.delete(`/kategorijabatan/${id}`);
      setMsg("Kategori dihapus");
      load();
    } catch (err) {
      console.error("Delete kategori error:", err);
      setMsg("Gagal menghapus");
    }
  }

  const filtered = list.filter((it) => it.nama?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Kategori Jabatan</h1>
            <div className="flex items-center gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari..."
                className="border rounded px-3 py-2"
              />
              <button onClick={startAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
                + Tambah Jabatan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 bg-blue-50 p-6 rounded shadow">
              <div className="font-semibold mb-3">Nama Kategori Jabatan</div>
              {showForm ? (
                <form onSubmit={handleSave} className="space-y-3">
                  <input
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Masukkan kategori"
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
                      {saving ? "Menyimpan..." : editingId ? "Update" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingId(null); setNama(""); setMsg(""); }}
                      className="bg-gray-200 px-4 py-2 rounded"
                    >
                      Batal
                    </button>
                  </div>
                  {msg && <div className="text-sm text-red-600">{msg}</div>}
                </form>
              ) : (
                <div className="text-sm text-gray-600">Klik "+ Tambah Jabatan" untuk menambahkan kategori baru.</div>
              )}
            </div>

            <div className="lg:col-span-3 bg-white rounded shadow overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">No</th>
                    <th className="px-4 py-3 text-left">Nama</th>
                    <th className="px-4 py-3 text-left">Created At</th>
                    <th className="px-4 py-3 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4" className="p-6 text-center">Memuat...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="4" className="p-6 text-center">Tidak ada data</td></tr>
                  ) : (
                    filtered.map((it, idx) => (
                      <tr key={it.id} className="border-b">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">{it.nama}</td>
                        <td className="px-4 py-3">{it.createdAt ? new Date(it.createdAt).toLocaleString() : "-"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => startEdit(it)} className="px-3 py-1 bg-yellow-400 text-white rounded">Ubah</button>
                            <button onClick={() => handleDelete(it.id)} className="px-3 py-1 bg-red-500 text-white rounded">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Copyright © 2025 All rights reserved | Desa Maron Kulon
          </p>
        </div>
      </main>
    </div>
  );
}