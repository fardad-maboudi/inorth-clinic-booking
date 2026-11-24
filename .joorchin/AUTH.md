<!-- Platform-maintained projection of docs/AUTH.md; contract 0d0104732840a07da735a0729cdb0cae7ea0ef66ea4e9d2bd683cb29535e2d12. Do not edit this copy. -->
# Generated-site authentication

This guide describes website login for one generated site. Install the auth plugin before importing its client. Use SDK helpers; never construct login endpoints in page code.

| Audience | Import and sign-in helpers | Token audience and operations |
| --- | --- | --- |
| Customer | `@/api/plugins/auth`: `requestOtp`, `verifyOtp`, `loginWithPassword` | `site_user`; customer account and customer-owned actions through visitor APIs |
| Shop owner, admin, invited staff | `@/api/plugins/auth`: `requestAdminOtp`, `verifyAdminOtp`, `loginAdminWithPassword` | `site_admin`; capability-authorized operations through `@/api/backoffice/*` |
| Anonymous visitor | No sign-in | Public catalog/content only |
| Studio preview | Platform preview session; never create or upgrade it in page code | `preview`; does not prove staff membership |
| Joorchin platform operator | Joorchin Admin panel only | `platform_staff`; never use `/auth/admin/login` in generated-site pages |
| Site owner using Studio | Studio sign-in only | `studio`; does not replace shop-staff sign-in on the generated site |

“Admin” in `requestAdminOtp` means staff of this site. A customer token, a preview token, `role: 'admin'`, or a hidden dashboard link cannot grant staff capabilities. Server membership/capability checks remain authoritative. Staff must have an active site membership; invited staff use the same site-staff helpers. Do not register a customer as a workaround for denied staff sign-in.

```js
// Customer OTP login; the SDK saves the session.
import { requestOtp, verifyOtp, loginWithPassword } from '@/api/plugins/auth';
await requestOtp(phoneNumber);
const customerSession = await verifyOtp(phoneNumber, otp);
// Alternative when a password is configured:
await loginWithPassword(phoneNumber, password);
```

```js
// Shop-staff OTP login; never use customer helpers for the dashboard.
import { requestAdminOtp, verifyAdminOtp, loginAdminWithPassword } from '@/api/plugins/auth';
await requestAdminOtp(phoneNumber);
const staffSession = await verifyAdminOtp(phoneNumber, otp);
// Alternative when a password is configured:
await loginAdminWithPassword(phoneNumber, password);
```

OTP verification/password helpers return the parsed API session (`token`, `refreshToken`, `user`) and store it through the SDK. Use `me()` to resolve the live identity and capabilities; handle its actual response contract. Keep customer and staff UI journeys explicit. A successful customer login does not authorize dashboard operations.

Session helpers from the same module: `me`, `logout`, `refreshSession`, `forgotPassword`, `resetPassword`. Let the SDK own token storage, refresh and logout cleanup. `forgotPassword(phoneNumber)` does not disclose whether an account exists; after `resetPassword(phoneNumber, otp, newPassword)` the user signs in again. A first login with no configured password uses OTP. Preserve an intended return route within the same site; do not redirect to an external URL supplied by a query parameter. `AUTH_LOGIN_PATH` identifies the plugin's customer login page; preserve existing platform staff routes when present.

The site-admin login page uses `forgotAdminPassword(phoneNumber)` and
`resetAdminPassword(phoneNumber, otp, newPassword)` instead of the customer
recovery helpers. Both stages check active site membership or invitation;
customer-only accounts cannot use admin recovery. Customer-hosted apps use
`client.auth.forgotStaffPassword` and `client.auth.resetStaffPassword` for the
same admin-only recovery routes. A successful reset clears the old session;
the administrator signs in again through the staff login.

Show loading, invalid-code, expired-session and denied-permission states. A 401 requires a valid session; a 403 means the session lacks permission. Never fall back to customer login, preview identity, or a platform token to make a denied staff call succeed. Membership removal or expiry can remove staff authority even while a token still exists.

SDK transport contract (for maintainers, not page-level fetch recipes): customer OTP supports `/api/v1/auth/initiate` and `/verify-otp` with `x-app-id`, and app-scoped aliases `/api/v1/apps/:appId/auth/initiate` and `/verify-otp`. Site-staff OTP/password use `/api/v1/apps/:appId/auth/admin/initiate`, `/admin/verify-otp`, and `/admin/login/password`. Customer password uses `/api/v1/apps/:appId/auth/login/password`. `/api/v1/auth/admin/login` is platform-operator email/password login and is prohibited in generated-site pages.

For an externally hosted React/Vite app, use the public `@joorchin/client-sdk` with the target appId instead of generated-site imports. Customer helpers are `client.auth.requestOtp`, `loginViaPhoneOtp`, and `loginWithPassword`; staff helpers are `requestStaffOtp`, `loginStaffViaPhoneOtp`, and `loginStaffWithPassword`. Public login methods return `{ access_token, user }`. Visitor operations use `client.site`; staff operations use `client.backoffice`. Do not mix these signatures with delivered generated-site helpers.
