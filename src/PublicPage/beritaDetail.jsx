import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../component/nav_bar";
import Navfooter from "../component/nav_footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

function resolveImage(src) {
  if (!src) return "/placeholder-berita.jpg";
  if (src.startsWith("http") || src.startsWith("//")) return src;
  if (src.startsWith("/")) return `${API}${src}`;
  return `${API}/${src}`;
}

function isHtml(str) {
  return /<[^>]+>/.test(str);
}

export default function BeritaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [related, setRelated] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetch(`${API}/berita/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((data) => {
        if (!mounted) return;
        setItem(data);
        setLoading(false);

        // increment views in background (optimistic)
        const current = Number(data.views ?? 0);
        setItem((prev) => prev ? { ...prev, views: current + 1 } : prev);
        fetch(`${API}/berita/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ views: current + 1 }),
        }).catch(() => { /* ignore */ });

        // load related posts (latest 4)
        fetch(`${API}/berita`)
          .then((r) => (r.ok ? r.json() : []))
          .then((list) => {
            if (!mounted) return;
            const others = Array.isArray(list) ? list.filter(x => String(x.id) !== String(id)) : [];
            setRelated(others.slice(0, 4));
          }).catch(() => {});
      })
      .catch((err) => {
        if (!mounted) return;
        setError(typeof err === "string" ? err : err.message || "Gagal memuat");
        setLoading(false);
      });

    // bookmark state from localStorage
    try {
      const bm = localStorage.getItem("bookmarks");
      if (bm) {
        const arr = JSON.parse(bm);
        setBookmarked(arr.includes(String(id)));
      }
    } catch {}

    return () => { mounted = false; };
  }, [id]);

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(d);
    } catch { return iso; }
  };

  if (loading) return (<><Navbar /><main className="container max-w-4xl mx-auto py-10">Loading...</main><Navfooter /></>);
  if (error) return (<><Navbar /><main className="container max-w-4xl mx-auto py-10 text-red-600">Error: {error}</main><Navfooter /></>);

  const contentText = (item.content || item.excerpt || "").replace(/<\/?[^>]+(>|$)/g, "");
  const words = contentText.trim().split(/\s+/).filter(Boolean).length || 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: item.title, url: window.location.href }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => alert("Link disalin ke clipboard"));
    } else {
      prompt("Salin link:", window.location.href);
    }
  }

  function toggleBookmark() {
    try {
      const key = "bookmarks";
      const raw = localStorage.getItem(key) || "[]";
      const arr = JSON.parse(raw);
      const idStr = String(id);
      if (arr.includes(idStr)) {
        const next = arr.filter(x => x !== idStr);
        localStorage.setItem(key, JSON.stringify(next));
        setBookmarked(false);
      } else {
        arr.unshift(idStr);
        localStorage.setItem(key, JSON.stringify(arr.slice(0, 50)));
        setBookmarked(true);
      }
    } catch {}
  }

  function renderContent(raw) {
    if (!raw) return null;
    if (isHtml(raw)) {
      return <div dangerouslySetInnerHTML={{ __html: raw }} />;
    }
    // plain text -> pecah paragraf berdasarkan double newline, dan pertahankan single newline sebagai <br/>
    return raw
      .split(/\n{2,}/) // paragraph split
      .map((para, i) => (
        <p key={i} className="mb-4">
          {para.split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              {idx < para.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      ));
  }

  return (
    <>
      <Navbar />
      <main className="container max-w-5xl mx-auto py-10 px-4">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline text-sm">← Kembali</button>
          <div className="text-sm text-gray-500">{formatDate(item.tanggal)} · {readTime} min baca</div>
        </div>

        <article className="bg-white rounded-lg shadow overflow-hidden">
          {item.imgSrc && (
            <div className="relative">
              <img loading="lazy" src={resolveImage(item.imgSrc)} alt={item.title} className="w-full h-80 object-cover" />
              <div className="absolute left-4 top-4 bg-black/60 text-white px-3 py-1 rounded text-xs">{item.kategori?.nama || item.kategori || "Umum"}</div>
              <div className="absolute right-4 top-4 flex gap-2">
                <button onClick={handleShare} title="Share" className="bg-white/80 hover:bg-white px-2 py-1 rounded text-sm">Share</button>
                <button onClick={toggleBookmark} title="Bookmark" className={`bg-white/80 hover:bg-white px-2 py-1 rounded text-sm ${bookmarked ? 'text-yellow-600' : ''}`}>
                  {bookmarked ? "Bookmarked" : "Bookmark"}
                </button>
              </div>
            </div>
          )}

          <div className="p-6">
            <h1 className="text-3xl font-extrabold mb-3">{item.title}</h1>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" fill="currentColor"/></svg> {item.views ?? 0}</div>
                <div className="inline-flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.4"/></svg> {item.comments ?? 0}</div>
              </div>
              <div className="text-gray-400">{formatDate(item.tanggal)}</div>
            </div>

            <div className="prose max-w-none text-gray-800">
              {renderContent(item.content || item.excerpt)}
            </div>

            {/* simple footer actions */}
            <div className="mt-8 flex gap-3">
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="px-4 py-2 bg-gray-100 rounded">Keatas</button>
              <button onClick={() => navigate("/berita")} className="px-4 py-2 bg-blue-600 text-white rounded">Lihat Semua Berita</button>
            </div>
          </div>
        </article>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-10">
            <h3 className="text-xl font-semibold mb-4">Related</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map(r => (
                <article key={r.id} className="flex gap-3 items-start bg-white p-3 rounded shadow hover:shadow-lg transition cursor-pointer" onClick={() => navigate(`/berita/${r.id}`)}>
                  <img src={resolveImage(r.imgSrc || r.gambar)} alt={r.title} className="w-28 h-20 object-cover rounded" />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">{r.kategori?.nama || r.kategori || "Umum"} · {formatDate(r.tanggal)}</div>
                    <div className="font-semibold">{r.title}</div>
                    <div className="text-xs text-gray-500 mt-2 line-clamp-2">{(r.excerpt || r.deskripsi || "").slice(0, 120)}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
      <Navfooter />
    </>
  );
}