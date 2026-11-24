/** The caller's own membership: `{ roles, capabilities, ... }`. Any signed-in staff. */
export function getMyMembership(): Promise<any>;
/** Every member of this site. Requires `team:read`. */
export function listMembers(): Promise<import("@/api/joorchin.js").RowList<any>>;
/** Roles defined for this site. Requires `team:read`. */
export function listRoles(): Promise<import("@/api/joorchin.js").RowList<any>>;
/**
 * Invite a person to run this site. Requires `team:manage`; the server refuses
 * roles carrying capabilities the inviter does not hold.
 * Resolves `{ member, inviteUrl }`.
 */
export function inviteMember({ phone, roleIds }: {
    phone: any;
    roleIds: any;
}): Promise<any>;
