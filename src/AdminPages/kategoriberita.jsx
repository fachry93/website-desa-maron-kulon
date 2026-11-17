import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar.jsx";
import api from "../api.js";

export default function TambahKategoriBerita() {
  const [kategori, setKategori] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/kategori");
      setList(res.data || []);
    } catch (e) {
      console.error("Load kategori error:", e);
      setError("Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(e) {
    e.preventDefault();
    if (!kategori.trim()) return setError("Nama kategori wajib diisi");
    setError("");
    try {
      const res = await api.post("/kategori", { nama: kategori });
      setList(prev => [...prev, res.data]);
      setKategori("");
    } catch (e) {
      console.error("Save kategori error:", e);
      setError(e?.response?.data?.error || "Gagal menyimpan");
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 bg-white px-6 py-10">
        <h1 className="text-lg font-semibold mb-6">Tambah Kategori Berita</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <form onSubmit={handleSave} className="bg-blue-100 p-4 rounded-md shadow-sm w-full h-fit">
            <label className="text-sm">Nama Kategori</label>
            <input
              type="text"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full mt-1 mb-3 px-2 py-1 border border-gray-300 rounded-sm bg-white outline-none text-sm"
            />
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <button type="submit" className="bg-blue-500 text-white text-xs px-4 py-1 rounded-sm hover:bg-blue-600">
              Save
            </button>
          </form>

          <div className="lg:col-span-3 bg-blue-100 p-6 rounded-md shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Daftar Kategori</h2>

            {loading && <div className="text-sm text-gray-500">Loading...</div>}

            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white rounded-md shadow-sm">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="py-2 px-3 text-left">No</th>
                    <th className="py-2 px-3 text-left">Nama</th>
                    <th className="py-2 px-3 text-left">Created At</th>
                  </tr>
                </thead>

                <tbody>
                  {list.map((k, i) => (
                    <tr key={k.id} className="border-t">
                      <td className="py-2 px-3">{i + 1}</td>
                      <td className="py-2 px-3">{k.nama}</td>
                      <td className="py-2 px-3 text-sm text-gray-600">{new Date(k.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {list.length === 0 && !loading && (
                    <tr className="border-t text-center">
                      <td colSpan="3" className="py-4 text-gray-500">Belum ada kategori</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        <footer className="text-center text-xs mt-12 text-gray-600">
          Copyright © 2025 All rights reserved | Desa Maron Kulon
        </footer>
      </main>
    </div>
  );
}
