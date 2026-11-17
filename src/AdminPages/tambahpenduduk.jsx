import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar.jsx";
import api from "../api.js";
import { useLocation, useNavigate } from "react-router-dom";

export default function TambahPenduduk() {
  const loc = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(loc.search);
  const editId = params.get("id") ? Number(params.get("id")) : null;

  const [preview, setPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // form state (fields that exist in prisma penduduk model)
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [nomorKK, setNomorKK] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [agama, setAgama] = useState("");
  const [status, setStatus] = useState("");
  const [alamat, setAlamat] = useState("");
  const [rt, setRt] = useState("");
  const [rw, setRw] = useState("");
  // additional frontend-only fields
  const [dusun, setDusun] = useState("");
  const [kelurahan, setKelurahan] = useState("");
  const [pekerjaan, setPekerjaan] = useState("");
  const [gaji, setGaji] = useState(""); // number as string
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!editId) return;
    setLoading(true);
    (async () => {
      try {
        // try GET /penduduk/:id, fallback to list-find if endpoint not available
        try {
          const res = await api.get(`/penduduk/${editId}`);
          if (res?.data) fillForm(res.data);
        } catch (e) {
          const res = await api.get("/penduduk");
          const list = Array.isArray(res.data) ? res.data : [];
          const item = list.find((x) => Number(x.id) === editId);
          if (item) fillForm(item);
        }
      } catch (err) {
        console.error("Load penduduk for edit failed:", err);
        setMsg("Gagal memuat data untuk edit.");
      } finally {
        setLoading(false);
      }
    })();
  }, [editId]);

  function makeUrl(u) {
    if (!u) return null;
    // sudah absolute?
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    // gunakan baseURL dari axios instance jika tersedia, fallback ke window origin
    const base = api && api.defaults && api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, "") : window.location.origin;
    // pastikan leading slash
    return u.startsWith("/") ? `${base}${u}` : `${base}/${u}`;
  }

  function fillForm(p) {
    setNik(p.nik || "");
    setNama(p.nama || "");
    setNomorKK(p.nomorKK || "");
    setJenisKelamin(p.jenisKelamin || "");
    setAgama(p.agama || "");
    setAlamat(p.alamat || "");
    setRt(p.rt || "");
    setRw(p.rw || "");
    setStatus(p.status || "");

    // jika backend menyimpan path (mis. /uploads/xxx) tampilkan preview sebagai URL lengkap
    if (p.photo) {
      setPreview(makeUrl(p.photo));
      setPhotoFile(null); // belum diubah oleh admin -> tidak akan dikirim ulang
    } else {
      setPreview(null);
    }

    if (p.slip) {
      setSlipPreview(makeUrl(p.slip));
    } else {
      setSlipPreview("");
    }

    // frontend-only fields (jika disimpan di backend)
    if (p.pekerjaan) setPekerjaan(p.pekerjaan);
    if (p.dusun) setDusun(p.dusun);
    if (p.kelurahan) setKelurahan(p.kelurahan);
    if (p.gaji != null) setGaji(String(p.gaji));
  }

  const handleSlipUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
    } else {
      setSlipFile(null);
      setSlipPreview("");
    }
  };

  // handle upload foto profil (opsional)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setPhotoFile(null);
      setPreview(null);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (!nik.trim() || !nama.trim()) {
      setMsg("NIK dan Nama wajib diisi");
      return;
    }

    // compute status based on gaji (frontend rule)
    const gajiNum = gaji ? Number(gaji.toString().replace(/[^0-9]/g, "")) : 0;
    const computedStatus = gajiNum > 0 ? (gajiNum < 2000000 ? "Tidak Mampu" : "Mampu") : status || "";

    setLoading(true);
    try {
      // gunakan FormData agar file bisa dikirim
      const formData = new FormData();
      formData.append("nik", nik.trim());
      formData.append("nama", nama.trim());
      if (nomorKK.trim()) formData.append("nomorKK", nomorKK.trim());
      if (jenisKelamin) formData.append("jenisKelamin", jenisKelamin);
      if (agama) formData.append("agama", agama);
      if (alamat) formData.append("alamat", alamat);
      if (rt) formData.append("rt", rt);
      if (rw) formData.append("rw", rw);
      if (computedStatus) formData.append("status", computedStatus);

      // frontend-only fields (tambahkan bila ingin disimpan)
      if (dusun) formData.append("dusun", dusun);
      if (kelurahan) formData.append("kelurahan", kelurahan);
      if (pekerjaan) formData.append("pekerjaan", pekerjaan);
      if (gaji) formData.append("gaji", String(gajiNum));

      // file fields
      if (slipFile) formData.append("slip", slipFile);
      // kirim foto jika admin memilih file baru
      if (photoFile) formData.append("photo", photoFile);

      // NOTE: axios akan otomatis set header multipart/form-data untuk FormData
      if (editId) {
        await api.patch(`/penduduk/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMsg("Data penduduk berhasil diupdate");
      } else {
        await api.post("/penduduk", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMsg("Penduduk berhasil disimpan");
      }

      navigate("/kategoripenduduk");
    } catch (err) {
      console.error("Save penduduk error:", err);
      setMsg(err?.response?.data?.error || "Gagal menyimpan penduduk");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg p-8 shadow">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">{editId ? "Edit Penduduk" : "Tambah Penduduk"}</h1>
            <div>
              <button onClick={() => navigate("/kategoripenduduk")} className="px-3 py-2 border rounded">
                Kembali
              </button>
            </div>
          </div>

          {loading ? (
            <div>Memuat...</div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium">NIK</label>
                    <input
                      value={nik}
                      onChange={(e) => setNik(e.target.value)}
                      type="text"
                      className="w-full border px-3 py-2 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Nama Lengkap</label>
                    <input
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      type="text"
                      className="w-full border px-3 py-2 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Nomer KK</label>
                    <input
                      value={nomorKK}
                      onChange={(e) => setNomorKK(e.target.value)}
                      type="text"
                      className="w-full border px-3 py-2 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Jenis Kelamin</label>
                    <select
                      value={jenisKelamin}
                      onChange={(e) => setJenisKelamin(e.target.value)}
                      className="w-full border px-3 py-2 rounded-md"
                    >
                      <option value="">Pilih</option>
                      <option value="Laki - Laki">Laki - Laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Agama</label>
                    <input
                      value={agama}
                      onChange={(e) => setAgama(e.target.value)}
                      type="text"
                      className="w-full border px-3 py-2 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Status Penduduk (bisa di-override)</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border px-3 py-2 rounded-md"
                    >
                      <option value="">(otomatis dari gaji jika diisi)</option>
                      <option value="Tetap">Tetap</option>
                      <option value="Pendatang">Pendatang</option>
                      <option value="Mampu">Mampu</option>
                      <option value="Tidak Mampu">Tidak Mampu</option>
                    </select>
                  </div>
                </div>

                <h2 className="font-semibold mt-6 mb-3 text-gray-700">DATA ALAMAT</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium">Alamat Lengkap</label>
                    <input
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      type="text"
                      className="w-full border px-3 py-2 rounded-md"
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-sm font-medium">RT</label>
                      <input
                        value={rt}
                        onChange={(e) => setRt(e.target.value)}
                        type="text"
                        className="w-full border px-3 py-2 rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium">RW</label>
                      <input
                        value={rw}
                        onChange={(e) => setRw(e.target.value)}
                        type="text"
                        className="w-full border px-3 py-2 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Dusun (frontend only)</label>
                    <input
                      value={dusun}
                      onChange={(e) => setDusun(e.target.value)}
                      type="text"
                      className="w-full border px-3 py-2 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Kelurahan (frontend only)</label>
                    <input
                      value={kelurahan}
                      onChange={(e) => setKelurahan(e.target.value)}
                      type="text"
                      className="w-full border px-3 py-2 rounded-md"
                    />
                  </div>
                </div>

                <h2 className="font-semibold mt-6 mb-3 text-gray-700">DATA PEKERJAAN & PENGHASILAN</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="text-sm font-medium">Pekerjaan (frontend only)</label>
                    <input
                      value={pekerjaan}
                      onChange={(e) => setPekerjaan(e.target.value)}
                      type="text"
                      className="w-full border px-3 py-2 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Gaji per bulan (angka)</label>
                    <input
                      value={gaji}
                      onChange={(e) => setGaji(e.target.value)}
                      type="number"
                      className="w-full border px-3 py-2 rounded-md"
                      placeholder="Masukkan gaji (contoh: 1500000)"
                    />
                    <div className="text-xs text-gray-500 mt-1">Jika gaji &lt; 2.000.000 → status = Tidak Mampu</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Slip Gaji (upload, frontend preview)</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleSlipUpload}
                      className="w-full border px-3 py-2 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="px-8 py-2 bg-blue-600 text-white rounded-md"
                    disabled={loading}
                  >
                    {loading ? "Menyimpan..." : editId ? "Update" : "Simpan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNik("");
                      setNama("");
                      setNomorKK("");
                      setJenisKelamin("");
                      setAgama("");
                      setAlamat("");
                      setRt("");
                      setRw("");
                      setDusun("");
                      setKelurahan("");
                      setPekerjaan("");
                      setGaji("");
                      setSlipFile(null);
                      setSlipPreview("");
                      setPhotoFile(null);
                      setMsg("");
                    }}
                    className="px-8 py-2 bg-red-500 text-white rounded-md"
                  >
                    Batal
                  </button>
                  {msg && <div className="text-sm text-gray-700 ml-4">{msg}</div>}
                </div>
              </div>

              {/* FOTO / SLIP PREVIEW */}
              <div className="flex flex-col justify-start items-center">
                <div className="w-44 h-44 border rounded-full flex items-center justify-center bg-gray-100 overflow-hidden">
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" alt="preview" />
                  ) : (
                    <svg className="w-28 h-28 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.33 0-6 2.67-6 6h12c0-3.33-2.67-6-6-6z"
                      />
                    </svg>
                  )}
                </div>

                <label className="mt-5 w-full text-center cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md">
                  Unggah Foto (opsional)
                  <input
                    type="file"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    accept="image/*"
                  />
                </label>

                <div className="w-full mt-4">
                  <div className="text-sm font-medium">Preview Slip Gaji</div>
                  {slipPreview ? (
                    <div className="mt-2 w-full h-48 border rounded overflow-hidden">
                      {slipPreview.endsWith(".pdf") ? (
                        <embed src={slipPreview} type="application/pdf" width="100%" height="100%" />
                      ) : (
                        <img src={slipPreview} className="w-full h-full object-cover" alt="slip-preview" />
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-2">Tidak ada slip diunggah</div>
                  )}
                </div>

                <button
                  className="mt-2 w-full px-4 py-2 bg-gray-200 text-black rounded-md"
                  onClick={() => setSlipPreview("")}
                >
                  Hapus Preview Slip
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-8">
            Copyright © 2025 All rights reserved | Desa Maron Kulon
          </p>
        </div>
      </main>
    </div>
  );
}