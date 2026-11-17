import React, { useEffect, useRef, useState } from 'react'
import api from '../api.js' // pastikan ada src/api.js axios instance
import Chart from 'chart.js/auto'
import Sidebar from './sidebar.jsx' // <- tambah import sidebar

export default function AdminDashboard() {
  const [stats, setStats] = useState({ pendudukCount: 0, permohonanCount: 0, beritaCount: 0, pengumumanCount: 0 })
  const [yearly, setYearly] = useState([])
  const [pengumuman, setPengumuman] = useState([])
  const [newPengumuman, setNewPengumuman] = useState({ judul: '', deskripsi: '' })
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    loadAll()
    return () => {
      if (chartInstance.current) chartInstance.current.destroy()
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()
    const labels = yearly.map(r => r.year)
    const data = yearly.map(r => r.count)
    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Jumlah Penduduk',
          data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          fill: true,
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    })
  }, [yearly])

  async function loadAll() {
    try {
      // coba ambil stats utama
      const statRes = await api.get('/stats').catch(() => null)
      if (statRes && statRes.data && (statRes.data.pendudukCount !== undefined || statRes.data.permohonanCount !== undefined)) {
        setStats(statRes.data)
      } else {
        // fallback: hit endpoint lain untuk menghitung angka
        const [pendudukRes, permohonanRes, beritaRes] = await Promise.allSettled([
          api.get('/penduduk').catch(() => null),
          api.get('/permohonan').catch(() => null),
          api.get('/berita').catch(() => null),
        ])

        const pendudukCount = (pendudukRes.status === 'fulfilled' && Array.isArray(pendudukRes.value?.data)) ? pendudukRes.value.data.length : (statRes?.data?.pendudukCount ?? 0)
        const permohonanCount = (permohonanRes.status === 'fulfilled' && Array.isArray(permohonanRes.value?.data)) ? permohonanRes.value.data.length : (statRes?.data?.permohonanCount ?? 0)
        const beritaCount = (beritaRes.status === 'fulfilled' && Array.isArray(beritaRes.value?.data)) ? beritaRes.value.data.length : (statRes?.data?.beritaCount ?? 0)

        setStats(s => ({ ...s, pendudukCount, permohonanCount, beritaCount }))
      }

      // yearly (grafik) — coba /penduduk/yearly lalu fallback ke menghitung dari /penduduk jika tersedia
      const yearlyRes = await api.get('/penduduk/yearly').catch(() => null)
      if (yearlyRes && Array.isArray(yearlyRes.data)) {
        setYearly(yearlyRes.data)
      } else {
        // fallback: jika ada /penduduk (array), group by year
        const pendudukRes2 = await api.get('/penduduk').catch(() => null)
        if (pendudukRes2 && Array.isArray(pendudukRes2.data)) {
          // contoh asumsi setiap item punya 'tanggalLahir' atau 'createdAt' — jika tidak, tampilkan total sebagai latest year
          const byYearMap = {}
          pendudukRes2.data.forEach(p => {
            const d = p.tanggalLahir || p.createdAt || null
            const y = d ? new Date(d).getFullYear() : new Date().getFullYear()
            byYearMap[y] = (byYearMap[y] || 0) + 1
          })
          const arr = Object.keys(byYearMap).sort().map(y => ({ year: Number(y), count: byYearMap[y] }))
          setYearly(arr)
        } else {
          setYearly([])
        }
      }

      // pengumuman
      const pengRes = await api.get('/pengumuman').catch(() => null)
      if (pengRes && Array.isArray(pengRes.data)) setPengumuman(pengRes.data)
      else setPengumuman([])
    } catch (e) {
      console.error('Unexpected load error', e)
      setYearly([])
      setPengumuman([])
    }
  }

  async function handleAddPengumuman(e) {
    e.preventDefault()
    try {
      await api.post('/pengumuman', newPengumuman)
      setNewPengumuman({ judul: '', deskripsi: '' })
      await loadAll()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.error || 'Gagal menambah pengumuman')
    }
  }

  async function handleComplete(id) {
    try {
      await api.patch(`/pengumuman/${id}/complete`)
      await loadAll()
    } catch (err) {
      console.error(err)
      alert('Gagal update')
    }
  }

  return (
    // wrap dengan sidebar + main content
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-gray-500">Penduduk</div>
              <div className="text-3xl font-bold">{stats.pendudukCount}</div>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-gray-500">Permohonan</div>
              <div className="text-3xl font-bold">{stats.permohonanCount}</div>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-gray-500">Berita</div>
              <div className="text-3xl font-bold">{stats.beritaCount}</div>
            </div>
          </div>

          <div className="bg-white rounded shadow p-4 mb-6">
            <h3 className="font-semibold mb-2">Jumlah Penduduk Pertahun</h3>
            <canvas ref={chartRef} height={120} />
          </div>

          <div className="bg-white rounded shadow p-4">
            <h3 className="font-semibold mb-2">Papan Pengumuman</h3>

            <form onSubmit={handleAddPengumuman} className="mb-4 flex gap-2">
              <input value={newPengumuman.judul} onChange={e => setNewPengumuman(v => ({ ...v, judul: e.target.value }))} placeholder="Judul" className="border p-2 flex-1 rounded" />
              <input value={newPengumuman.deskripsi} onChange={e => setNewPengumuman(v => ({ ...v, deskripsi: e.target.value }))} placeholder="Deskripsi singkat" className="border p-2 flex-2 rounded" />
              <button className="bg-blue-600 text-white px-4 rounded">Tambahkan</button>
            </form>

            <div className="space-y-3">
              {pengumuman.map(p => (
                <div key={p.id} className="p-3 border rounded flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{p.judul} <span className="text-xs text-gray-500">({new Date(p.tanggal).toLocaleDateString()})</span></div>
                    <div className="text-sm text-gray-600">{p.deskripsi}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className={`text-sm px-3 py-1 rounded ${p.status === 'terpenuhi' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status}</div>
                    {p.status !== 'terpenuhi' && <button onClick={() => handleComplete(p.id)} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Terpenuhi</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}