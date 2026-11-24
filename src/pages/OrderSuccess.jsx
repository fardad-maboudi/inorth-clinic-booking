import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useOrderPaymentResult } from '@/api/plugins/ecommerce';
import { normalizeGatewayReturn } from '@/api/joorchin';
import { useSession, useTitle } from '@/components/site/hooks';
import OrderSuccessBanner from '@/components/site/order/OrderSuccessBanner';
import OrderPackageDetails from '@/components/site/order/OrderPackageDetails';
import OrderBookingCta from '@/components/site/order/OrderBookingCta';
import {
  OrderFailureView,
  OrderInvalidView,
  OrderLoadingSkeleton,
  OrderPendingView,
  OrderUnauthorizedView,
} from '@/components/site/order/OrderStatusViews';

/**
 * Dedicated Payment Result / Order Confirmation Page Orchestrator.
 * - Never trusts query params alone; confirms & queries real status from backend.
 * - Handles 5 states: loading skeleton, success, failure/cancelled, pending, invalid.
 * - Enforces customer ownership & gracefully handles unauthorized/expired sessions.
 * - Accessible: WCAG AA contrast, role="status"/role="alert", autofocus on heading.
 * - Native RTL typography with Persian numerals and Jalali timestamps.
 */
export default function OrderSuccessPage() {
  useTitle('نتیجه پرداخت و ثبت سفارش');
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useSession();
  const headingRef = useRef(null);

  const searchStr = location.search || '';
  const parsedReturn = useMemo(() => normalizeGatewayReturn(searchStr), [searchStr]);

  // Extract order identifier from gateway return or direct query params
  const orderId =
    parsedReturn.orderId ||
    searchParams.get('order') ||
    searchParams.get('orderId') ||
    searchParams.get('id') ||
    '';

  const hasGatewayEvidence = parsedReturn.hasGatewayParams;
  const isMissingParams = !orderId && !hasGatewayEvidence;

  // Real backend payment result verification (safe against double-submit)
  const paymentResult = useOrderPaymentResult({
    orderId: orderId || undefined,
    search: searchStr,
  });

  const { state: rawState, order, message, refresh, sandbox } = paymentResult;

  // Check if backend rejected order access due to unauthorized/expired session
  const isUnauthorized = Boolean(
    message &&
      (/unauthorized|forbidden|۴۰۱|۴۰۳|دسترسی ندارید|وارد شوید/i.test(message) ||
        message.toLowerCase().includes('unauthorized') ||
        message.toLowerCase().includes('forbidden'))
  );

  // Check if order does not exist (404)
  const isNotFound = Boolean(
    message && (/یافت نشد|پیدا نشد|not found/i.test(message) || message.toLowerCase().includes('not found'))
  );

  // Consolidated operational state
  const effectiveState = useMemo(() => {
    if (isMissingParams) return 'invalid';
    if (isUnauthorized) return 'unauthorized';
    if (isNotFound) return 'invalid';
    if (rawState === 'checking') return 'loading';
    if (rawState === 'paid') return 'success';
    if (rawState === 'failed' || rawState === 'cancelled') return 'failure';
    if (rawState === 'pending') return 'pending';
    return 'loading';
  }, [isMissingParams, isUnauthorized, isNotFound, rawState]);

  // Move focus to result heading when state settles (WCAG AA requirement)
  useEffect(() => {
    if (effectiveState !== 'loading' && headingRef.current) {
      headingRef.current.focus();
    }
  }, [effectiveState]);

  const trackingAuthority =
    parsedReturn.authority ||
    order?.payment?.authority ||
    order?.payment?.trackingNumber ||
    order?.trackingCode ||
    '';

  const orderNumber = order?.orderNumber || (orderId ? String(orderId).slice(-6) : '');
  const paidTimestamp = order?.paidAt || order?.createdAt || null;
  const isCancelled = rawState === 'cancelled';

  return (
    <div className="cl-app cl-order-page" dir="rtl">
      <main className="cl-main" id="main-content">
        <div className="cl-wrap cl-narrow cl-order-flow">

          {/* STATE 1: LOADING SKELETON */}
          {effectiveState === 'loading' && <OrderLoadingSkeleton />}

          {/* STATE 2: SUCCESS */}
          {effectiveState === 'success' && (
            <>
              <OrderSuccessBanner
                order={order}
                orderNumber={orderNumber}
                trackingAuthority={trackingAuthority}
                paidTimestamp={paidTimestamp}
                sandbox={sandbox}
                headingRef={headingRef}
              />
              <OrderPackageDetails order={order} user={user} />
              <OrderBookingCta />
            </>
          )}

          {/* STATE 3: FAILURE / CANCELLED */}
          {effectiveState === 'failure' && (
            <OrderFailureView
              isCancelled={isCancelled}
              message={message}
              trackingAuthority={trackingAuthority}
              headingRef={headingRef}
            />
          )}

          {/* STATE 4: PENDING / PROCESSING */}
          {effectiveState === 'pending' && (
            <OrderPendingView onRefresh={refresh} headingRef={headingRef} />
          )}

          {/* STATE 5: INVALID / NOT FOUND */}
          {effectiveState === 'invalid' && (
            <OrderInvalidView headingRef={headingRef} />
          )}

          {/* STATE 6: UNAUTHORIZED / SESSION EXPIRED */}
          {effectiveState === 'unauthorized' && (
            <OrderUnauthorizedView
              loginReturnUrl={location.pathname + location.search}
              headingRef={headingRef}
            />
          )}

        </div>
      </main>
    </div>
  );
}
