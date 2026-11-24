import { Link } from 'react-router-dom';
import { nf } from '@/components/site/format';
import { ExternalLink } from 'lucide-react';

export default function AdminFooter() {
  return (
    <footer className="cl-admin-footer" role="contentinfo">
      <div className="cl-wrap cl-admin-footer-in">
        <div className="flex items-center justify-center flex-row flex-wrap gap-2.5 sm:gap-4 text-xs text-[var(--cl-muted)]">
          <Link
            to="/"
            className="text-[var(--cl-muted)] hover:text-[var(--cl-teal)] transition-colors inline-flex items-center gap-1"
          >
            <span>مشاهده سایت عمومی</span>
            <ExternalLink size={12} aria-hidden="true" />
          </Link>
          <span className="text-[var(--cl-line)] select-none" aria-hidden="true">•</span>
          <span>کلیه حقوق محفوظ است © {nf(1405)}</span>
        </div>
      </div>
    </footer>
  );
}

