import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar.jsx";
import api from "../api.js";

export default function PermohonanAdmin() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/permohonan");
      setList(res.data || []);
    } catch (e) {
      console.error("Load permohonan error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, next) {
    setStatusUpdating(true);
    try {
      const res = await api.patch(`/permohonan/${id}`, { status: next });
      setList(l => l.map(it => it.id === id ? res.data : it));
    } catch (e) {
      console.error("Update status error:", e);
      alert("Gagal mengubah status");
    } finally {
      setStatusUpdating(false);
    }
  }

  async function remove(id) {
    if (!confirm("Hapus permohonan?")) return;
    try {
      await api.delete(`/permohonan/${id}`);
      setList(l => l.filter(x => x.id !== id));
    } catch (e) {
      console.error("Delete permohonan error:", e);
      alert("Gagal menghapus");
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-bold mb-4">Permohonan Layanan</h1>
        {loading ? <div>Loading...</div> : (
          <div className="bg-white rounded shadow p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th>No</th><th>Nama</th><th>Layanan</th><th>Tanggal</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p, i) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2">{i+1}</td>
                    <td>{p.nama}<div className="text-xs text-gray-500">{p.email || "-"}</div></td>
                    <td>{p.layanan?.nama || "-"}</td>
                    <td>{new Date(p.tanggalPengajuan).toLocaleString()}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-xs ${p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : p.status === 'processing' ? 'bg-blue-100 text-blue-700' : p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(p)} className="text-xs px-2 py-1 bg-gray-100 rounded">View</button>
                        <button onClick={() => updateStatus(p.id, 'processing')} disabled={statusUpdating} className="text-xs px-2 py-1 bg-blue-500 text-white rounded">Process</button>
                        <button onClick={() => updateStatus(p.id, 'completed')} disabled={statusUpdating} className="text-xs px-2 py-1 bg-green-500 text-white rounded">Done</button>
                        <button onClick={() => updateStatus(p.id, 'rejected')} disabled={statusUpdating} className="text-xs px-2 py-1 bg-red-500 text-white rounded">Reject</button>
                        <button onClick={() => remove(p.id)} className="text-xs px-2 py-1 bg-red-200 rounded">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!list.length && <tr><td colSpan={6} className="py-4 text-center text-gray-500">No requests</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <div className="mt-6 bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{selected.nama}</h3>
                <div className="text-xs text-gray-500">{selected.email} • {selected.noTelepon}</div>
                <div className="text-xs text-gray-500">{selected.alamat}</div>
              </div>
              <div>
                <button onClick={() => setSelected(null)} className="text-xs text-gray-500">Close</button>
              </div>
            </div>

            <div className="mt-3 text-sm">
              <p><strong>Catatan:</strong> {selected.catatan || '-'}</p>
              <p className="mt-2"><strong>Layanan:</strong> {selected.layanan?.nama || '-'}</p>
              {selected.gambar && (
                <div className="mt-3">
                  <a className="text-blue-600 text-sm" href={`${api.defaults?.baseURL || ''}${selected.gambar}`} target="_blank" rel="noreferrer">Download Lampiran</a>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}