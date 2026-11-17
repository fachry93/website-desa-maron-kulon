const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let pengumuman = [
  { id: 1, judul: "Rehabilitasi Jalan Desa", deskripsi: "Pengerjaan tahap I dimulai minggu depan.", tanggal: new Date().toISOString(), status: "baru" },
  { id: 2, judul: "Pembagian Bantuan", deskripsi: "Pembagian bantuan di balai desa.", tanggal: new Date().toISOString(), status: "baru" },
];

let permohonan = [
  { id: 1, nama: "Siti", layanan: "KTP", tanggal: new Date().toISOString(), status: "pending" },
  { id: 2, nama: "Budi", layanan: "Surat Keterangan", tanggal: new Date().toISOString(), status: "processing" },
];

let berita = [
  { id: 1, judul: "Kegiatan Gotong Royong", gambar: "", deskripsi: "Gotong royong umum diadakan Sabtu." },
  { id: 2, judul: "Pelatihan UMKM", gambar: "", deskripsi: "Pelatihan bagi pelaku usaha mikro." },
];

const pendudukYearly = [
  { year: 2019, count: 1180 },
  { year: 2020, count: 1195 },
  { year: 2021, count: 1210 },
  { year: 2022, count: 1225 },
  { year: 2023, count: 1250 },
];

app.get("/stats", (req, res) => {
  res.json({
    pendudukCount: pendudukYearly[pendudukYearly.length - 1].count,
    permohonanCount: permohonan.length,
    beritaCount: berita.length,
    pengumumanCount: pengumuman.length,
  });
});

app.get("/penduduk/yearly", (req, res) => {
  res.json(pendudukYearly);
});

app.get("/pengumuman", (req, res) => {
  res.json(pengumuman);
});

app.post("/pengumuman", (req, res) => {
  const { judul, deskripsi } = req.body;
  const id = pengumuman.length ? Math.max(...pengumuman.map(p => p.id)) + 1 : 1;
  const item = { id, judul: judul || "Tanpa Judul", deskripsi: deskripsi || "", tanggal: new Date().toISOString(), status: "baru" };
  pengumuman.unshift(item);
  res.status(201).json(item);
});

app.patch("/pengumuman/:id/complete", (req, res) => {
  const id = Number(req.params.id);
  const idx = pengumuman.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  pengumuman[idx].status = "terpenuhi";
  res.json(pengumuman[idx]);
});

app.get("/permohonan", (req, res) => {
  res.json(permohonan);
});

app.get("/berita", (req, res) => {
  res.json(berita);
});

// small endpoint to create permohonan for testing
app.post("/permohonan", (req, res) => {
  const { nama, layanan } = req.body;
  const id = permohonan.length ? Math.max(...permohonan.map(p => p.id)) + 1 : 1;
  const p = { id, nama: nama || "Anonim", layanan: layanan || "Umum", tanggal: new Date().toISOString(), status: "pending" };
  permohonan.unshift(p);
  res.status(201).json(p);
});

const port = 4000;
app.listen(port, () => {
  console.log(`Mock API server running on http://localhost:${port}`);
});