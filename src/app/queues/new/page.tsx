'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { createQueueSchema, SERVICE_OPTIONS } from '@/lib/queue-schema';
import { SERVICE_LABEL } from '@/lib/queue-labels';

const SERVICE_ICON: Record<string, string> = {
  haircut: '✂️',
  shave: '🪒',
  haircut_shave: '💈',
  color: '🎨',
};

type FieldErrors = {
  customerName?: string;
  service?: string;
  note?: string;
};

export default function NewQueuePage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [service, setService] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): FieldErrors | null {
    const parsed = createQueueSchema.safeParse({
      customerName,
      service: service || undefined,
      note: note.trim() ? note : undefined,
    });
    if (parsed.success) return null;
    const next: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof FieldErrors;
      if (key && !next[key]) next[key] = issue.message;
    }
    return next;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const fieldErrors = validate();
    if (fieldErrors) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/queues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          service,
          note: note.trim() ? note : undefined,
        }),
      });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({ customerName: data.error || 'บันทึกไม่สำเร็จ' });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'บันทึกคิวเรียบร้อย',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        willClose: () => router.push('/queues'),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link
        href="/queues"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition"
      >
        ← กลับรายการ
      </Link>

      <header className="mt-4 mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 mb-1">
          New Entry
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          เพิ่มคิวใหม่
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6"
      >
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            ชื่อลูกค้า
          </label>
          <input
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              setErrors((prev) => ({ ...prev, customerName: undefined }));
            }}
            placeholder="เช่น สมชาย ใจดี"
            maxLength={100}
            className={`w-full h-11 px-3 rounded-lg border text-sm outline-none transition focus:ring-2 focus:ring-blue-500/30 ${
              errors.customerName
                ? 'border-red-400 focus:border-red-400'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {errors.customerName ? (
            <p className="text-xs text-red-500 mt-1.5">{errors.customerName}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            บริการ
          </label>
          <div className="grid grid-cols-2 gap-3">
            {SERVICE_OPTIONS.map((s) => {
              const active = service === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setService(s);
                    setErrors((prev) => ({ ...prev, service: undefined }));
                  }}
                  className={`flex items-center gap-3 h-14 px-4 rounded-lg border text-left transition active:scale-[0.98] ${
                    active
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl leading-none">{SERVICE_ICON[s]}</span>
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
          {errors.service ? (
            <p className="text-xs text-red-500 mt-1.5">{errors.service}</p>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              หมายเหตุ
            </label>
            <span className="text-xs text-gray-400 tabular-nums">
              {note.length}/500
            </span>
          </div>
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setErrors((prev) => ({ ...prev, note: undefined }));
            }}
            placeholder="เช่น สั้นข้าง ยาวบน / ระวังแพ้ยา"
            maxLength={500}
            rows={3}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition resize-none focus:ring-2 focus:ring-blue-500/30 ${
              errors.note
                ? 'border-red-400 focus:border-red-400'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {errors.note ? (
            <p className="text-xs text-red-500 mt-1.5">{errors.note}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
          <Link
            href="/queues"
            className="h-11 px-5 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition flex items-center"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
          >
            {submitting ? 'กำลังบันทึก...' : 'บันทึกคิว'}
          </button>
        </div>
      </form>
    </main>
  );
}
