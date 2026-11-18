import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public Pages
const Home = lazy(() => import("../PublicPage/home.jsx"));
const TentangKami = lazy(() => import("../PublicPage/aboutus.jsx"));
const LayananKami = lazy(() => import("../PublicPage/layanankami.jsx"));
const SignIn = lazy(() => import("../PublicPage/singin.jsx"));
const SignUp = lazy(() => import("../PublicPage/singup.jsx"));
const Berita = lazy(() => import("../PublicPage/berita.jsx"));
const BeritaDetail = lazy(() => import("../PublicPage/beritaDetail.jsx"));

// Admin Pages
const ProfileAdmin = lazy(() => import("../AdminPages/adminprofile.jsx"));
const HomeSlider = lazy(() => import("../AdminPages/adminhomeslider.jsx"));
const BeritaBaru = lazy(() => import("../AdminPages/beritabaru.jsx"));
const TambahKategoriBerita = lazy(() => import("../AdminPages/kategoriberita.jsx"));
const TambahPenduduk = lazy(() => import("../AdminPages/tambahpenduduk.jsx"));
const KategoriPenduduk = lazy(() => import("../AdminPages/kategoripenduduk.jsx"));
const AdminDashboard = lazy(() => import("../AdminPages/admindashboard.jsx"));
const TambahStaf = lazy(() => import("../AdminPages/tambahstaf.jsx"));
const KategoriJabatan = lazy(() => import("../AdminPages/kategorijabatan.jsx"));
const LayananAdmin = lazy(() => import("../AdminPages/layananadmin.jsx"));
const PermohonanAdmin = lazy(() => import("../AdminPages/permohonanadmin.jsx"));

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Memuat halaman...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/singin" element={<SignIn />} />
          <Route path="/singup" element={<SignUp />} />
          <Route path="/aboutus" element={<TentangKami />} />
          <Route path="/adminprofile" element={<ProfileAdmin />} />
          <Route path="/adminhomeslider" element={<HomeSlider />} />
          <Route path="/beritabaru" element={<BeritaBaru />} />
          <Route path="/layanan" element={<LayananKami />} />
          <Route path="/kategoriberita" element={<TambahKategoriBerita />} />
          <Route path="/tambahpenduduk" element={<TambahPenduduk />} />
          <Route path="/kategoripenduduk" element={<KategoriPenduduk />} />
          <Route path="/admin/penduduk" element={<KategoriPenduduk />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/tambahstaf" element={<TambahStaf />} />
          <Route path="/kategorijabatan" element={<KategoriJabatan />} />
          <Route path="/berita" element={<Berita />} />
          <Route path="/berita/:id" element={<BeritaDetail />} />
          <Route path="/admin/layanan" element={<LayananAdmin />} />
          <Route path="/admin/permohonan" element={<PermohonanAdmin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;
