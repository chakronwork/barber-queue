'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Queue = {
  id: number;
  customerName: string;
  service: string;
  status: string;
  note: string | null;
  createdAt: string;
};

const SERVICE_LABEL: Record<string, string> = {
  haircut: 'ตัดผม',
  shave: 'โกนหนวด',
  haircut_shave: 'ตัด + โกน',
  color: 'ทำสี',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'รอคิว',
  in_progress: 'กำลังทำ',
  done: 'เสร็จ',
  cancelled: 'ยกเลิก',
};

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  in_progress: 'bg-blue-100 text-blue-800 ring-blue-200',
  done: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  cancelled: 'bg-red-100 text-red-800 ring-red-200',
};

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-amber-500',
  in_progress: 'bg-blue-500',
  done: 'bg-emerald-500',
  cancelled: 'bg-red-500',
};

export default function QueuesPage() {
  const router = useRouter();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stats = useMemo(() => {
    const count = (s: string) => queues.filter((q) => q.status === s).length;
    return [
      { key: 'pending', label: 'รอคิว', value: count('pending'), color: 'text-amber-600' },
      { key: 'in_progress', label: 'กำลังทำ', value: count('in_progress'), color: 'text-blue-600' },
      { key: 'done', label: 'เสร็จ', value: count('done'), color: 'text-emerald-600' },
      { key: 'all', label: 'ทั้งหมด', value: queues.length, color: 'text-gray-900' },
    ];
  }, [queues]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/queues');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('load failed');
      const data = await res.json();
      setQueues(data.queues);
    } catch {
      setError('โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!window.confirm('ลบคิวนี้ใช่ไหม?')) return;
    const res = await fetch(`/api/queues/${id}`, { method: 'DELETE' });
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    if (!res.ok) {
      alert('ลบไม่สำเร็จ');
      return;
    }
    load();
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString('th-TH');
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <header className="animate-fade-up flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 mb-1">
            Barber Queue
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            แผงควบคุมคิว
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/queues/new"
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
          >
            + เพิ่มคิว
          </Link>
          <button
            onClick={handleLogout}
            className="border border-gray-300 hover:bg-gray-100 active:scale-95 transition text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      <section className="animate-fade-up bg-white border border-gray-200 rounded-xl mb-6 flex divide-x divide-gray-200 overflow-hidden shadow-sm">
        {stats.map((s) => (
          <div key={s.key} className="flex-1 px-5 py-4">
            <div className={`text-2xl font-extrabold tabular-nums ${s.color}`}>
              {s.value}
            </div>
            <div className="text-xs font-medium text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </section>

      <div className="animate-fade-up bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">#</th>
              <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">ลูกค้า</th>
              <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">บริการ</th>
              <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">สถานะ</th>
              <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">เวลาเข้าคิว</th>
              <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, c) => (
                    <td key={c} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : queues.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="text-4xl mb-2">✂️</div>
                  <div className="text-gray-500 font-medium">ยังไม่มีคิวในระบบ</div>
                  <div className="text-gray-400 text-xs mt-1">กด “+ เพิ่มคิว” เพื่อเริ่ม</div>
                </td>
              </tr>
            ) : (
              queues.map((q, i) => (
                <tr
                  key={q.id}
                  className="animate-fade-in hover:bg-blue-50/40 transition-colors"
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs">
                    #{q.id}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900">
                    {q.customerName}
                    {q.note ? (
                      <div className="text-xs font-normal text-gray-400 mt-0.5">
                        {q.note}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-gray-700">
                    {SERVICE_LABEL[q.service] ?? q.service}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
                        STATUS_STYLE[q.status] ?? 'bg-gray-100 text-gray-700 ring-gray-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[q.status] ?? 'bg-gray-400'} ${
                          q.status === 'in_progress' ? 'pulse-dot' : ''
                        }`}
                      />
                      {STATUS_LABEL[q.status] ?? q.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs font-mono">
                    {formatTime(q.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-3">
                      <Link
                        href={`/queues/${q.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        ดู / แก้
                      </Link>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="text-red-500 hover:text-red-700 font-medium transition"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
