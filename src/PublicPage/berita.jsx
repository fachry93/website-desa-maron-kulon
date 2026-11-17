import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/nav_bar";
import Navfooter from "../component/nav_footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

/* Icons */
const IconEye = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" fill="currentColor" />
  </svg>
);
const IconComment = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 10h.01M12 10h.01M16 10h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

function resolveImage(src) {
  if (!src) return "/placeholder-berita.jpg";
  if (src.startsWith("http") || src.startsWith("//")) return src;
  if (src.startsWith("/")) return `${API}${src}`;
  return `${API}/${src}`;
}

export default function Berita() {
  const [categories, setCategories] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [pageSize] = useState(6);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetch(`${API}/kategori`).then(r => r.ok ? r.json() : Promise.resolve([])).catch(() => []),
      fetch(`${API}/berita`).then(r => r.ok ? r.json() : Promise.resolve([])).catch(() => [])
    ])
      .then(([cats, berita]) => {
        if (!mounted) return;
        const normalizedCats = Array.isArray(cats) ? cats.map(c => (typeof c === 'string' ? { nama: c } : c)) : [];
        const finalCats = normalizedCats.length ? normalizedCats.map(c => c.nama) : [
          "Sosma", "Keagamaan", "Kewirausahaan", "Politik", "Bencana",
          "Pembangunan", "Sumber Daya", "Pendidikan", "Pekerjaan"
        ];
        setCategories(["Semua", ...finalCats]);

        const normalizedNews = (Array.isArray(berita) ? berita : []).map(b => ({
          id: b.id,
          title: b.judul || b.title || "",
          imgSrc: b.gambar || b.imgSrc || "",
          excerpt: (b.deskripsi || b.excerpt || b.content || "").slice(0, 320),
          tanggal: b.tanggal || b.createdAt,
          kategori: b.kategori?.nama || b.kategoriberita?.nama || "Umum",
          views: b.views ?? 0,
          comments: b.comments ?? 0,
        }));
        normalizedNews.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        setNews(normalizedNews);
        setLoading(false);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(d);
    } catch { return iso; }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return news.filter(n =>
      (activeCategory === "Semua" || n.kategori === activeCategory) &&
      (q === "" || (n.title || "").toLowerCase().includes(q) || (n.excerpt || "").toLowerCase().includes(q))
    );
  }, [news, query, activeCategory]);

  const paged = useMemo(() => filtered.slice(0, page * pageSize), [filtered, page, pageSize]);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12 overflow-x-hidden box-border">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800">Berita & Pengumuman</h1>
          <p className="mt-2 text-slate-500 max-w-2xl mx-auto">Informasi terbaru dari desa — kegiatan, pengumuman, dan liputan penting.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-96">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                  <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                    placeholder="Cari berita atau topik..."
                    className="pl-10 pr-3 py-2 rounded-lg border border-gray-200 shadow-sm w-full focus:ring-2 focus:ring-blue-100"
                    aria-label="Cari berita"
                  />
                </div>

                <div className="hidden sm:flex gap-2">
                  <button onClick={() => { setQuery(''); setActiveCategory('Semua'); }} className="px-3 py-2 bg-white border rounded-md text-sm hover:bg-gray-50">Reset</button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <span className="font-semibold">{filtered.length}</span> hasil
              </div>
            </div>

            {/* Category chips */}
            <div className="mb-6 overflow-x-auto pb-2">
              <div className="flex gap-2">
                {categories.map(c => (
                  <button key={c} onClick={() => { setActiveCategory(c); setPage(1); }}
                    className={`flex-shrink-0 text-sm px-4 py-2 rounded-full ${activeCategory === c ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-6">
                <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="animate-pulse bg-gray-200 h-40 rounded" />
                  <div className="animate-pulse bg-gray-200 h-40 rounded" />
                </div>
              </div>
            )}

            {error && <div className="text-red-600 py-6 text-center">Error: {error}</div>}

            {!loading && !error && (
              <>
                {/* Featured */}
                {paged[0] ? (
                  <article
                    className="rounded-xl overflow-hidden shadow-lg mb-6 cursor-pointer hover:shadow-xl transition"
                    onClick={() => navigate(`/berita/${paged[0].id}`)}
                    aria-label={`Baca: ${paged[0].title}`}
                  >
                    <div className="relative">
                      <img loading="lazy" src={resolveImage(paged[0].imgSrc)} alt={paged[0].title} className="w-full max-w-full h-72 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute left-6 bottom-6 text-white">
                        <span className="text-xs bg-black/40 px-3 py-1 rounded">{paged[0].kategori}</span>
                      </div>
                    </div>
                    <div className="p-6 bg-white">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-3"><IconEye /> <span>{paged[0].views}</span></div>
                        <div className="flex items-center gap-3"><IconComment /> <span>{paged[0].comments}</span></div>
                        <time className="ml-auto text-gray-400">{formatDate(paged[0].tanggal)}</time>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold mt-3 text-slate-800">{paged[0].title}</h2>
                      <p className="text-gray-700 mt-3 leading-relaxed">{paged[0].excerpt}</p>
                      <div className="mt-4">
                        <button onClick={() => navigate(`/berita/${paged[0].id}`)} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          Baca Selengkapnya
                        </button>
                      </div>
                    </div>
                  </article>
                ) : (
                  <div className="text-center py-10 text-gray-600">Belum ada berita.</div>
                )}

                {/* Grid list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paged.slice(1).map(n => (
                    <article key={n.id} className="bg-white rounded-lg shadow p-4 flex gap-4 hover:shadow-lg transition cursor-pointer min-w-0" onClick={() => navigate(`/berita/${n.id}`)}>
                      <img loading="lazy" src={resolveImage(n.imgSrc)} alt={n.title} className="flex-shrink-0 w-28 sm:w-36 h-20 sm:h-24 object-cover rounded-md max-w-full" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{n.kategori}</span>
                          <time className="text-xs text-gray-400 ml-auto">{formatDate(n.tanggal)}</time>
                        </div>
                        <h3 className="font-semibold text-lg mt-2 text-slate-800 line-clamp-2 break-words">{n.title}</h3>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3 break-words">{n.excerpt}</p>
                        <div className="flex items-center gap-3 text-gray-500 text-xs mt-3">
                          <div className="flex items-center gap-1"><IconEye /> <span>{n.views}</span></div>
                          <div className="flex items-center gap-1"><IconComment /> <span>{n.comments}</span></div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {paged.length < filtered.length && (
                  <div className="text-center mt-6">
                    <button onClick={() => setPage(p => p + 1)} className="px-6 py-2 bg-white border rounded hover:bg-gray-50">
                      Muat Lagi
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 max-w-full">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Berita Terbaru</h4>
                <div className="space-y-3">
                  {news.slice(0, 5).map(n => (
                    <button key={n.id} onClick={() => navigate(`/berita/${n.id}`)} className="w-full text-left flex items-start gap-3 min-w-0">
                      <img loading="lazy" src={resolveImage(n.imgSrc)} alt={n.title} className="w-16 h-12 object-cover rounded max-w-full" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{n.title}</div>
                        <div className="text-xs text-gray-400">{formatDate(n.tanggal)}</div>
                      </div>
                    </button>
                  ))}
                  {!news.length && <div className="text-xs text-gray-400">Belum ada berita.</div>}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Kategori Populer</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(1, 8).map(c => (
                    <button key={c} onClick={() => { setActiveCategory(c); setPage(1); }} className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200">
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-2">Subscribe</h4>
                <p className="text-xs text-gray-500 mb-3">Dapatkan update berita lewat email.</p>
                <div className="flex gap-2">
                  <input placeholder="Email Anda" className="flex-1 px-3 py-2 rounded border border-gray-200 text-sm" />
                  <button className="px-3 py-2 bg-blue-600 text-white rounded">Kirim</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Navfooter />
    </>
  );
}
