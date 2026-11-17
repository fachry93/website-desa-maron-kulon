import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar.jsx";
import api from "../api.js";
import { useNavigate } from "react-router-dom";

export default function KategoriPenduduk() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({ open: false, data: null });
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/penduduk");
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Load penduduk failed:", e);
      setList([]);
    } finally { setLoading(false); }
  }

  const computeStatus = (p) => {
    const s = (p.status || "").toString().toLowerCase();
    if (s.includes("tidak")) return "Tidak Mampu";
    if (s.includes("mampu")) return "Mampu";
    return "-";
  };

  // improved: case-insensitive search for nama / nik / nomorKK
  const filtr = (arr, type) => {
    const ql = q.trim().toLowerCase();
    return arr.filter(p => {
      if (type === "mampu" && computeStatus(p) !== "Mampu") return false;
      if (type === "tidak" && computeStatus(p) !== "Tidak Mampu") return false;
      if (!ql) return true;

      const nama = (p.nama || "").toString().toLowerCase();
      const nik = (p.nik || "").toString().toLowerCase();
      const kk = (p.nomorKK || "").toString().toLowerCase();

      return nama.includes(ql) || nik.includes(ql) || kk.includes(ql);
    });
  };

  const mampuList = list.filter(p => computeStatus(p) === "Mampu");
  const tidakList = list.filter(p => computeStatus(p) === "Tidak Mampu");

  // navigasi ke halaman TambahPenduduk untuk tambah / edit
  function openNew() { navigate("/tambahpenduduk"); }
  function openEdit(p) { navigate(`/tambahpenduduk?id=${p.id}`); }
  function openInfo(p) { setModal({ open: true, data: p }); }

  async function handleDelete(id) {
    if (!confirm("Hapus data penduduk ini?")) return;
    try {
      await api.delete(`/penduduk/${id}`);
      setList(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal menghapus. Pastikan backend mendukung delete /penduduk/:id");
    }
  }

  // small responsive table/card component
  const RenderList = ({ title, data }) => (
    <section className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title} <span className="text-sm text-gray-500">({data.length})</span></h3>
        <div className="flex items-center gap-2">
          <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(data.slice(0,50))); }} className="text-xs px-2 py-1 border rounded text-gray-600 hover:bg-gray-50">Export</button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-sm text-gray-500">Belum ada data.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-2 text-left w-12">No</th>
                <th className="p-2 text-left">Nomor KK</th>
                <th className="p-2 text-left">Nama</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 align-top">{i+1}</td>
                  <td className="p-2">{p.nomorKK || "-"}</td>
                  <td className="p-2">{p.nama}</td>
                  <td className="p-2">{computeStatus(p)}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="px-2 py-1 bg-yellow-400 rounded text-xs">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="px-2 py-1 bg-red-500 rounded text-xs text-white">Hapus</button>
                      <button onClick={() => openInfo(p)} className="px-2 py-1 bg-blue-500 rounded text-xs text-white">Informasi</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Kategori Penduduk</h1>
            <div className="flex items-center gap-3">
              {/* langsung ke halaman TambahPenduduk */}
              <button onClick={openNew} className="px-4 py-2 bg-blue-600 text-white rounded">Tambah Penduduk</button>
              <button onClick={load} className="px-3 py-2 border rounded">Refresh</button>
            </div>
          </div>

          {/* search + summary */}
          <div className="bg-white rounded-lg p-4 shadow mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">Total: <span className="font-medium">{list.length}</span></div>
              <div className="text-sm text-gray-600">Mampu: <span className="font-medium">{mampuList.length}</span></div>
              <div className="text-sm text-gray-600">Tidak Mampu: <span className="font-medium">{tidakList.length}</span></div>
            </div>
            <div className="flex items-center gap-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / NIK / KK" className="border px-3 py-2 rounded w-64" />
            </div>
          </div>

          {/* form dihapus dari sini. Gunakan halaman TambahPenduduk untuk tambah/edit. */}

          {/* two-column responsive lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RenderList title="Penduduk Tidak Mampu" data={filtr(tidakList, "tidak")} />
            <RenderList title="Penduduk Mampu" data={filtr(mampuList, "mampu")} />
          </div>

          <footer className="text-center text-sm text-gray-500 mt-10">Copyright © 2025 Desa Maron Kulon</footer>
        </div>
      </main>

      {/* modal */}
      {modal.open && modal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Informasi Penduduk</h3>
              <button onClick={() => setModal({ open: false, data: null })} className="text-gray-500">Tutup</button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><strong>NIK:</strong> {modal.data.nik || "-"}</div>
              <div><strong>Nama:</strong> {modal.data.nama || "-"}</div>
              <div><strong>No. KK:</strong> {modal.data.nomorKK || "-"}</div>
              <div><strong>Status:</strong> {computeStatus(modal.data)}</div>
              <div className="md:col-span-2"><strong>Alamat:</strong> { [modal.data.alamat, modal.data.rt && `RT ${modal.data.rt}`, modal.data.rw && `RW ${modal.data.rw}`].filter(Boolean).join(", ") || "-" }</div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setModal({ open: false, data: null })} className="px-4 py-2 bg-blue-600 text-white rounded">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}