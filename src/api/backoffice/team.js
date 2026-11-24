/**
 * Site back-office SDK — team: the site's own members and roles.
 *
 * Staff only (`team:read`, `team:manage`). Not the Joorchin platform team and
 * not Studio collaborators — these are people invited to run THIS site.
 * Platform-owned: re-synced from the template.
 */
import { backofficeList, backofficeRequest } from "./client.js";

/** The caller's own membership: `{ roles, capabilities, ... }`. Any signed-in staff. */
export async function getMyMembership() {
  const result = await backofficeRequest("/members/me");
  return result?.data ?? result;
}

/** Every member of this site. Requires `team:read`. */
export function listMembers() {
  return backofficeList("/members");
}

/** Roles defined for this site. Requires `team:read`. */
export function listRoles() {
  return backofficeList("/roles");
}

/**
 * Invite a person to run this site. Requires `team:manage`; the server refuses
 * roles carrying capabilities the inviter does not hold.
 * Resolves `{ member, inviteUrl }`.
 */
export async function inviteMember({ phone, roleIds }) {
  const result = await backofficeRequest("/members/invite", {
    method: "POST",
    body: { phone, roleIds, subjectKind: "siteUser" },
  });
  return result?.data ?? result;
}
