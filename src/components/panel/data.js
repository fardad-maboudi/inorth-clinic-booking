/**
 * Panel data layer. Back-office SDK only: plugin collections go through
 * `pluginRecords('bookings', ...)`, operations through `@/api/backoffice/bookings`.
 * Every query key starts with 'panel' so one invalidation refreshes the whole panel.
 */
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pluginAction, pluginRecords } from '@/api/backoffice/client';
import { listClientCredits } from '@/api/backoffice/bookings';
import { getMyMembership } from '@/api/backoffice/team';
import { errMsg, idOf } from './format';

export const rec = (entity) => pluginRecords('bookings', entity);

export function usePanelQuery(key, load, options = {}) {
  return useQuery({
    queryKey: ['panel', ...key],
    queryFn: load,
    retry: false,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/** Mutation that refreshes every panel query and reports the outcome as a toast. */
export function usePanelMutation(run, { success, onSuccess } = {}) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: async (result, variables) => {
      await client.invalidateQueries({ queryKey: ['panel'] });
      if (success) toast.success(typeof success === 'function' ? success(result, variables) : success);
      onSuccess?.(result, variables);
    },
    onError: (error) => toast.error(errMsg(error)),
  });
}

export const useMembership = () => usePanelQuery(['membership'], getMyMembership, { staleTime: 60_000 });

const list = (entity, query) => async () => Array.from(await rec(entity).list(query));

export const useServices = (options) => usePanelQuery(['services'], list('booking_service', { limit: 200, sort: 'sortOrder' }), options);
export const useResources = (options) => usePanelQuery(['resources'], list('booking_resource', { limit: 200, sort: 'sortOrder' }), options);
export const useSchedules = (options) => usePanelQuery(['schedules'], list('booking_schedule', { limit: 500 }), options);
export const useTimeoff = (options) => usePanelQuery(['timeoff'], list('booking_timeoff', { limit: 200, sort: '-startsAt' }), options);
export const useSettings = (options) => usePanelQuery(['settings'], list('booking_setting', { limit: 1 }), options);
export const useClients = (limit = 300) => usePanelQuery(['clients', limit], list('booking_client', { limit, sort: '-created_at' }));
export const useBookings = (limit = 500) =>
  usePanelQuery(['bookings', limit], async () => {
    const rows = await rec('booking').list({ limit, sort: '-startsAt' });
    return { rows: Array.from(rows), total: rows.total ?? rows.length };
  });

/** id → row lookup, rebuilt only when the rows change. */
export function useById(rows) {
  return useMemo(() => new Map((rows || []).map((row) => [idOf(row), row])), [rows]);
}

/** Services, staff and clients as id maps (+ plain lists) for resolving names on booking rows. */
export function useLookups() {
  const services = useServices();
  const resources = useResources();
  const clients = useClients();
  const lookups = {
    services: useById(services.data),
    resources: useById(resources.data),
    clients: useById(clients.data),
  };
  return {
    ...lookups,
    serviceList: services.data || [],
    resourceList: resources.data || [],
    clientList: clients.data || [],
    isLoading: services.isLoading || resources.isLoading || clients.isLoading,
    error: services.error || resources.error || clients.error,
  };
}

/** Credits of one client (the bookings plugin exposes them per client only). */
export function useClientCredits(clientId, options) {
  return usePanelQuery(
    ['credits', clientId],
    async () => {
      const result = await listClientCredits(clientId, { limit: 100, sort: '-created_at' });
      const body = result?.data && !Array.isArray(result.data) ? result.data : result;
      return Array.from(body?.items || (Array.isArray(body) ? body : []));
    },
    options,
  );
}

/**
 * Grant session credit. The SDK helper `grantCredit` sends `serviceId`/`validityDays`, which the server
 * does not read, so the contract body (`serviceIds`, `expiresAt`, `grantReason`) is posted directly.
 */
export const grantCreditRequest = ({ clientId, totalSessions, serviceIds, expiresAt, grantReason }) =>
  pluginAction('bookings', 'credits', {
    method: 'POST',
    body: {
      clientId,
      totalSessions,
      ...(serviceIds?.length ? { serviceIds } : {}),
      ...(expiresAt ? { expiresAt } : {}),
      ...(grantReason ? { grantReason } : {}),
    },
  });
