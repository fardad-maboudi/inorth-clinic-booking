import { Fragment, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatIranianMobile, normalizeIranianMobile } from "@/api/auth";
import { APP_ID, clearAuthToken, me } from "@/api/plugins/auth";
import {
  getMyMembership,
  inviteMember,
  listMembers,
  listRoles,
} from "@/api/backoffice/team";
import {
  cancelShopOrder,
  fulfillOrder,
  listCatalogProducts,
  listCustomers,
  listShopOrders,
  listStoreSettings,
  refundOrder,
  saveProduct as saveCatalogProduct,
} from "@/api/backoffice/ecommerce";
import {
  cancelBooking,
  completeBooking,
  confirmBooking,
  getCalendar,
  noShowBooking,
  rescheduleBooking,
} from "@/api/backoffice/bookings";
import { Logo } from "@/components/site/ui";
import AdminFooter from "@/components/admin/AdminFooter";
import {
  fmtFullDate,
  fmtTime,
  money,
  nf,
  STATUS_FA,
  toPersianDigits,
} from "@/components/site/format";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Edit2,
  ExternalLink,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Users,
  Video,
  X,
} from "lucide-react";

const ORDER_STATUS_FA = {
  paid: "پرداخت‌شده",
  pending: "در انتظار پرداخت",
  expired: "منقضی‌شده",
  cancelled: "لغوشده",
  refunded: "مرجوع‌شده",
};

const FULFILLMENT_STATUS_FA = {
  fulfilled: "ارسال‌شده ✓",
  unfulfilled: "در نوبت ارسال",
  processing: "در حال پردازش",
  shipped: "ارسال‌شده",
  delivered: "تحویل‌شده",
};

function formatPersianMobile(raw) {
  if (!raw || raw === "—") return "—";
  const canonical = formatIranianMobile(raw);
  return canonical ? toPersianDigits(canonical) : toPersianDigits(String(raw));
}

export default function Admin() {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productTitle, setProductTitle] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundRef, setRefundRef] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [caps, setCaps] = useState([]);
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // 'info' | 'success' | 'error'
  const [section, setSection] = useState("orders");
  const [busyAction, setBusyAction] = useState(false);

  useEffect(() => {
    let mounted = true;
    me()
      .then((user) => {
        if (!mounted) return;
        if (user.tokenKind !== "site_admin" || user.appId !== APP_ID) {
          navigate("/admin/login", { replace: true });
          return;
        }
        setIdentity(user);
        getMyMembership()
          .then((membership) => {
            if (!mounted) return;
            const held = membership?.capabilities || [];
            setCaps(held);
            if (held.includes("team:read") || held.includes("team:manage")) {
              listMembers()
                .then((list) => {
                  if (mounted) setMembers(list);
                })
                .catch(() => {});
            }
            if (held.includes("team:manage")) {
              listRoles()
                .then((list) => {
                  if (mounted)
                    setRoles(
                      list.filter(
                        (role) =>
                          role.subjectKinds?.includes("siteUser") &&
                          (role.capabilities || []).every((c) =>
                            held.includes(c),
                          ),
                      ),
                    );
                })
                .catch(() => {});
            }
            if (held.includes("booking:manage")) {
              getCalendar()
                .then((result) => {
                  if (mounted) setBookings(result?.bookings || []);
                })
                .catch(() => {});
            }
          })
          .catch(() => {});

        listShopOrders()
          .then((result) => {
            if (mounted) setOrders(result);
          })
          .catch((error) => {
            if (mounted) {
              setMessage(error.message);
              setMessageType("error");
            }
          });

        listCatalogProducts()
          .then((result) => {
            if (mounted) setProducts(result);
          })
          .catch(() => {});

        listCustomers()
          .then((result) => {
            if (mounted) setCustomers(result);
          })
          .catch(() => {});

        listStoreSettings()
          .then((result) => {
            if (mounted) setSettings(result);
          })
          .catch(() => {});
      })
      .catch(() => {
        if (mounted) navigate("/admin/login", { replace: true });
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  function handleLogout() {
    clearAuthToken();
    navigate("/admin/login", { replace: true });
  }

  function flashMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);
  }

  async function invite(event) {
    event.preventDefault();
    setMessage("");
    setInviteUrl("");
    setBusyAction(true);
    try {
      const result = await inviteMember({
        phone: normalizeIranianMobile(phone),
        roleIds: [roleId],
      });
      setInviteUrl(result.inviteUrl);
      setMembers((current) => [...current, result.member]);
      setPhone("");
      flashMessage("دعوت‌نامه با موفقیت صادر شد", "success");
    } catch (error) {
      flashMessage(error.message, "error");
    } finally {
      setBusyAction(false);
    }
  }

  async function orderAction(order, action, body = {}) {
    setMessage("");
    setBusyAction(true);
    try {
      if (action === "fulfill") await fulfillOrder(order);
      else if (action === "cancel") await cancelShopOrder(order, body);
      else if (action === "refund") await refundOrder(order, body);
      const refreshed = await listShopOrders();
      setOrders(refreshed);
      setSelectedOrder(null);
      setRefundRef("");
      setRefundReason("");
      flashMessage("وضعیت سفارش با موفقیت به‌روزرسانی شد", "success");
    } catch (error) {
      flashMessage(error.message, "error");
    } finally {
      setBusyAction(false);
    }
  }

  async function bookingAction(booking, action, body = {}) {
    setMessage("");
    setBusyAction(true);
    try {
      const id = booking._id || booking.id;
      if (action === "confirm") await confirmBooking(id);
      else if (action === "complete") await completeBooking(id);
      else if (action === "no-show") await noShowBooking(id);
      else if (action === "cancel") await cancelBooking(id, body);
      else if (action === "reschedule") await rescheduleBooking(id, body);
      const refreshed = await getCalendar();
      setBookings(refreshed?.bookings || []);
      setSelectedBooking(null);
      flashMessage("وضعیت نوبت درمانی به‌روزرسانی شد", "success");
    } catch (error) {
      flashMessage(error.message, "error");
    } finally {
      setBusyAction(false);
    }
  }

  async function saveProduct(event) {
    event.preventDefault();
    setMessage("");
    setBusyAction(true);
    try {
      const id = editingProduct?._id || editingProduct?.id;
      await saveCatalogProduct({
        ...(id ? { _id: id } : {}),
        title: productTitle.trim(),
        price: Number(productPrice),
        stock: Number(productStock),
      });
      setProducts(await listCatalogProducts());
      setEditingProduct(null);
      setProductTitle("");
      setProductPrice("");
      setProductStock("");
      flashMessage("اطلاعات محصول با موفقیت ذخیره شد", "success");
    } catch (error) {
      flashMessage(error.message, "error");
    } finally {
      setBusyAction(false);
    }
  }

  const can = (capability) => caps.includes(capability);
  const canSeeTeam = can("team:read") || can("team:manage");

  if (!identity) {
    return (
      <main id="main" dir="rtl" className="cl-admin-login-bg">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={28} className="animate-spin text-[var(--cl-teal)]" />
          <p className="text-sm font-medium text-[var(--cl-muted)]">
            در حال احراز هویت و بارگذاری دسترسی‌های مدیر…
          </p>
        </div>
      </main>
    );
  }

  const pendingBookingsCount = bookings.filter((b) => b.status === "pending").length;
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;
  const paidOrdersCount = orders.filter((o) => o.status === "paid").length;

  const navTabs = [
    { key: "orders", label: "سفارش‌ها", cap: "order:read", count: orders.length, icon: ShoppingBag },
    { key: "bookings", label: "نوبت‌ها و رویدادها", cap: "booking:manage", count: bookings.length, icon: Calendar },
    { key: "products", label: "محصولات و بسته‌ها", cap: "product:read", count: products.length, icon: Package },
    { key: "customers", label: "مشتریان", cap: "customer:read", count: customers.length, icon: Users },
    { key: "members", label: "اعضای تیم", cap: null, count: members.length, icon: ShieldCheck },
    { key: "settings", label: "تنظیمات", cap: "store:settings:read", count: null, icon: Settings },
  ].filter((tab) => (tab.key === "members" ? canSeeTeam : can(tab.cap)));

  return (
    <div dir="rtl" className="cl-admin-app">
      {/* Top Admin Header Bar */}
      <header className="cl-admin-header">
        <div className="cl-wrap cl-admin-header-in">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group" title="مشاهده صفحه اصلی سایت">
              <div className="w-9 h-9 rounded-xl bg-[var(--cl-teal-soft)] border border-[var(--color-brand-100)] flex items-center justify-center text-[var(--cl-teal)]">
                <Logo size={22} />
              </div>
            </Link>
            <div className="py-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-[var(--cl-ink)] leading-snug">
                  پنل مدیریت کلینیک نیلوفر
                </h1>
                <span className="cl-admin-badge cl-admin-badge-info hidden sm:inline-flex">
                  <ShieldCheck size={12} />
                  <span>مدیر سایت</span>
                </span>
              </div>
              <p className="text-xs text-[var(--cl-muted)] mt-1">
                مدیریت نوبت‌های درمانی، سفارش‌ها و اعضای تیم
              </p>
            </div>
          </div>

          {/* User Identity & Top Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex flex-col text-left text-xs text-[var(--cl-muted)] bg-[var(--color-surface)] px-3 py-1.5 rounded-lg border border-[var(--cl-line)]">
              <span className="font-semibold text-[var(--cl-ink)]" dir="ltr">
                {identity.phone ? formatPersianMobile(identity.phone) : identity.fullName}
              </span>
              <span className="text-[10px] text-[var(--cl-teal)]">مجوز دسترسی فعال</span>
            </div>

            <Link
              to="/"
              className="cl-btn cl-btn-outline cl-btn-sm inline-flex items-center gap-1.5"
              title="مشاهده سایت عمومی"
            >
              <ExternalLink size={15} />
              <span className="hidden sm:inline">مشاهده سایت</span>
            </Link>

            <button
              onClick={handleLogout}
              type="button"
              className="cl-btn cl-btn-ghost cl-btn-sm text-[var(--color-state-error-ink)] hover:bg-[#fff1f1] inline-flex items-center gap-1.5"
              title="خروج از حساب مدیریت"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main" className="cl-wrap py-6 flex-1">
        {/* KPI Stat Ribbon */}
        <section className="cl-admin-stat-grid" aria-label="خلاصه آماری کلینیک">
          <div className="cl-admin-stat-card">
            <div className="cl-admin-stat-icon bg-[var(--cl-teal-soft)] text-[var(--cl-teal)]">
              <Calendar size={22} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--cl-muted)]">نوبت‌های درمان</div>
              <div className="text-xl font-bold text-[var(--cl-ink)] mt-0.5">
                {nf(bookings.length)}{" "}
                <span className="text-xs font-normal text-[var(--cl-muted)]">نوبت</span>
              </div>
              {pendingBookingsCount > 0 && (
                <div className="text-[11px] font-medium text-[var(--color-state-warning-ink)] mt-0.5">
                  {nf(pendingBookingsCount)} نوبت در انتظار تأیید
                </div>
              )}
            </div>
          </div>

          <div className="cl-admin-stat-card">
            <div className="cl-admin-stat-icon bg-emerald-50 text-emerald-700">
              <ShoppingBag size={22} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--cl-muted)]">سفارش‌ها و بسته‌ها</div>
              <div className="text-xl font-bold text-[var(--cl-ink)] mt-0.5">
                {nf(orders.length)}{" "}
                <span className="text-xs font-normal text-[var(--cl-muted)]">سفارش</span>
              </div>
              {paidOrdersCount > 0 ? (
                <div className="text-[11px] font-medium text-emerald-700 mt-0.5">
                  {nf(paidOrdersCount)} پرداخت‌شده آماده ارسال
                </div>
              ) : pendingOrdersCount > 0 ? (
                <div className="text-[11px] font-medium text-[var(--color-state-warning-ink)] mt-0.5">
                  {nf(pendingOrdersCount)} در انتظار پرداخت
                </div>
              ) : null}
            </div>
          </div>

          <div className="cl-admin-stat-card">
            <div className="cl-admin-stat-icon bg-blue-50 text-blue-700">
              <Package size={22} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--cl-muted)]">کاتالوگ محصولات</div>
              <div className="text-xl font-bold text-[var(--cl-ink)] mt-0.5">
                {nf(products.length)}{" "}
                <span className="text-xs font-normal text-[var(--cl-muted)]">آیتم</span>
              </div>
              <div className="text-[11px] font-medium text-[var(--cl-muted)] mt-0.5">
                فعال در فروشگاه
              </div>
            </div>
          </div>

          <div className="cl-admin-stat-card">
            <div className="cl-admin-stat-icon bg-purple-50 text-purple-700">
              <Users size={22} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--cl-muted)]">تیم و مشتریان</div>
              <div className="text-xl font-bold text-[var(--cl-ink)] mt-0.5">
                {nf(customers.length)}{" "}
                <span className="text-xs font-normal text-[var(--cl-muted)]">مشتری</span>
              </div>
              <div className="text-[11px] font-medium text-[var(--cl-muted)] mt-0.5">
                {nf(members.length)} عضو کادر درمانی
              </div>
            </div>
          </div>
        </section>

        {/* Global Feedback Banner */}
        {message && (
          <div
            role="alert"
            className={`mb-6 flex items-center justify-between gap-3 rounded-xl p-4 text-sm transition-all shadow-sm ${
              messageType === "success"
                ? "bg-[#e6f6ea] border border-[#a7f3d0] text-[var(--color-state-success-ink)]"
                : messageType === "error"
                ? "bg-[#fff1f1] border border-[#f1c5c7] text-[var(--color-state-error-ink)]"
                : "bg-[var(--cl-teal-soft)] border border-[var(--color-brand-200)] text-[var(--cl-teal-d)]"
            }`}
          >
            <div className="flex items-center gap-2.5 font-medium">
              {messageType === "success" ? (
                <CheckCircle2 size={18} className="shrink-0" />
              ) : (
                <AlertCircle size={18} className="shrink-0" />
              )}
              <span>{message}</span>
            </div>
            <button
              onClick={() => setMessage("")}
              className="p-1 rounded-lg hover:bg-black/5 text-inherit"
              aria-label="بستن پیام"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <nav
          className="cl-filters flex-nowrap overflow-x-auto pb-1 mb-6 border-b border-[var(--cl-line)]"
          aria-label="بخش‌های مدیریت"
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const active = section === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setSection(tab.key);
                  setMessage("");
                }}
                aria-current={active ? "page" : undefined}
                className={`cl-pill flex items-center gap-2 shrink-0 ${active ? "on" : ""}`}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-[var(--color-surface)] text-[var(--cl-muted)] border border-[var(--cl-line)]"
                    }`}
                  >
                    {nf(tab.count)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* SECTION: ORDERS */}
        {section === "orders" && (
          <section aria-labelledby="section-orders-title">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="section-orders-title" className="text-xl font-bold text-[var(--cl-ink)]">
                  مدیریت سفارش‌ها و خریدهای آنلاین
                </h2>
                <p className="text-xs text-[var(--cl-muted)] mt-0.5">
                  سفارش‌های ثبت‌شده، وضعیت پرداخت، ارسال و بازگشت وجه
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setOrders(await listShopOrders());
                  flashMessage("لیست سفارش‌ها به‌روزرسانی شد", "info");
                }}
                className="cl-btn cl-btn-outline cl-btn-sm inline-flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>بروزرسانی</span>
              </button>
            </div>

            {orders.length ? (
              <div className="cl-admin-table-wrap">
                <table className="cl-admin-table">
                  <thead>
                    <tr>
                      <th className="text-start">شناسه سفارش</th>
                      <th className="text-start">مشتری</th>
                      <th className="text-center">شماره تماس</th>
                      <th className="text-center">وضعیت پرداخت</th>
                      <th className="text-center">وضعیت ارسال</th>
                      <th className="text-center">مبلغ کل</th>
                      <th className="text-center w-20">اقدام</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const id = order.orderNumber || order._id || order.id;
                      const isPaid = order.status === "paid";
                      const isPending = order.status === "pending";
                      const isCancelled = order.status === "cancelled";
                      const isRefunded = order.status === "refunded";
                      const isSelected =
                        (selectedOrder?._id || selectedOrder?.id || selectedOrder?.orderNumber) ===
                        (order._id || order.id || order.orderNumber);

                      return (
                        <Fragment key={order._id || order.id || id}>
                          <tr className={`transition-colors duration-150 ${isSelected ? "bg-[var(--cl-teal-soft)]/50" : ""}`}>
                            <td className="text-start font-mono text-xs font-bold text-[var(--cl-teal-d)]">
                              <span className="inline-block" dir="ltr">{id}</span>
                            </td>
                            <td className="text-start">
                              <span className="font-semibold text-sm">
                                {order.customer?.name || order.shipping?.name || "مشتری ناشناس"}
                              </span>
                            </td>
                            <td className="text-center font-bold text-sm text-[var(--cl-ink)]">
                              <span className="inline-block" dir="ltr">
                                {formatPersianMobile(
                                  order.customer?.phone || order.shipping?.phone || "—",
                                )}
                              </span>
                            </td>
                            <td className="text-center">
                              <span
                                className={`cl-admin-badge ${
                                  isPaid
                                    ? "cl-admin-badge-success"
                                    : isPending
                                    ? "cl-admin-badge-warning"
                                    : isCancelled || isRefunded
                                    ? "cl-admin-badge-error"
                                    : "cl-admin-badge-neutral"
                                }`}
                              >
                                {ORDER_STATUS_FA[order.status] || order.status}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className="text-xs font-medium text-[var(--cl-muted)]">
                                {FULFILLMENT_STATUS_FA[order.fulfillmentStatus] || order.fulfillmentStatus || "—"}
                              </span>
                            </td>
                            <td className="text-center font-bold text-sm text-[var(--cl-ink)]">
                              {money(order.totalAmount ?? order.total ?? 0)}
                            </td>
                            <td className="text-center">
                              <div className="flex justify-center items-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(isSelected ? null : order)}
                                  className={`cl-btn cl-btn-sm p-2 rounded-xl transition-all duration-200 ${
                                    isSelected
                                      ? "bg-[var(--cl-teal)] text-white shadow-sm"
                                      : "cl-btn-outline hover:bg-[var(--cl-teal-soft)] text-[var(--cl-teal-d)]"
                                  }`}
                                  aria-expanded={isSelected}
                                  aria-label={isSelected ? "بستن کشوی جزئیات سفارش" : "مشاهده کشوی جزئیات سفارش"}
                                  title={isSelected ? "بستن جزئیات" : "مشاهده و اقدام برای سفارش"}
                                >
                                  <ChevronDown
                                    size={18}
                                    className={`transition-transform duration-300 ease-out ${
                                      isSelected ? "rotate-180" : "rotate-0"
                                    }`}
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Dropdown Drawer Below Item */}
                          {isSelected && (
                            <tr className="cl-admin-drawer-row">
                              <td colSpan={7} className="p-0 border-b-2 border-[var(--color-brand-200)] bg-[var(--cl-bg)]">
                                <div className="cl-admin-drawer-content p-4 sm:p-6 bg-gradient-to-b from-[var(--cl-teal-soft)]/20 to-[var(--color-surface)]">
                                  <div className="flex items-center justify-between border-b border-[var(--cl-line)] pb-3 mb-4">
                                    <div>
                                      <h3 className="text-base sm:text-lg font-bold text-[var(--cl-ink)]">
                                        جزئیات کامل سفارش {order.orderNumber || order.id}
                                      </h3>
                                      <p className="text-xs text-[var(--cl-muted)] mt-0.5">
                                        وضعیت پرداخت: <strong>{order.status}</strong> · وضعیت ارسال:{" "}
                                        <strong>{order.fulfillmentStatus || "unfulfilled"}</strong>
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => setSelectedOrder(null)}
                                      className="cl-btn cl-btn-ghost cl-btn-sm text-xs"
                                      aria-label="بستن پنجره جزئیات"
                                    >
                                      <X size={16} />
                                      <span>بستن</span>
                                    </button>
                                  </div>

                                  {/* Items & Customer Breakdown */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white p-4 rounded-xl border border-[var(--cl-line)] shadow-sm">
                                      <h4 className="text-xs font-bold text-[var(--cl-muted)] uppercase mb-2">
                                        مشخصات خریدار و تحویل
                                      </h4>
                                      <div className="space-y-1.5 text-sm">
                                        <div>
                                          نام:{" "}
                                          <strong className="text-[var(--cl-ink)]">
                                            {order.customer?.name || order.shipping?.name || "—"}
                                          </strong>
                                        </div>
                                        <div>
                                          شماره تماس:{" "}
                                          <span className="font-bold text-[var(--cl-ink)]" dir="ltr">
                                            {formatPersianMobile(
                                              order.customer?.phone || order.shipping?.phone || "—",
                                            )}
                                          </span>
                                        </div>
                                        <div>آدرس: {order.shipping?.address || "مراجعه حضوری به کلینیک"}</div>
                                      </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-[var(--cl-line)] shadow-sm">
                                      <h4 className="text-xs font-bold text-[var(--cl-muted)] uppercase mb-2">
                                        مبالغ پرداختی
                                      </h4>
                                      <div className="space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                          <span>مبلغ اقلام:</span>
                                          <span>{money(order.totals?.subtotal ?? order.totalAmount ?? 0)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-[var(--cl-teal-d)] border-t border-[var(--cl-line)] pt-1.5">
                                          <span>مبلغ نهایی پرداخت‌شده:</span>
                                          <span>{money(order.totalAmount ?? order.total ?? 0)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Items List */}
                                  {order.items && order.items.length > 0 && (
                                    <div className="mb-4">
                                      <h4 className="text-sm font-bold text-[var(--cl-ink)] mb-2">اقلام سفارش:</h4>
                                      <ul className="divide-y divide-[var(--cl-line)] border border-[var(--cl-line)] rounded-xl overflow-hidden shadow-sm">
                                        {order.items.map((item, idx) => (
                                          <li key={idx} className="p-3 bg-white flex justify-between items-center text-sm">
                                            <div>
                                              <span className="font-semibold text-[var(--cl-ink)]">{item.title || item.name}</span>
                                              <span className="text-xs text-[var(--cl-muted)] ms-2">
                                                ({nf(item.quantity || 1)} عدد)
                                              </span>
                                            </div>
                                            <span className="font-bold text-sm text-[var(--cl-ink)]">{money(item.price)}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Action Buttons */}
                                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--cl-line)]">
                                    {order.status === "paid" && (
                                      <button
                                        disabled={busyAction}
                                        onClick={() => void orderAction(order, "fulfill")}
                                        className="cl-btn cl-btn-primary cl-btn-sm"
                                      >
                                        <Check size={16} />
                                        <span>تأیید و ثبت ارسال سفارش</span>
                                      </button>
                                    )}

                                    {order.status === "pending" &&
                                      order.fulfillmentStatus === "unfulfilled" && (
                                        <button
                                          disabled={busyAction}
                                          onClick={() => {
                                            if (window.confirm("آیا از لغو این سفارش اطمینان دارید؟"))
                                              void orderAction(order, "cancel", {
                                                reason: "لغو توسط مدیر سایت",
                                              });
                                          }}
                                          className="cl-btn cl-btn-danger cl-btn-sm"
                                        >
                                          <X size={16} />
                                          <span>لغو سفارش</span>
                                        </button>
                                      )}
                                  </div>

                                  {/* Refund Section */}
                                  {["paid", "shipped", "delivered"].includes(order.status) && (
                                    <form
                                      onSubmit={(event) => {
                                        event.preventDefault();
                                        if (window.confirm("آیا بازگشت وجه در درگاه پرداخت بانکی انجام شده است؟"))
                                          void orderAction(order, "refund", {
                                            refundRef,
                                            reason: refundReason,
                                          });
                                      }}
                                      className="mt-4 p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 flex flex-wrap items-end gap-3"
                                    >
                                      <div className="w-full text-xs font-bold text-rose-800">
                                        ثبت مرجوعی وجه (پس از استرداد وجه در درگاه بانکی):
                                      </div>
                                      <div className="cl-field flex-1 min-w-[200px]">
                                        <label className="text-xs font-semibold text-[var(--cl-ink)]">
                                          شناسه پیگیری بازگشت وجه
                                        </label>
                                        <input
                                          required
                                          value={refundRef}
                                          placeholder="کد پیگیری درگاه بانکی"
                                          onChange={(event) => setRefundRef(event.target.value)}
                                          className="text-xs"
                                        />
                                      </div>
                                      <div className="cl-field flex-1 min-w-[200px]">
                                        <label className="text-xs font-semibold text-[var(--cl-ink)]">
                                          علت بازگشت وجه
                                        </label>
                                        <input
                                          required
                                          value={refundReason}
                                          placeholder="درخواست مشتری / لغو بسته"
                                          onChange={(event) => setRefundReason(event.target.value)}
                                          className="text-xs"
                                        />
                                      </div>
                                      <button
                                        type="submit"
                                        disabled={busyAction}
                                        className="cl-btn cl-btn-danger cl-btn-sm h-[44px]"
                                      >
                                        ثبت مرجوعی وجه
                                      </button>
                                    </form>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="cl-state">
                <ShoppingBag size={36} className="text-[var(--cl-muted)]" />
                <div className="cl-state-title">سفارشی برای نمایش یافت نشد</div>
                <p className="cl-state-text">تاکنون سفارشی در سیستم فروشگاه ثبت نشده است.</p>
              </div>
            )}
          </section>
        )}

        {/* SECTION: BOOKINGS */}
        {section === "bookings" && (
          <section aria-labelledby="section-bookings-title">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="section-bookings-title" className="text-xl font-bold text-[var(--cl-ink)]">
                  نوبت‌ها و رویدادهای تقویم درمانی
                </h2>
                <p className="text-xs text-[var(--cl-muted)] mt-0.5">
                  مدیریت وقت‌های رزرو بیماران، تأیید ویزیت و جلسات مشاوره آنلاین
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const result = await getCalendar();
                  setBookings(result?.bookings || []);
                  flashMessage("تقویم نوبت‌ها به‌روزرسانی شد", "info");
                }}
                className="cl-btn cl-btn-outline cl-btn-sm inline-flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>بروزرسانی</span>
              </button>
            </div>

            {bookings.length ? (
              <div className="cl-admin-table-wrap">
                <table className="cl-admin-table">
                  <thead>
                    <tr>
                      <th className="text-start">نام بیمار / مشتری</th>
                      <th className="text-center">شماره تماس</th>
                      <th className="text-start">خدمت درمانی</th>
                      <th className="text-center">زمان نوبت</th>
                      <th className="text-center">وضعیت نوبت</th>
                      <th className="text-center w-20">اقدام</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const isConfirmed = booking.status === "confirmed";
                      const isPending = booking.status === "pending";
                      const isCompleted = booking.status === "completed";
                      const isCancelled = booking.status === "cancelled";
                      const isNoShow = booking.status === "no-show" || booking.status === "no_show";
                      const isSelected =
                        (selectedBooking?._id || selectedBooking?.id) ===
                        (booking._id || booking.id);

                      return (
                        <Fragment key={booking._id || booking.id}>
                          <tr className={`transition-colors duration-150 ${isSelected ? "bg-[var(--cl-teal-soft)]/50" : ""}`}>
                            <td className="text-start font-semibold text-sm">
                              {booking.customerName || booking.name || "مشتری بدون نام"}
                            </td>
                            <td className="text-center font-bold text-sm text-[var(--cl-ink)]">
                              <span className="inline-block" dir="ltr">
                                {formatPersianMobile(booking.customerPhone || booking.phone || "—")}
                              </span>
                            </td>
                            <td className="text-start text-sm font-medium text-[var(--cl-teal-d)]">
                              {booking.serviceTitle || booking.service || "خدمت"}
                            </td>
                            <td className="text-center text-xs text-[var(--cl-muted)]">
                              {booking.startsAt ? (
                                <div className="flex flex-col gap-0.5 items-center">
                                  <span>{fmtFullDate(booking.startsAt)}</span>
                                  <span className="font-semibold text-[var(--cl-ink)]">
                                    ساعت {fmtTime(booking.startsAt)}
                                  </span>
                                </div>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="text-center">
                              <span
                                className={`cl-admin-badge ${
                                  isConfirmed || isCompleted
                                    ? "cl-admin-badge-success"
                                    : isPending
                                    ? "cl-admin-badge-warning"
                                    : isCancelled || isNoShow
                                    ? "cl-admin-badge-error"
                                    : "cl-admin-badge-neutral"
                                }`}
                              >
                                {STATUS_FA[booking.status] || booking.status}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="flex justify-center items-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedBooking(isSelected ? null : booking)}
                                  className={`cl-btn cl-btn-sm p-2 rounded-xl transition-all duration-200 ${
                                    isSelected
                                      ? "bg-[var(--cl-teal)] text-white shadow-sm"
                                      : "cl-btn-outline hover:bg-[var(--cl-teal-soft)] text-[var(--cl-teal-d)]"
                                  }`}
                                  aria-expanded={isSelected}
                                  aria-label={isSelected ? "بستن کشوی جزئیات نوبت" : "مشاهده کشوی جزئیات نوبت"}
                                  title={isSelected ? "بستن جزئیات" : "مشاهده و مدیریت نوبت"}
                                >
                                  <ChevronDown
                                    size={18}
                                    className={`transition-transform duration-300 ease-out ${
                                      isSelected ? "rotate-180" : "rotate-0"
                                    }`}
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Dropdown Drawer Below Item */}
                          {isSelected && (
                            <tr className="cl-admin-drawer-row">
                              <td colSpan={6} className="p-0 border-b-2 border-[var(--color-brand-200)] bg-[var(--cl-bg)]">
                                <div className="cl-admin-drawer-content p-4 sm:p-6 bg-gradient-to-b from-[var(--cl-teal-soft)]/20 to-[var(--color-surface)]">
                                  <div className="flex items-center justify-between border-b border-[var(--cl-line)] pb-3 mb-4">
                                    <div>
                                      <h3 className="text-base sm:text-lg font-bold text-[var(--cl-ink)]">
                                        جزئیات نوبت {booking.customerName || booking.id}
                                      </h3>
                                      <p className="text-xs text-[var(--cl-muted)] mt-0.5">
                                        خدمت: <strong>{booking.serviceTitle || booking.service}</strong> ·
                                        وضعیت فعلی:{" "}
                                        <strong>{STATUS_FA[booking.status] || booking.status}</strong>
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => setSelectedBooking(null)}
                                      className="cl-btn cl-btn-ghost cl-btn-sm text-xs"
                                      aria-label="بستن پنجره نوبت"
                                    >
                                      <X size={16} />
                                      <span>بستن</span>
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm">
                                    <div className="bg-white p-3.5 rounded-xl border border-[var(--cl-line)] shadow-sm">
                                      <div className="text-xs text-[var(--cl-muted)] mb-1">نام بیمار:</div>
                                      <div className="font-bold text-[var(--cl-ink)]">
                                        {booking.customerName || "—"}
                                      </div>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[var(--cl-line)] shadow-sm">
                                      <div className="text-xs text-[var(--cl-muted)] mb-1">شماره تماس:</div>
                                      <div className="font-bold text-sm text-[var(--cl-ink)]" dir="ltr">
                                        {formatPersianMobile(booking.customerPhone || "—")}
                                      </div>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[var(--cl-line)] shadow-sm">
                                      <div className="text-xs text-[var(--cl-muted)] mb-1">زمان شروع و پایان:</div>
                                      <div className="font-medium text-[var(--cl-ink)]">
                                        {booking.startsAt ? (
                                          <>
                                            {fmtTime(booking.startsAt)} تا{" "}
                                            {fmtTime(booking.endsAt)}
                                          </>
                                        ) : (
                                          "—"
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {booking.meetingUrl && (
                                    <div className="mb-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3 shadow-sm">
                                      <div className="flex items-center gap-2 text-sm text-blue-900 font-medium">
                                        <Video size={18} className="text-blue-600 shrink-0" />
                                        <span>لینک جلسه مشاوره آنلاین (Google Meet):</span>
                                      </div>
                                      <a
                                        href={booking.meetingUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="cl-btn cl-btn-primary cl-btn-sm bg-blue-600 hover:bg-blue-700 text-xs"
                                      >
                                        ورود به جلسه تصویری
                                      </a>
                                    </div>
                                  )}

                                  {/* Booking Status Action Buttons */}
                                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--cl-line)]">
                                    {booking.status === "pending" && (
                                      <button
                                        disabled={busyAction}
                                        onClick={() => void bookingAction(booking, "confirm")}
                                        className="cl-btn cl-btn-primary cl-btn-sm"
                                      >
                                        <Check size={16} />
                                        <span>تأیید نوبت بیمار</span>
                                      </button>
                                    )}

                                    {booking.status === "confirmed" && (
                                      <>
                                        <button
                                          disabled={busyAction}
                                          onClick={() => void bookingAction(booking, "complete")}
                                          className="cl-btn cl-btn-primary cl-btn-sm"
                                        >
                                          <Check size={16} />
                                          <span>تکمیل نوبت (ویزیت انجام شد)</span>
                                        </button>

                                        <button
                                          disabled={busyAction}
                                          onClick={() => void bookingAction(booking, "no-show")}
                                          className="cl-btn cl-btn-outline cl-btn-sm text-[var(--color-state-warning-ink)]"
                                        >
                                          <Clock size={16} />
                                          <span>عدم حضور بیمار (No-Show)</span>
                                        </button>
                                      </>
                                    )}

                                    {["pending", "confirmed"].includes(booking.status) && (
                                      <button
                                        disabled={busyAction}
                                        onClick={() => {
                                          if (window.confirm("آیا از لغو این وقت نوبت اطمینان دارید؟"))
                                            void bookingAction(booking, "cancel", {
                                              reason: "لغو توسط مدیر سایت",
                                            });
                                        }}
                                        className="cl-btn cl-btn-danger cl-btn-sm"
                                      >
                                        <X size={16} />
                                        <span>لغو نوبت</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="cl-state">
                <Calendar size={36} className="text-[var(--cl-muted)]" />
                <div className="cl-state-title">نوبتی برای نمایش یافت نشد</div>
                <p className="cl-state-text">هیچ نوبتی در تقویم رزروها ثبت نشده است.</p>
              </div>
            )}
          </section>
        )}

        {/* SECTION: PRODUCTS */}
        {section === "products" && (
          <section aria-labelledby="section-products-title">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="section-products-title" className="text-xl font-bold text-[var(--cl-ink)]">
                  محصولات و بسته‌های درمانی کلینیک
                </h2>
                <p className="text-xs text-[var(--cl-muted)] mt-0.5">
                  مدیریت عناوین، موجودی و قیمت‌گذاری بسته‌های خدمات و محصولات زیبایی
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setProductTitle("");
                  setProductPrice("");
                  setProductStock("");
                }}
                className="cl-btn cl-btn-primary cl-btn-sm inline-flex items-center gap-1.5"
              >
                <Plus size={16} />
                <span>افزودن محصول جدید</span>
              </button>
            </div>

            {/* Products Table */}
            {products.length ? (
              <div className="cl-admin-table-wrap mb-6">
                <table className="cl-admin-table">
                  <thead>
                    <tr>
                      <th className="text-start">عنوان محصول / بسته</th>
                      <th className="text-center">قیمت فروش</th>
                      <th className="text-center">موجودی</th>
                      <th className="text-center w-28">اقدام</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id || product.id}>
                        <td className="text-start font-semibold text-sm text-[var(--cl-ink)]">
                          {product.title || product.name}
                        </td>
                        <td className="text-center font-bold text-sm text-[var(--cl-teal-d)]">
                          {money(product.price)}
                        </td>
                        <td className="text-center">
                          <span className="cl-admin-badge cl-admin-badge-neutral font-mono">
                            {nf(product.stock ?? 0)} عدد
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="flex justify-center items-center">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(product);
                                setProductTitle(product.title || "");
                                setProductPrice(String(product.price ?? ""));
                                setProductStock(String(product.stock ?? 0));
                              }}
                              className="cl-btn cl-btn-outline cl-btn-sm text-xs inline-flex items-center gap-1"
                            >
                              <Edit2 size={13} />
                              <span>ویرایش</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="cl-state mb-6">
                <Package size={36} className="text-[var(--cl-muted)]" />
                <div className="cl-state-title">محصولی در کاتالوگ ثبت نشده است</div>
                <p className="cl-state-text">با استفاده از فرم زیر می‌توانید محصول یا بسته جدید ایجاد کنید.</p>
              </div>
            )}

            {/* Product Add / Edit Form */}
            <div className="cl-card p-5 border-[var(--cl-line)]">
              <div className="flex items-center gap-2 mb-4 border-b border-[var(--cl-line)] pb-3">
                <Edit2 size={18} className="text-[var(--cl-teal)]" />
                <h3 className="font-bold text-base text-[var(--cl-ink)]">
                  {editingProduct
                    ? `ویرایش محصول: ${editingProduct.title || editingProduct.name}`
                    : "افزودن محصول جدید به کاتالوگ"}
                </h3>
              </div>

              <form onSubmit={saveProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="cl-field">
                    <label className="text-xs font-semibold text-[var(--cl-ink)]">
                      عنوان محصول یا بسته
                    </label>
                    <input
                      required
                      maxLength={300}
                      placeholder="مثال: بسته ۶ جلسه‌ای لیزر فول‌بادی"
                      value={productTitle}
                      onChange={(event) => setProductTitle(event.target.value)}
                    />
                  </div>

                  <div className="cl-field">
                    <label className="text-xs font-semibold text-[var(--cl-ink)]">
                      قیمت (ریال)
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="به ریال وارد کنید"
                      value={productPrice}
                      onChange={(event) => setProductPrice(event.target.value)}
                    />
                    {productPrice && Number(productPrice) > 0 && (
                      <small className="text-[11px] text-[var(--cl-teal)] font-medium">
                        معادل: {money(productPrice)}
                      </small>
                    )}
                  </div>

                  <div className="cl-field">
                    <label className="text-xs font-semibold text-[var(--cl-ink)]">
                      تعداد موجودی
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="تعداد موجود در انبار یا سهمیه"
                      value={productStock}
                      onChange={(event) => setProductStock(event.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={busyAction}
                    className="cl-btn cl-btn-primary cl-btn-sm"
                  >
                    <Check size={16} />
                    <span>{editingProduct ? "ذخیره تغییرات محصول" : "افزودن محصول"}</span>
                  </button>

                  {editingProduct && (
                    <button
                      type="button"
                      className="cl-btn cl-btn-outline cl-btn-sm"
                      onClick={() => {
                        setEditingProduct(null);
                        setProductTitle("");
                        setProductPrice("");
                        setProductStock("");
                      }}
                    >
                      انصراف
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>
        )}

        {/* SECTION: CUSTOMERS */}
        {section === "customers" && (
          <section aria-labelledby="section-customers-title">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="section-customers-title" className="text-xl font-bold text-[var(--cl-ink)]">
                  مشتریان و مراجعه‌کنندگان کلینیک
                </h2>
                <p className="text-xs text-[var(--cl-muted)] mt-0.5">
                  فهرست بیماران و خریدارانی که در سامانه حساب کاربری یا نوبت دارند
                </p>
              </div>
            </div>

            {customers.length ? (
              <div className="cl-admin-table-wrap">
                <table className="cl-admin-table">
                  <thead>
                    <tr>
                      <th className="text-start">نام کاربر</th>
                      <th className="text-start">شماره تماس</th>
                      <th className="text-start">ایمیل</th>
                      <th className="text-start">شناسه سیستم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id || customer.id}>
                        <td className="text-start font-semibold text-sm text-[var(--cl-ink)]">
                          {customer.name || customer.displayName || "مشتری ناشناس"}
                        </td>
                        <td className="text-start font-bold text-sm text-[var(--cl-ink)]">
                          <span className="inline-block" dir="ltr">
                            {formatPersianMobile(customer.phone || customer.mobile || "—")}
                          </span>
                        </td>
                        <td className="text-start text-xs text-[var(--cl-muted)] font-mono" dir="ltr">
                          {customer.email || "—"}
                        </td>
                        <td className="text-start text-xs text-[var(--cl-muted)] font-mono" dir="ltr">
                          {customer._id || customer.id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="cl-state">
                <Users size={36} className="text-[var(--cl-muted)]" />
                <div className="cl-state-title">مشتری یا مراجعه‌کننده‌ای یافت نشد</div>
                <p className="cl-state-text">تاکنون مراجعه‌کننده‌ای در سیستم ثبت نشده است.</p>
              </div>
            )}
          </section>
        )}

        {/* SECTION: MEMBERS & TEAM */}
        {section === "members" && (
          <section aria-labelledby="section-members-title">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="section-members-title" className="text-xl font-bold text-[var(--cl-ink)]">
                  اعضای کادر درمانی و تیم مدیریت
                </h2>
                <p className="text-xs text-[var(--cl-muted)] mt-0.5">
                  مشاهده نقش‌ها، دسترسی‌ها و ارسال دعوت‌نامه به همکاران جدید
                </p>
              </div>
            </div>

            {/* Members List */}
            <div className="cl-admin-table-wrap mb-6">
              <table className="cl-admin-table">
                <thead>
                  <tr>
                    <th className="text-start">عضو تیم / شماره همراه</th>
                    <th className="text-center">نقش‌های سازمانی</th>
                    <th className="text-center">وضعیت عضویت</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="text-start font-bold text-sm text-[var(--cl-ink)]">
                        <span className="inline-block" dir="ltr">
                          {member.invitedPhone
                            ? formatPersianMobile(member.invitedPhone)
                            : member.userId}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="cl-admin-badge cl-admin-badge-info">
                          {member.roleNames?.join("، ") || "عضو کلینیک"}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`cl-admin-badge ${
                            member.status === "active"
                              ? "cl-admin-badge-success"
                              : "cl-admin-badge-warning"
                          }`}
                        >
                          {member.status === "active"
                            ? "فعال"
                            : member.status === "invited"
                            ? "دعوت‌شده"
                            : member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invite New Member */}
            {can("team:manage") && roles.length > 0 && (
              <div className="cl-card p-5 border-[var(--cl-line)]">
                <div className="flex items-center gap-2 mb-4 border-b border-[var(--cl-line)] pb-3">
                  <ShieldCheck size={18} className="text-[var(--cl-teal)]" />
                  <h3 className="font-bold text-base text-[var(--cl-ink)]">
                    دعوت همکار یا متخصص جدید به پنل کلینیک
                  </h3>
                </div>

                <form onSubmit={invite} className="flex flex-wrap items-end gap-3">
                  <div className="cl-field flex-1 min-w-[220px]">
                    <label className="text-xs font-semibold text-[var(--cl-ink)]">
                      شماره همراه متخصص
                    </label>
                    <input
                      required
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      value={phone}
                      onChange={(event) => setPhone(formatIranianMobile(event.target.value))}
                      inputMode="tel"
                      dir="ltr"
                      className="font-mono"
                    />
                  </div>

                  <div className="cl-field flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold text-[var(--cl-ink)]">
                      نقش و سطح دسترسی
                    </label>
                    <select
                      required
                      value={roleId}
                      onChange={(event) => setRoleId(event.target.value)}
                      className="w-full min-h-[48px] px-3 border border-[var(--color-neutral-300)] rounded-xl"
                    >
                      <option value="">انتخاب نقش سازمانی…</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={busyAction}
                    className="cl-btn cl-btn-primary cl-btn-sm h-[48px] px-5"
                  >
                    <Plus size={16} />
                    <span>ارسال دعوت‌نامه</span>
                  </button>
                </form>

                {inviteUrl && (
                  <div className="mt-4 p-3.5 rounded-xl bg-[var(--cl-teal-soft)] border border-[var(--color-brand-200)] flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-[var(--cl-teal-d)] font-medium leading-relaxed">
                      <span>لینک اختصاصی دعوت عضو جدید: </span>
                      <a
                        href={inviteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono underline break-all text-xs ms-1"
                        dir="ltr"
                      >
                        {inviteUrl}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(inviteUrl);
                        setCopiedInvite(true);
                        setTimeout(() => setCopiedInvite(false), 2500);
                      }}
                      className="cl-btn cl-btn-outline cl-btn-sm text-xs inline-flex items-center gap-1.5"
                    >
                      {copiedInvite ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          <span className="text-emerald-700 font-bold">کپی شد ✓</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>کپی لینک</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* SECTION: SETTINGS */}
        {section === "settings" && (
          <section aria-labelledby="section-settings-title">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="section-settings-title" className="text-xl font-bold text-[var(--cl-ink)]">
                  تنظیمات فروشگاه و درگاه کلینیک
                </h2>
                <p className="text-xs text-[var(--cl-muted)] mt-0.5">
                  پیکربندی پایه واحد پولی و ارتباط با سامانه یکپارچه
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="cl-card p-5 border-[var(--cl-line)]">
                <div className="text-xs font-semibold text-[var(--cl-muted)] mb-1">واحد پول اصلی</div>
                <div className="text-lg font-bold text-[var(--cl-teal-d)]">
                  {settings[0]?.currency === "IRR" || !settings.length ? "ریال (IRR)" : settings[0]?.currency}
                </div>
                <p className="text-xs text-[var(--cl-muted)] mt-2">
                  در ویترین عمومی به صورت تومان برای راحتی مراجعه‌کنندگان نمایش داده می‌شود.
                </p>
              </div>

              <div className="cl-card p-5 border-[var(--cl-line)]">
                <div className="text-xs font-semibold text-[var(--cl-muted)] mb-1">شناسه اپلیکیشن (App ID)</div>
                <div className="font-mono text-sm font-bold text-[var(--cl-ink)] break-all">
                  {APP_ID}
                </div>
                <p className="text-xs text-[var(--cl-muted)] mt-2">
                  اتصال امن به سرور ابری کلینیک
                </p>
              </div>

              <div className="cl-card p-5 border-[var(--cl-line)]">
                <div className="text-xs font-semibold text-[var(--cl-muted)] mb-1">وضعیت احراز هویت</div>
                <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
                  <CheckCircle2 size={16} />
                  <span>نشست مدیر کلینیک فعال است</span>
                </div>
                <p className="text-xs text-[var(--cl-muted)] mt-2">
                  نشست امن با توکن معتبر ۲۴ ساعته
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Admin Panel Footer */}
      <AdminFooter />
    </div>
  );
}
