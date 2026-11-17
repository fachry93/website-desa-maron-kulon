import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./sidebar.jsx";
import api from "../api.js";

export default function TambahStaf() {
  const navigate = useNavigate();
  // helper: convert backend path -> full URL for preview
  const getPublicUrl = (p) => {
    if (!p) return null;
    if (/^https?:\/\//.test(p)) return p;
    // prefer axios baseURL from api instance, fallback to env var
    const base = (api && api.defaults && api.defaults.baseURL) || import.meta.env.VITE_API_URL || "";
    const trimmed = base.replace(/\/$/, "");
    return p.startsWith("/") ? `${trimmed}${p}` : `${trimmed}/${p}`;
  };
  const [editingId, setEditingId] = useState(null); // <-- new: id yang sedang diedit

  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [telepon, setTelepon] = useState("");
  const [email, setEmail] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [agama, setAgama] = useState("");
  const [pendidikan, setPendidikan] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [listStaf, setListStaf] = useState([]); // <-- new: daftar staf

  useEffect(() => {
    async function loadJabatan() {
      try {
        const res = await api.get("/kategorijabatan");
        setJabatanOptions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Load kategori jabatan failed:", err);
      }
    }
    loadJabatan();
    loadStaff(); // load staf on mount
  }, []);

  async function loadStaff() {
    try {
      const res = await api.get("/staf"); // pastikan backend menyediakan GET /staf
      console.log("loadStaff res:", res?.data); // debug
      setListStaf(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Load staf failed:", err);
    }
  }

  const handlePhotoChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setPhotoFile(f);
      setPhotoPreview(URL.createObjectURL(f));
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!nik.trim() || !nama.trim()) {
      setMsg("NIK dan Nama wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nik", nik.trim());
      formData.append("nama", nama.trim());
      if (jabatan) formData.append("jabatan", jabatan);
      if (telepon) formData.append("telepon", telepon);
      if (email) formData.append("email", email);
      if (tempatLahir) formData.append("tempatLahir", tempatLahir);
      if (tanggalLahir) formData.append("tanggalLahir", tanggalLahir);
      if (jenisKelamin) formData.append("jenisKelamin", jenisKelamin);
      if (agama) formData.append("agama", agama);
      if (pendidikan) formData.append("pendidikan", pendidikan);
      if (photoFile) formData.append("photo", photoFile);

      let res;
      if (editingId) {
        // edit existing staf
        res = await api.patch(`/staf/${editingId}`, formData);
      } else {
        // create new staf
        res = await api.post("/staf", formData);
      }
      console.log("POST /staf response:", res?.data); // debug
      // tambah data baru ke daftar agar langsung tampil di bawah form
      if (res?.data) {
        if (editingId) {
          setListStaf(prev => prev.map(it => (it.id === editingId ? res.data : it)));
        } else {
          setListStaf(prev => [res.data, ...prev]);
        }
      }
      setMsg("Staf berhasil disimpan");
      // reset form
      setNik(""); setNama(""); setJabatan(""); setTelepon(""); setEmail("");
      setTempatLahir(""); setTanggalLahir(""); setJenisKelamin("");
      setAgama(""); setPendidikan(""); setPhotoFile(null); setPhotoPreview(null);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.error || "Gagal menyimpan staf");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg p-8 shadow">
          <h1 className="text-xl font-semibold mb-6">Tambah Staf</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium">NIK</label>
                  <input value={nik} onChange={(e) => setNik(e.target.value)} type="text" className="w-full border px-3 py-2 rounded-md" />
                </div>

                <div>
                  <label className="text-sm font-medium">Nama Lengkap</label>
                  <input value={nama} onChange={(e) => setNama(e.target.value)} type="text" className="w-full border px-3 py-2 rounded-md" />
                </div>

                <div>
                  <label className="text-sm font-medium">Jabatan</label>
                  <input
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    list="jabatan-list"
                    type="text"
                    className="w-full border px-3 py-2 rounded-md"
                    placeholder="Pilih atau ketik jabatan"
                  />
                  <datalist id="jabatan-list">
                    {jabatanOptions.map((k) => <option key={k.id} value={k.nama} />)}
                  </datalist>
                </div>

                <div>
                  <label className="text-sm font-medium">No. Telepon</label>
                  <input value={telepon} onChange={(e) => setTelepon(e.target.value)} type="text" className="w-full border px-3 py-2 rounded-md" />
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full border px-3 py-2 rounded-md" />
                </div>

                <div>
                  <label className="text-sm font-medium">Tempat Lahir</label>
                  <input value={tempatLahir} onChange={(e) => setTempatLahir(e.target.value)} type="text" className="w-full border px-3 py-2 rounded-md" />
                </div>

                <div>
                  <label className="text-sm font-medium">Tanggal Lahir</label>
                  <input value={tanggalLahir} onChange={(e) => setTanggalLahir(e.target.value)} type="date" className="w-full border px-3 py-2 rounded-md" />
                </div>

                <div>
                  <label className="text-sm font-medium">Jenis Kelamin</label>
                  <select value={jenisKelamin} onChange={(e) => setJenisKelamin(e.target.value)} className="w-full border px-3 py-2 rounded-md">
                    <option value="">Pilih</option>
                    <option value="Laki - Laki">Laki - Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Agama</label>
                  <input value={agama} onChange={(e) => setAgama(e.target.value)} type="text" className="w-full border px-3 py-2 rounded-md" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Pendidikan</label>
                  <input value={pendidikan} onChange={(e) => setPendidikan(e.target.value)} type="text" className="w-full border px-3 py-2 rounded-md" />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-md" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
                {editingId && (
                  <button type="button" onClick={() => {
                    setEditingId(null);
                    setNik(""); setNama(""); setJabatan(""); setTelepon(""); setEmail("");
                    setTempatLahir(""); setTanggalLahir(""); setJenisKelamin("");
                    setAgama(""); setPendidikan(""); setPhotoFile(null); setPhotoPreview(null); setMsg("");
                  }} className="px-8 py-2 bg-gray-500 text-white rounded-md">
                    Batal Edit
                  </button>
                )}
                <button type="button" onClick={() => {
                  setNik(""); setNama(""); setJabatan(""); setTelepon(""); setEmail("");
                  setTempatLahir(""); setTanggalLahir(""); setJenisKelamin("");
                  setAgama(""); setPendidikan(""); setPhotoFile(null); setPhotoPreview(null); setMsg("");
                }} className="px-8 py-2 bg-red-500 text-white rounded-md">
                  Batal
                </button>
                {msg && <div className="text-sm text-gray-700 ml-4">{msg}</div>}
              </div>
            </div>

            {/* FOTO */}
            <div className="flex flex-col justify-start items-center">
              <div className="w-44 h-44 border rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} className="w-full h-full object-cover" alt="preview" />
                ) : (
                  <svg className="w-28 h-28 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.33 0-6 2.67-6 6h12c0-3.33-2.67-6-6-6z" />
                  </svg>
                )}
              </div>

              <label className="mt-5 w-full text-center cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md">
                Unggah
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>

              <button type="button" className="mt-3 w-full px-4 py-2 bg-red-500 text-white rounded-md" onClick={() => {
                // ubah = clear preview to choose another file
                setPhotoFile(null);
                setPhotoPreview(null);
                // trigger file input click? the label above is cukup untuk upload.
              }}>
                Ubah
              </button>
            </div>
          </form>

          {/* LIST STAF: tampil di bawah form */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Daftar Staf</h2>
            {listStaf.length === 0 ? (
              <div className="text-sm text-gray-500">Belum ada staf</div>
            ) : (
              <div className="overflow-x-auto bg-white rounded shadow">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">#</th>
                      <th className="px-4 py-2 text-left">NIK</th>
                      <th className="px-4 py-2 text-left">Nama</th>
                      <th className="px-4 py-2 text-left">Jabatan</th>
                      <th className="px-4 py-2 text-left">Telepon</th>
                      <th className="px-4 py-2 text-left">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listStaf.map((s, idx) => (
                      <tr key={s.id || idx} className="border-t">
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2">{s.nik}</td>
                        <td className="px-4 py-2">{s.nama}</td>
                        <td className="px-4 py-2">{s.jabatan || "-"}</td>
                        <td className="px-4 py-2">{s.telepon || "-"}</td>
                        <td className="px-4 py-2">
                          <button type="button" className="px-3 py-1 bg-yellow-400 text-white rounded mr-2" onClick={() => {
                            // populate form fields for editing
                            setEditingId(s.id);
                            setNik(s.nik || "");
                            setNama(s.nama || "");
                            setJabatan(s.jabatan || "");
                            setTelepon(s.telepon || "");
                            setEmail(s.email || "");
                            setTempatLahir(s.tempatLahir || "");
                            setTanggalLahir(s.tanggalLahir ? String(s.tanggalLahir).slice(0,10) : "");
                            setJenisKelamin(s.jenisKelamin || "");
                            setAgama(s.agama || "");
                            setPendidikan(s.pendidikan || "");
                            setPhotoPreview(getPublicUrl(s.photo || s.foto || null));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}>Ubah</button>
                          <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={async () => {
                            if (!confirm("Hapus staf ini?")) return;
                            try {
                              await api.delete(`/staf/${s.id}`);
                              setListStaf(prev => prev.filter(it => it.id !== s.id));
                            } catch (err) {
                              console.error("Hapus staf error", err);
                              alert("Gagal menghapus");
                            }
                          }}>Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Copyright © 2025 All rights reserved | Desa Maron Kulon
          </p>
        </div>
      </main>
    </div>
  );
}