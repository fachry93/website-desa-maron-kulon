import React from "react";

const socialIcons = [
  {
    name: "Facebook",
    href: "#",
    svg: (
      <div className="w-10 h-10 flex items-center justify-center rounded-full border border-black">
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M18 2h-3a6 6 0 00-6 6v3H6v4h3v8h4v-8h3l1-4h-4V8a1 1 0 011-1h3z" />
        </svg>
      </div>
    ),
  },
  {
    name: "Instagram",
    href: "#",
    svg: (
      <div className="w-10 h-10 flex items-center justify-center rounded-full border border-black">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37a4 4 0 11-4.73-4.73 4 4 0 014.73 4.73z" />
          <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
        </svg>
      </div>
    ),
  },
  {
    name: "TikTok",
    href: "#",
    svg: (
      <div className="w-10 h-10 flex items-center justify-center rounded-full border border-black">
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M16 8c1.66 1.53 3.32 2.3 5 2v3c-2.06 0-3.72-.67-5-2v5a6 6 0 11-6-6h3a3 3 0 103 3V8z" />
        </svg>
      </div>
    ),
  },
  {
    name: "Web",
    href: "#",
    svg: (
      <div className="w-10 h-10 flex items-center justify-center rounded-full border border-black">
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 17.93V20h-2v-.07A8 8 0 014 12H2v-2h2a8 8 0 017-7.93V4h2v.07A8 8 0 0120 10h2v2h-2a8 8 0 01-7 7.93z" />
        </svg>
      </div>
    ),
  },
];

export default function Navfooter() {
  return (
    <footer className="w-full">
      {/* ======== TOP AREA ======== */}
      <div className="bg-[#CFE0FF] text-gray-900 py-14 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">

          {/* LEFT - OFFICE ADDRESS */}
          <div>
            <h3 className="font-extrabold text-lg mb-4 tracking-wide">ALAMAT KANTOR</h3>
            <p>Jl. Raya Panglima Sudirman No 134</p>
            <p>Kraksaaan 67282</p>
            <p>Phone: (0335) 846667</p>
            <p>Email: kominfo@probolinggokab.go.id</p>
          </div>

          {/* MIDDLE - SOCIAL MEDIA */}
          <div className="flex flex-col items-center">
            <h3 className="font-extrabold text-lg mb-4 tracking-wide">MEDIA SOSIAL</h3>
            <div className="flex space-x-4">
              {socialIcons.map((icon) => (
                <a key={icon.name} href={icon.href} className="hover:opacity-70 transition">
                  {icon.svg}
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT - CONTACT LAYANAN (Shifted slightly right) */}
          <div className="md:pl-10">
            <h3 className="font-extrabold text-lg mb-4 tracking-wide">KONTAK LAYANAN</h3>
            <p>Hotline: 0812-3456-7890</p>
            <p>Admin Desa: 0857-9876-2221</p>
            <p>Website: desamaronkulon.id</p>
            <p>Email: info@desamaronkulon.id</p>
          </div>

        </div>
      </div>

      {/* ======== BOTTOM BAR ======== */}
      <div className="bg-[#3D6CDA] h-14 w-full"></div>
    </footer>
  );
}
