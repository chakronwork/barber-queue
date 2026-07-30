'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  updateQueueSchema,
  SERVICE_OPTIONS,
  STATUS_OPTIONS,
} from '@/lib/queue-schema';
import {
  SERVICE_LABEL,
  STATUS_LABEL,
  STATUS_STYLE,
  STATUS_DOT,
} from '@/lib/queue-labels';

type Queue = {
  id: number;
  customerName: string;
  service: string;
  status: string;
  note: string | null;
  createdAt: string;
};

const SERVICE_ICON: Record<string, string> = {
  haircut: '✂️',
  shave: '🪒',
  haircut_shave: '💈',
  color: '🎨',
};

export default function QueueDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [queue, setQueue] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{
    customerName: string;
    service: string;
    note: string;
  }>({ customerName: '', service: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState('');

  function showFlash(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(''), 1800);
  }

  async function load() {
    setLoading(true);
    setError('');
    setNotFound(false);
    const res = await fetch(`/api/queues/${id}`);
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    if (res.status === 404) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setError('โหลดข้อมูลไม่สำเร็จ');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setQueue(data.queue);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function changeStatus(next: string) {
    if (!queue || queue.status === next) return;
    const prev = queue.status;
    setQueue({ ...queue, status: next });
    const res = await fetch(`/api/queues/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      setQueue({ ...queue, status: prev });
      showFlash('เปลี่ยนสถานะไม่สำเร็จ');
      return;
    }
    showFlash('อัปเดตสถานะแล้ว');
  }

  function startEdit() {
    if (!queue) return;
    setDraft({
      customerName: queue.customerName,
      service: queue.service,
      note: queue.note ?? '',
    });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setDraft({ customerName: '', service: '', note: '' });
  }

  async function saveEdit() {
    const parsed = updateQueueSchema.safeParse({
      customerName: draft.customerName,
      service: draft.service,
      note: draft.note.trim() ? draft.note : undefined,
    });
    if (!parsed.success) {
      showFlash(parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง');
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/queues/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    if (!res.ok) {
      showFlash('บันทึกการแก้ไขไม่สำเร็จ');
      setSaving(false);
      return;
    }
    const data = await res.json();
    setQueue(data.queue);
    setEditing(false);
    setSaving(false);
    showFlash('บันทึกการแก้ไขแล้ว');
  }

  async function handleDelete() {
    if (!window.confirm('ลบคิวนี้ใช่ไหม?')) return;
    const res = await fetch(`/api/queues/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      showFlash('ลบไม่สำเร็จ');
      return;
    }
    router.push('/queues');
  }

  if (flash) {
    return (
      <>
        <DetailBody
          queue={queue}
          loading={loading}
          notFound={notFound}
          error={error}
          editing={editing}
          draft={draft}
          setDraft={setDraft}
          saving={saving}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSaveEdit={saveEdit}
          onChangeStatus={changeStatus}
          onDelete={handleDelete}
          onBack={() => router.push('/queues')}
        />
        <div className="fixed top-4 right-4 z-50 animate-fade-in bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg">
          {flash}
        </div>
      </>
    );
  }

  return (
    <DetailBody
      queue={queue}
      loading={loading}
      notFound={notFound}
      error={error}
      editing={editing}
      draft={draft}
      setDraft={setDraft}
      saving={saving}
      onStartEdit={startEdit}
      onCancelEdit={cancelEdit}
      onSaveEdit={saveEdit}
      onChangeStatus={changeStatus}
      onDelete={handleDelete}
      onBack={() => router.push('/queues')}
    />
  );
}

function DetailBody(props: {
  queue: Queue | null;
  loading: boolean;
  notFound: boolean;
  error: string;
  editing: boolean;
  draft: { customerName: string; service: string; note: string };
  setDraft: (d: { customerName: string; service: string; note: string }) => void;
  saving: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onChangeStatus: (s: string) => void;
  onDelete: () => void;
  onBack: () => void;
}) {
  const {
    queue,
    loading,
    notFound,
    error,
    editing,
    draft,
    setDraft,
    saving,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onChangeStatus,
    onDelete,
    onBack,
  } = props;

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition"
      >
        ← กลับรายการ
      </button>

      {loading ? (
        <div className="animate-fade-up mt-4 space-y-4">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 h-64 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      ) : notFound ? (
        <div className="animate-fade-up mt-6 bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-semibold text-gray-800">ไม่พบคิวนี้</p>
          <p className="text-sm text-gray-500 mt-1">อาจถูกลบไปแล้ว</p>
          <button
            onClick={onBack}
            className="mt-5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            กลับรายการ
          </button>
        </div>
      ) : error ? (
        <div className="animate-fade-up mt-6 bg-white border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      ) : queue ? (
        <>
          <header className="animate-fade-up mt-4 mb-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 mb-1">
                Queue #{queue.id}
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {editing ? 'แก้ไขคิว' : queue.customerName}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button
                    onClick={onCancelEdit}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-100 transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={onSaveEdit}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition disabled:opacity-60"
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onStartEdit}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-100 transition"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={onDelete}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition"
                  >
                    ลบ
                  </button>
                </>
              )}
            </div>
          </header>

          <div className="grid md:grid-cols-3 gap-4">
            <section className="animate-fade-up md:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
              <Field label="ชื่อลูกค้า">
                {editing ? (
                  <input
                    value={draft.customerName}
                    onChange={(e) =>
                      setDraft({ ...draft, customerName: e.target.value })
                    }
                    maxLength={100}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-900">
                    {queue.customerName}
                  </span>
                )}
              </Field>

              <Field label="บริการ">
                {editing ? (
                  <div className="grid grid-cols-2 gap-3">
                    {SERVICE_OPTIONS.map((s) => {
                      const active = draft.service === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setDraft({ ...draft, service: s })}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition active:scale-[0.98] ${
                            active
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-xl leading-none">
                            {SERVICE_ICON[s]}
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              active ? 'text-blue-700' : 'text-gray-700'
                            }`}
                          >
                            {SERVICE_LABEL[s]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-2 text-gray-800 font-medium">
                    <span>{SERVICE_ICON[queue.service]}</span>
                    {SERVICE_LABEL[queue.service] ?? queue.service}
                  </span>
                )}
              </Field>

              <Field label="หมายเหตุ">
                {editing ? (
                  <textarea
                    value={draft.note}
                    onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                    maxLength={500}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition resize-none"
                  />
                ) : queue.note ? (
                  <span className="text-gray-700">{queue.note}</span>
                ) : (
                  <span className="text-gray-400 text-sm">ไม่มี</span>
                )}
              </Field>

              <Field label="เวลาเข้าคิว">
                <span className="text-gray-500 text-sm font-mono">
                  {new Date(queue.createdAt).toLocaleString('th-TH')}
                </span>
              </Field>
            </section>

            <aside className="animate-fade-up bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                สถานะปัจจุบัน
              </p>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ring-1 mb-5 ${
                  STATUS_STYLE[queue.status] ?? 'bg-gray-100 text-gray-700 ring-gray-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${STATUS_DOT[queue.status] ?? 'bg-gray-400'} ${
                    queue.status === 'in_progress' ? 'pulse-dot' : ''
                  }`}
                />
                {STATUS_LABEL[queue.status] ?? queue.status}
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                เปลี่ยนเป็น
              </p>
              <div className="space-y-2">
                {STATUS_OPTIONS.map((s) => {
                  const active = queue.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => onChangeStatus(s)}
                      disabled={editing}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium text-left transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
                        active
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`}
                      />
                      {STATUS_LABEL[s]}
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
        </>
      ) : null}
    </main>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
        {props.label}
      </p>
      {props.children}
    </div>
  );
}
