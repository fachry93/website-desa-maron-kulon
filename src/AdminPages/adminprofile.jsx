import React from "react";
import Navbar from "../component/nav_bar";
import Navfooter from "../component/nav_footer";

export default function ProfileAdmin() {
  return (
    <div className="bg-gray-100 min-h-screen">
      
      {/* NAVBAR */}
      <Navbar />

      {/* HEADER BACKGROUND */}
      <div className="w-full h-52">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
          alt="header"
          className="w-full h-full object-cover"
        />
      </div>

      {/* CARD PROFILE TOP */}
      <div className="max-w-3xl mx-auto px-4 -mt-20">
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center shadow-md">
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              alt="avatar"
              className="w-16 opacity-80"
            />
          </div>

          <h2 className="mt-4 text-xl font-bold">NAMA ADMIN</h2>
          <p className="text-gray-500 text-sm">PPID-Pemkab Probolinggo</p>
        </div>
      </div>

      {/* FORM PROFIL */}
      <div className="max-w-3xl mx-auto mt-6 bg-white shadow-md rounded-lg p-6">
        <h3 className="text-center text-lg font-bold mb-6">PROFIL</h3>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* NAMA */}
          <div className="col-span-2">
            <label className="text-sm font-semibold">NAMA</label>
            <input
              type="text"
              defaultValue="NAMA ADMIN"
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          {/* JABATAN */}
          <div>
            <label className="text-sm font-semibold">JABATAN</label>
            <input
              type="text"
              defaultValue="STAF KOMINFO"
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="text-sm font-semibold">STATUS</label>
            <input
              type="text"
              defaultValue="NON-ASN"
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          {/* KTP */}
          <div className="col-span-2">
            <label className="text-sm font-semibold">NO. KTP</label>
            <input
              type="text"
              defaultValue="009339448229330"
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          {/* EMAIL */}
          <div className="col-span-2">
            <label className="text-sm font-semibold">EMAIL</label>
            <input
              type="email"
              defaultValue="kominfo@gmail.com"
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          {/* JENIS KELAMIN */}
          <div>
            <label className="text-sm font-semibold">JENIS KELAMIN</label>
            <input
              type="text"
              defaultValue="PEREMPUAN"
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          {/* TANGGAL LAHIR */}
          <div>
            <label className="text-sm font-semibold">TANGGAL LAHIR</label>
            <input
              type="text"
              defaultValue="05/05/2005"
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          {/* TEMPAT LAHIR */}
          <div className="col-span-2">
            <label className="text-sm font-semibold">TEMPAT LAHIR</label>
            <input
              type="text"
              defaultValue="KAB. PROBOLINGGO"
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          {/* ALAMAT */}
          <div className="col-span-2">
            <label className="text-sm font-semibold">ALAMAT</label>
            <textarea
              defaultValue="Ruko Pahlawan Blok B, JL. Panglima Besar Sudirman, No. 1, Kraksaan, Kab. Probolinggo"
              className="w-full border px-3 py-2 rounded mt-1"
            ></textarea>
          </div>

          {/* KOTA / KODE POS */}
          <div>
            <label className="text-sm font-semibold">KOTA/KABUPATEN</label>
            <input
              type="text"
              defaultValue="KAB. PROBOLINGGO"
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">KODE POS</label>
            <input
              type="text"
              defaultValue="013139"
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          {/* TELPON */}
          <div>
            <label className="text-sm font-semibold">NO. TELEPON</label>
            <input
              type="text"
              defaultValue="00214141414"
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">NO. PONSEL</label>
            <input
              type="text"
              defaultValue="08941411418"
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>
        </form>

        {/* BUTTON EDIT */}
        <div className="flex justify-center mt-6">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-2 rounded-md">
            EDIT
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-10">
        <Navfooter />
      </div>

    </div>
  );
}
