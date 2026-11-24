import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { listCatalogProducts, listShopOrders } from '@/api/backoffice/ecommerce';
import GrantCreditDialog from './GrantCreditDialog';
import { usePanelQuery } from './data';
import { dateTimeLabel, idOf, num, phoneLabel, tomanLabel } from './format';
import { btn } from './styles';
import { Card, DataTable, EmptyState, QueryBoundary, SectionTitle, StatusBadge } from './ui';
import { cn } from '@/lib/utils';

const PAID = new Set(['paid', 'shipped', 'delivered', 'free_order']);
const ORDER_STATUS = { pending: 'منتظر پرداخت', paid: 'پرداخت‌شده', shipped: 'پرداخت‌شده', delivered: 'پرداخت‌شده', free_order: 'رایگان', cancelled: 'لغوشده', refunded: 'مرجوع', expired: 'منقضی' };
const itemProductId = (item) => String(item?.productId || item?.product?._id || item?.product || item?.id || '');

/** Paid ecommerce orders that contain a booking package, with one-click session credit fulfilment. */
export default function PackageOrders({ clients, services, credits }) {
  const [target, setTarget] = useState(null);
  const products = usePanelQuery(['catalog-products'], async () => Array.from(await listCatalogProducts({ limit: 200 })));
  const orders = usePanelQuery(['shop-orders'], async () => Array.from(await listShopOrders({ limit: 100 })));
  const packages = new Map((products.data || []).filter((p) => (p.tags || []).includes('booking-package')).map((p) => [idOf(p), p]));
  const rows = (orders.data || [])
    .map((order) => {
      const lines = (order.items || []).map((item) => ({ item, product: packages.get(itemProductId(item)) })).filter((l) => l.product);
      return lines.length ? { order, lines } : null;
    })
    .filter(Boolean);

  const clientFor = (order) => {
    const phone = phoneLabel(order.customer?.phone || order.customer?.phoneNumber || order.customer?.mobile || '');
    return (
      clients.find((c) => order.user && String(c.clientUserId) === String(order.user)) ||
      (phone ? clients.find((c) => phoneLabel(c.phoneNumber) === phone) : undefined)
    );
  };
  const fulfilled = (order) => credits.some((c) => String(c.grantReason || '').includes(idOf(order)));
  const guessService = (sessions) => {
    const hits = services.filter((s) => s.package?.enabled && s.package.sessionCount === sessions);
    return hits.length === 1 ? idOf(hits[0]) : '';
  };

  const columns = [
    {
      key: 'who',
      header: 'مشتری',
      primary: true,
      cell: ({ order }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{order.customer?.fullName || order.customer?.name || clientFor(order)?.fullName || 'مشتری سایت'}</p>
          <p dir="ltr" className="text-start text-xs text-muted-foreground">{phoneLabel(order.customer?.phone || order.customer?.phoneNumber || clientFor(order)?.phoneNumber)}</p>
        </div>
      ),
    },
    { key: 'pkg', header: 'بسته', cell: ({ lines }) => lines.map((l) => l.product.title).join('، ') },
    { key: 'total', header: 'مبلغ', cell: ({ order }) => tomanLabel(order.total, order.currency) },
    { key: 'date', header: 'تاریخ', hideOnMobile: true, cell: ({ order }) => dateTimeLabel(order.created_at) },
    { key: 'st', header: 'پرداخت', cell: ({ order }) => <StatusBadge label={ORDER_STATUS[order.status] || order.status} tone={PAID.has(order.status) ? 'good' : order.status === 'pending' ? 'warn' : 'neutral'} /> },
    {
      key: 'act',
      header: 'اعتبار جلسات',
      cell: (row) => {
        const { order } = row;
        const client = clientFor(order);
        if (fulfilled(order)) return <StatusBadge label="ثبت شده" tone="good" />;
        if (!PAID.has(order.status)) return <span className="text-xs text-muted-foreground">پس از تأیید پرداخت</span>;
        if (!client) return <span className="text-xs text-destructive">پرونده مشتری پیدا نشد</span>;
        return (
          <button type="button" className={cn(btn.primary, btn.sm)} onClick={(e) => { e.stopPropagation(); setTarget({ row, client }); }}>
            ثبت اعتبار
          </button>
        );
      },
    },
  ];

  const first = target?.row.lines[0];
  const sessions = num(first?.product.attributes?.sessions);
  return (
    <Card>
      <SectionTitle title="سفارش‌های بسته" hint="بسته‌ها از فروشگاه سایت خریداری می‌شوند؛ پس از تأیید پرداخت، جلسات را به حساب مشتری اضافه کنید" />
      <QueryBoundary
        query={orders.isError ? orders : products}
        isEmpty={!rows.length}
        empty={<EmptyState icon={ShoppingBag} title="هنوز سفارشی برای بسته‌ها ثبت نشده" hint="وقتی مشتری بسته‌ای را از فروشگاه می‌خرد، سفارش او اینجا ظاهر می‌شود." />}
        rows={2}
      >
        <DataTable caption="سفارش‌های بسته" columns={columns} rows={rows} rowKey={({ order }) => idOf(order)} />
      </QueryBoundary>
      {target && (
        <GrantCreditDialog
          client={target.client}
          services={services}
          onClose={() => setTarget(null)}
          defaults={{
            sessions: Number.isFinite(sessions) && sessions > 0 ? sessions : 1,
            days: num(first?.product.attributes?.validityDays) || 90,
            serviceId: guessService(sessions),
            reason: `سفارش ${idOf(target.row.order)}`,
          }}
        />
      )}
    </Card>
  );
}
