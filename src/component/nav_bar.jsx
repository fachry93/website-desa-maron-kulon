import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    // ===== changed: make header sticky =====
    <header className="sticky top-0 z-50 bg-blue-200/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
        <Link to="/singin" className="flex items-center space-x-3 ml-2">
          <img src="/logo_desa.png" alt="Logo Desa Maron Kulon" className="w-11 h-15 mr-2" />
          <div>
            <h1 className="font-bold text-black text-lg ml-3">DESA MARON KULON</h1>
            <p className="text-sm text-black/70 ml-3">Kec. Maron, Kab. Probolingo <br /> Prov. Jawa Timur</p>
          </div>
        </Link>

        <div className="flex items-center space-x-6 mr-2">
          <nav className="flex space-x-9 text-black text-sm font-bold">
            <Link to="/" className="hover:underline">BERANDA</Link>
            <Link to="/aboutus" className="hover:underline">PROFIL</Link>
            <Link to="/layanan" className="hover:underline">LAYANAN</Link>
            <Link to="/berita" className="hover:underline">BERITA</Link>
          </nav>

          <Link to="/kontak" className="bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded hover:bg-blue-700 transition">
            KONTAK
          </Link>
        </div>
      </div>
    </header>
    // ========================================
  )
}
