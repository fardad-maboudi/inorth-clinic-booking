import '../../demo/install.js';
import { listPluginRecords } from "@/api/joorchin";
import { listResources, listServices } from "@/api/plugins/bookings";

const DEFAULT_SETTINGS = {
  cancellationWindowHours: 24,
  rescheduleWindowHours: 24,
  reminderOffsetsMinutes: [-1440, -120],
  horizonDays: 30,
  cancellationPolicyText: "لغو نوبت تا ۲۴ ساعت قبل از موعد بدون جریمه امکان‌پذیر است.",
};

/** Public booking policy (cancellation / reschedule windows, reminder offsets). Read from the public settings row. */
export async function loadSettings() {
  const rows = await listPluginRecords("bookings", "booking_setting", { limit: 1 }).catch(() => []);
  return { ...DEFAULT_SETTINGS, ...(rows[0] ?? {}) };
}

/** Services and staff together, with staff narrowed to those who perform a service. */
export async function loadCatalog() {
  const [services, resources] = await Promise.all([listServices(), listResources()]);
  return {
    services: services.filter((service) => service.active !== false),
    staff: resources.filter((resource) => resource.active !== false),
  };
}

export function staffFor(service, staff) {
  const ids = new Set((service?.resourceIds ?? []).map(String));
  return ids.size ? staff.filter((member) => ids.has(String(member._id))) : staff;
}

export const byId = (rows) => new Map(rows.map((row) => [String(row._id), row]));
