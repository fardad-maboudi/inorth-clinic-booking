/** Signed-in user id, read from the JWT payload. Empty when signed out. */
export function currentUserId(): string;
/**
 * @param {{room?: string, events?: string[], onEvent?: (event: string, data: unknown) => void, onPoll?: Function, minPollMs?: number, maxPollMs?: number}} [options]
 * @returns {{isConnected: () => boolean, close: () => void}}
 */
export function createLiveChannel({ room, events, onEvent, onPoll, minPollMs, maxPollMs, }?: {
    room?: string;
    events?: string[];
    onEvent?: (event: string, data: unknown) => void;
    onPoll?: Function;
    minPollMs?: number;
    maxPollMs?: number;
}): {
    isConnected: () => boolean;
    close: () => void;
};
/**
 * A query that refreshes itself when the server pushes one of `events`
 * (and polls slowly only while the socket is down). Use instead of your own
 * setInterval or WebSocket:
 *
 *   const { data } = useLiveQuery({
 *     queryKey: ['notifications'],
 *     queryFn: listNotifications,
 *     events: ['notification'],
 *   });
 *
 * `room` defaults to the signed-in user's room; signed-out visitors just get
 * the plain query.
 * @param {{queryKey: readonly unknown[], queryFn: Function, events?: string[], room?: string, enabled?: boolean, staleTime?: number}} options
 * @returns {{data: any, error: Error|null, isLoading: boolean, isPending: boolean, isError: boolean, isFetching: boolean, isSuccess: boolean, refetch: Function}}
 */
export function useLiveQuery({ queryKey, queryFn, events, room, enabled, staleTime }: {
    queryKey: readonly unknown[];
    queryFn: Function;
    events?: string[];
    room?: string;
    enabled?: boolean;
    staleTime?: number;
}): {
    data: any;
    error: Error | null;
    isLoading: boolean;
    isPending: boolean;
    isError: boolean;
    isFetching: boolean;
    isSuccess: boolean;
    refetch: Function;
};
