import { useEffect, useRef } from 'react';

/** Accessible modal on the native <dialog> (focus trap + Esc come from the platform). */
export default function Modal({ open, onClose, title, children, wide }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`cl-dialog${wide ? ' cl-dialog-wide' : ''}`}
      aria-labelledby="cl-dialog-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      dir="rtl"
    >
      {open ? (
        <div className="cl-dialog-in">
          <div className="cl-dialog-head">
            <h2 id="cl-dialog-title">{title}</h2>
            <button type="button" className="cl-iconbtn" onClick={onClose} aria-label="بستن">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
