export const SERVICE_LABEL: Record<string, string> = {
  haircut: 'ตัดผม',
  shave: 'โกนหนวด',
  haircut_shave: 'ตัด + โกน',
  color: 'ทำสี',
};

export const STATUS_LABEL: Record<string, string> = {
  pending: 'รอคิว',
  in_progress: 'กำลังทำ',
  done: 'เสร็จ',
  cancelled: 'ยกเลิก',
};

export const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  in_progress: 'bg-blue-100 text-blue-800 ring-blue-200',
  done: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  cancelled: 'bg-red-100 text-red-800 ring-red-200',
};

export const STATUS_DOT: Record<string, string> = {
  pending: 'bg-amber-500',
  in_progress: 'bg-blue-500',
  done: 'bg-emerald-500',
  cancelled: 'bg-red-500',
};
