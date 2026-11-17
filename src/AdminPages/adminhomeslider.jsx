import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar.jsx";
import api from "../api.js";

export default function HomeSlider() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ gambar: "", link: "", file: null });
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null); // null = create mode

  const base = api.defaults?.baseURL || ""; // <-- add this

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/homeslider");
      setList(res.data || []);
    } catch (e) {
      console.error("Load homeslider error:", e);
      setError("Gagal memuat data homeslider");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // helper: file -> data URL (string)
  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // create or update depending on editingId
  async function handleSave(e) {
    e.preventDefault();
    setError("");
    if (!form.file && !form.gambar) return setError("File gambar atau URL wajib diisi");
    setLoading(true);
    try {
      let res;
      // jika ada file -> gunakan FormData (multer expects 'image')
      if (form.file) {
        const fd = new FormData();
        fd.append("image", form.file);
        fd.append("link", form.link || "");
        // jangan set Content-Type manual; axios akan mengaturnya
        if (editingId) {
          res = await api.put(`/homeslider/${editingId}`, fd);
        } else {
          res = await api.post("/homeslider", fd);
        }
      } else {
        // kirim JSON untuk URL/dataURL string
        const payload = { gambar: form.gambar, link: form.link || "" };
        if (editingId) res = await api.put(`/homeslider/${editingId}`, payload);
        else res = await api.post("/homeslider", payload);
      }

      // update local list
      if (editingId) {
        setList((prev) => prev.map((it) => (it.id === editingId ? res.data : it)));
      } else {
        setList((prev) => [...prev, res.data]);
      }

      // reset form
      setForm({ gambar: "", link: "", file: null });
      setPreview("");
      setEditingId(null);
    } catch (e) {
      console.error("Save homeslider error:", e);
      const serverMsg = e?.response?.data?.error || e?.response?.data?.message || e?.response?.data || e.message;
      setError(String(serverMsg || "Gagal menyimpan slider"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus slider ini?")) return;
    try {
      await api.delete(`/homeslider/${id}`);
      setList((prev) => prev.filter((x) => x.id !== id));
      // if deleting the item being edited -> cancel edit
      if (editingId === id) {
        setEditingId(null);
        setForm({ gambar: "", link: "", file: null });
        setPreview("");
      }
    } catch (e) {
      console.error("Delete homeslider error:", e);
      alert("Gagal menghapus");
    }
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0] || null;
    setForm((s) => ({ ...s, file: f }));
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview("");
  }

  // mulai edit: isi form dengan data item
  function handleEdit(item) {
    setEditingId(item.id);
    setForm({ gambar: item.gambar || item.imageUrl || item.url || "", link: item.link || "", file: null });
    // prefix backend base for stored paths like "/uploads/..."
    const img = item.gambar || item.imageUrl || item.url || "";
    setPreview(img ? (img.startsWith("http") ? img : `${base}${img}`) : "");
    setError("");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm({ gambar: "", link: "", file: null });
    setPreview("");
    setError("");
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-blue-700 text-lg font-semibold underline mb-6">
            Home Slider
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <form onSubmit={handleSave} className="bg-white p-5 rounded-lg shadow-md">
               <label className="font-semibold text-sm">Upload Gambar*</label>
               <input
                 onChange={handleFileChange}
                 type="file"
                 accept="image/*"
                 className="w-full mt-1"
               />
               <div className="text-sm text-gray-500 my-2">atau masukkan URL</div>
               <input
                 value={form.gambar}
                 onChange={(e) => setForm((f) => ({ ...f, gambar: e.target.value }))}
                 type="text"
                 className="w-full border p-2 rounded mt-1"
                 placeholder="https://..."
               />

               <label className="font-semibold text-sm mt-4 block">Link</label>
               <input
                 value={form.link}
                 onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                 type="text"
                 className="w-full border p-2 rounded mt-1"
                 placeholder="Optional link"
               />

               {preview && (
                 <div className="mt-3">
                   <div className="text-sm text-gray-500 mb-1">Preview:</div>
                   <img src={preview} alt="preview" className="w-full h-36 object-cover rounded" />
                 </div>
               )}

               {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

               <div className="flex gap-2 mt-5">
                <button
                  disabled={loading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
                >
                  {loading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Tambahkan")}
                </button>
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded">
                    Batal
                  </button>
                )}
               </div>
             </form>

             <div className="md:col-span-3">
               <div className="bg-white p-4 rounded-lg shadow-md">
                 <h2 className="font-semibold text-lg mb-4">Home Slider List</h2>

                 {loading && (
                   <div className="text-sm text-gray-500">Loading...</div>
                 )}
                 {!loading && list.length === 0 && (
                   <div className="text-sm text-gray-500">Belum ada slider.</div>
                 )}

                 <div className="space-y-3">
                   {list.map((item, idx) => (
                     <div
                       key={item.id}
                       className="grid grid-cols-12 bg-gray-50 p-3 rounded items-center"
                     >
                       <div className="col-span-1 text-sm font-medium">
                         {idx + 1}
                       </div>
                       <div className="col-span-4">
                         <img
                           src={
                             item.gambar
                               ? (item.gambar.startsWith("http") ? item.gambar : `${base}${item.gambar}`)
                               : (item.imageUrl || item.url || "")
                           }
                           alt={item.link || `slider-${item.id}`}
                           className="rounded w-full h-28 object-cover"
                         />
                       </div>
                       <div className="col-span-4 text-sm text-gray-700">
                         {item.link || "-"}
                       </div>
                       <div className="col-span-3 flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Hapus
                        </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </div>
         </div>
       </main>
     </div>
   );
 }
