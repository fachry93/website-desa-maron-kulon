import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../PublicPage/home.jsx";
import TentangKami from "../PublicPage/aboutus.jsx";
import ProfileAdmin from "../AdminPages/adminprofile.jsx";
import HomeSlider from "../AdminPages/adminhomeslider.jsx";
import BeritaBaru from "../AdminPages/beritabaru.jsx";
import LayananKami from "../PublicPage/layanankami"; // pastikan export default ada di file ini
import TambahKategoriBerita from "../AdminPages/kategoriberita.jsx";
import TambahPenduduk from "../AdminPages/tambahpenduduk.jsx";
import SignIn from "../PublicPage/singin.jsx";
import SignUp from "../PublicPage/singup.jsx"; // <-- import signup
import AdminDashboard from "../AdminPages/admindashboard.jsx"; // <- tambah import
import KategoriPenduduk from "../AdminPages/kategoripenduduk.jsx"; // <-- tambahkan import
import TambahStaf from "../AdminPages/tambahstaf.jsx";
import KategoriJabatan from "../AdminPages/kategorijabatan.jsx";
import Berita from "../PublicPage/berita"; // pastikan export default ada di berita.jsx
import BeritaDetail from "../PublicPage/beritaDetail"; // <-- tambah import
import LayananAdmin from "../AdminPages/layananadmin";
import PermohonanAdmin from "../AdminPages/permohonanadmin.jsx";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />            {/* <- tampilkan Home di root */}
        <Route path="/home" element={<Home />} />
        <Route path="/singin" element={<SignIn />} />   {/* <- tambahkan ini */}
        <Route path="/singup" element={<SignUp />} />   {/* <-- tambahkan route signup */}
        <Route path="/aboutus" element={<TentangKami />} />
        <Route path="/adminprofile" element={<ProfileAdmin />} />
        <Route path="/adminhomeslider" element={<HomeSlider />} />
        <Route path="/beritabaru" element={<BeritaBaru />} />
        <Route path="/layanan" element={<LayananKami />} />
        <Route path="/kategoriberita" element={<TambahKategoriBerita />} />
        <Route path="/tambahpenduduk" element={<TambahPenduduk />} />
        <Route path="/kategoripenduduk" element={<KategoriPenduduk />} />  {/* <-- route baru */}
        <Route path="/admin/penduduk" element={<KategoriPenduduk />} />   {/* <-- alias untuk sidebar href */}
        <Route path="/admindashboard" element={<AdminDashboard />} />  {/* <- tambah route */}
        <Route path="/tambahstaf" element={<TambahStaf />} />
        <Route path="/kategorijabatan" element={<KategoriJabatan />} />
        <Route path="/berita" element={<Berita />} />
        <Route path="/berita/:id" element={<BeritaDetail />} /> {/* <-- tambah route */}
        <Route path="/admin/layanan" element={<LayananAdmin />} />
        <Route path="/admin/permohonan" element={<PermohonanAdmin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
