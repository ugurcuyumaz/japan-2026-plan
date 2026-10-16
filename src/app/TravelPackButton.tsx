import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { buildTravelPack } from '../data/travelPack';
import type { ShortlistKey } from '../data/shortlist';
import type { BookingProgress } from '../data/bookingProgress';
import type { TokyoChoices } from '../data/tokyoChoices';

export function TravelPackButton({ choices, dayId, iconOnly = false, bookingProgress = {}, savedKeys = [] }: { choices: TokyoChoices; dayId?: string; iconOnly?: boolean; bookingProgress?: BookingProgress; savedKeys?: ShortlistKey[] }) {
  const [notice, setNotice] = useState('');
  useEffect(() => setNotice(''), [dayId, choices, bookingProgress, savedKeys]);
  const save = () => {
    try {
      const file = new Blob([buildTravelPack(choices, dayId, new Date(), bookingProgress, savedKeys)], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `japan-2026-${dayId ?? 'travel-pack'}.html`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('Download started. Keep the HTML file in Downloads or Files and open it before going offline. Save again after changing your plan.');
    } catch { setNotice('The download could not start. Try the browser’s Print / Save as PDF option.'); }
  };
  const label = dayId ? 'Save this day offline' : 'Save offline travel pack';
  return <div className={`travel-pack-action${iconOnly ? ' icon-only' : ''}`}><button type="button" className="secondary-button" onClick={save} aria-label={label}><Download size={16} />{!iconOnly && label}</button>{notice && <p className="download-notice" role="status">{notice}</p>}</div>;
}
