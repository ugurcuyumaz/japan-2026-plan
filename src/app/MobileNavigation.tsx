import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './mobile-navigation.css';

const sections = [['travel-desk', 'Travel desk'], ['daily-plan', 'Daily plan'], ['saved-ideas', 'Saved ideas'], ['city-guide', 'City guide'], ['tokyo-practical', 'English workshops & nearby food'], ['tokyo-pool', 'Tokyo ideas'], ['bookings', 'Reservations'], ['stays', 'Stays'], ['budget', 'Budget'], ['share-plan', 'Share your plan'], ['planner-backup', 'Backup & restore']];
export function MobileNavigation({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (id: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  useEffect(() => { document.body.classList.toggle('mobile-navigation-open', open); return () => document.body.classList.remove('mobile-navigation-open'); }, [open]);
  return <dialog id="mobile-menu" className="mobile-navigation-dialog" ref={dialog} aria-labelledby="mobile-navigation-title" onKeyDown={(event) => {
    if (event.key !== 'Tab') return;
    const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button, a[href]') ?? []).filter((item) => item.getClientRects().length > 0);
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target !== event.currentTarget) return; const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); }}>
    <div className="mobile-navigation-heading"><h2 id="mobile-navigation-title">Your travel notebook</h2><button type="button" className="icon-button" aria-label="Close navigation" onClick={onClose}><X size={20} /></button></div>
    <nav aria-label="Mobile navigation">{sections.map(([id, label]) => <a href={`#${id}`} key={id} onClick={(event) => { event.preventDefault(); onNavigate(id); }}>{label}</a>)}</nav>
  </dialog>;
}
