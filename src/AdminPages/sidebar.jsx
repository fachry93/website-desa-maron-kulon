import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api.js";

const menu = [
  { key: "dashboard", label: "Dashboard", to: "/admindashboard", icon: DashboardIcon },
  { key: "homeslider", label: "Home Slider", to: "/adminhomeslider", icon: ImageIcon },
  { key: "layanan", label: "Layanan", to: "/admin/layanan", icon: ServiceIcon },
  { key: "permohonan", label: "Permohonan", to: "/admin/permohonan", icon: NewsIcon },
  { key: "beritabaru", label: "Berita Baru", to: "/beritabaru", icon: NewsIcon, badgeKey: "berita" },
  { key: "kategoriberita", label: "Kategori Berita", to: "/kategoriberita", icon: TagIcon },
  { key: "kategoriPenduduk", label: "Kategori Penduduk", to: "/kategoripenduduk", icon: UsersIcon },
  { key: "tambahPenduduk", label: "Tambah Penduduk", to: "/tambahpenduduk", icon: PlusIcon },
  { key: "pendudukTidakMampu", label: "Penduduk Tidak Mampu", to: "/penduduktidakmampu", icon: HeartIcon, badgeKey: "penduduk" },
  { key: "kategoriJabatan", label: "Kategori Jabatan", to: "/kategorijabatan", icon: ListIcon },
  { key: "tambahStaf", label: "Tambah Staf", to: "/tambahstaf", icon: PlusIcon },
  { key: "direktoriStaf", label: "Direktori Staf", to: "/direktoristaf", icon: DirectoryIcon, badgeKey: "staff" },
  { key: "pengumuman", label: "Pengumuman", to: "/pengumuman", icon: NewsIcon, badgeKey: "pengumuman" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [counts, setCounts] = useState({
    penduduk: 0,
    berita: 0,
    kategori: 0,
    staff: 0,
    pengumuman: 0,
  });
  const loc = useLocation();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.get("/stats");
        // now response is { penduduk, berita, kategori }
        setCounts({
          penduduk: res.data.penduduk || 0,
          berita: res.data.berita || 0,
          kategori: res.data.kategori || 0,
        });
      } catch (err) {
        console.error("Failed to load stats:", err?.response?.data || err.message);
      }
    }
    load();
    const iv = setInterval(load, 30_000); // refresh every 30s
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  return (
    <aside className={`h-screen sticky top-0 left-0 bg-gradient-to-b from-slate-700 to-indigo-600 text-white transition-all duration-200 ${collapsed ? "w-20" : "w-64"}`}>
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <div className={`flex-shrink-0 ${collapsed ? "w-10 h-10" : "w-12 h-12"}`}>
            <div className="bg-white/10 rounded-md w-full h-full flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                <rect width="24" height="24" rx="4" fill="white" opacity="0.06"></rect>
                <path d="M4 7h16M4 12h16M4 17h16" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {!collapsed && (
            <div className="flex-1">
              <div className="text-sm font-bold">DESA MARON KULON</div>
              <div className="text-xs text-white/80">Kec. Maron, Kab. Probolinggo</div>
            </div>
          )}

          <button
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed(v => !v)}
            className="ml-2 p-1 rounded hover:bg-white/10"
            title="Toggle"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-auto py-4">
          <ul className="space-y-1 px-2">
            {menu.map((m) => {
              const active = loc.pathname === m.to;
              const badge = m.badgeKey ? counts[m.badgeKey] : null;
              return (
                <li key={m.key}>
                  <Link
                    to={m.to}
                    className={`flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm hover:bg-white/10 transition-colors ${active ? "bg-white/10 font-semibold" : "text-white/90"}`}
                  >
                    <span className="flex-none">
                      <m.icon active={active} />
                    </span>
                    {!collapsed && <span className="flex-1">{m.label}</span>}
                    {badge != null && (
                      <span className={`ml-2 text-xs font-medium ${collapsed ? "hidden" : "inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-white/10"}`}>
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm">AD</div>
            {!collapsed && (
              <div className="flex-1">
                <div className="text-sm font-medium">Admin</div>
                <div className="text-xs text-white/80">desa@domain.local</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="mt-3">
              <Link to="/logout" className="text-xs text-white/80 hover:underline">Logout</Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/* --------------------------
   Small inline SVG icons
   -------------------------- */

function IconWrapper({ children }) {
  return <span className="w-5 h-5 inline-block">{children}</span>;
}

function DashboardIcon({ active }) {
  return (
    <IconWrapper>
      <svg viewBox="0 0 24 24" fill="none" className={`w-5 h-5 ${active ? "text-white" : "text-white/90"}`}>
        <rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.12"/>
        <rect x="13" y="3" width="8" height="5" rx="1.5" fill="currentColor" opacity="0.18"/>
        <rect x="13" y="10" width="8" height="11" rx="1.5" fill="currentColor" opacity="0.1"/>
        <rect x="3" y="13" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.16"/>
      </svg>
    </IconWrapper>
  );
}

function ImageIcon() {
  return (
    <IconWrapper>
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/90" fill="none"><path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 15l-6-6-4 4-3-3L3 17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </IconWrapper>
  );
}

function ServiceIcon() {
  return (
    <IconWrapper>
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/90" fill="none"><path d="M12 2v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M6.5 6.5L5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M17.5 6.5L19 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="12" cy="14" r="6" stroke="currentColor" strokeWidth="1.2"/></svg>
    </IconWrapper>
  );
}

function NewsIcon() {
  return (
    <IconWrapper>
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/90" fill="none"><path d="M3 7h18M3 11h18M7 15h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </IconWrapper>
  );
}

function TagIcon() {
  return (
    <IconWrapper>
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/90" fill="none"><path d="M21 11l-9 9-9-9V3h9l9 8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </IconWrapper>
  );
}

function UsersIcon() {
  return (
    <IconWrapper>
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/90" fill="none"><path d="M17 21v-2a4 4 0 00-3-3.87M9 21v-2a4 4 0 013-3.87M12 7a3 3 0 110-6 3 3 0 010 6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </IconWrapper>
  );
}

function PlusIcon() {
  return (
    <IconWrapper>
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/90" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </IconWrapper>
  );
}

function HeartIcon() {
  return (
    <IconWrapper>
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/90" fill="none"><path d="M20.8 6.6a4.5 4.5 0 00-6.3 0L12 9.1 9.5 6.6a4.5 4.5 0 10-6.3 6.3L12 21l9-8.1a4.5 4.5 0 00-.2-6.3z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </IconWrapper>
  );
}

function ListIcon() {
  return (
    <IconWrapper>
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/90" fill="none"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </IconWrapper>
  );
}

function DirectoryIcon() {
  return (
    <IconWrapper>
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/90" fill="none"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </IconWrapper>
  );
}