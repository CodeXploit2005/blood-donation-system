import React, { type ReactNode } from 'react';
import { ScanLine } from 'lucide-react';

export default function QRCodeFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[280px] mx-auto rounded-[26px] border border-sand bg-porcelain-card p-2.5 shadow-warm">
      <div className="relative rounded-[18px] bg-white p-2">
        <span aria-hidden="true" className="pointer-events-none absolute left-2.5 top-2.5 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-[#C4384A]" />
        <span aria-hidden="true" className="pointer-events-none absolute right-2.5 top-2.5 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-[#C4384A]" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-2.5 left-2.5 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-[#C4384A]" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-2.5 right-2.5 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-[#C4384A]" />
        {children}
      </div>
      <div className="flex items-center justify-center gap-2 pb-1 pt-3 text-[10px] font-semibold tracking-wide text-ink-muted">
        <ScanLine className="h-3.5 w-3.5 text-crimson" />
        <span>QUÉT MÃ ĐỂ ĐIỂM DANH</span>
      </div>
    </div>
  );
}
