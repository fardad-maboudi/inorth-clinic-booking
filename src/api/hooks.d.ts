/**
 * Rows of a plugin collection (product, category, post, …). Row fields are
 * typed for known plugin entities: `usePluginList('reviews', 'review')`.
 * @template {string} P @template {string} E
 * @param {P} pluginId @param {E} entity @param {ListParams} [params] @param {HookOptions} [options]
 * @returns {QueryState<RowsResult<PluginRowOf<P, E>>>}
 *   `data` is the row array (also `.items` / `.total`).
 * @example
 * const { data: reviews, isLoading, error } = usePluginList('reviews', 'review', { limit: 10 });
 * if (isLoading) return <Skeletons />;
 * if (error) return <ErrorState message={error.message} />;
 */
export function usePluginList<P extends string, E extends string>(pluginId: P, entity: E, params?: ListParams, options?: HookOptions): QueryState<RowsResult<PluginRowOf<P, E>>>;
/** One plugin record. Disabled until `id` is set.
 * @template {string} P @template {string} E
 * @param {P} pluginId @param {E} entity @param {string|undefined} id @param {HookOptions} [options]
 * @returns {QueryState<PluginRowOf<P, E>>}
 */
export function usePluginRecord<P extends string, E extends string>(pluginId: P, entity: E, id: string | undefined, options?: HookOptions): QueryState<PluginRowOf<P, E>>;
/**
 * Create/update/delete a plugin record; refreshes the plugin's cached reads.
 * `mutate({ action: 'create', data })`, `{ action: 'update', id, data }`,
 * `{ action: 'delete', id }`.
 * @template {string} P @template {string} E
 * @param {P} pluginId @param {E} entity
 * @returns {MutationState<PluginRowOf<P, E>>}
 * @example
 * const save = usePluginMutation('reviews', 'review');
 * save.mutate({ action: 'create', data: { rating: 5, comment: 'عالی' } });
 */
export function usePluginMutation<P extends string, E extends string>(pluginId: P, entity: E): MutationState<PluginRowOf<P, E>>;
/** Rows of an app entity collection (the site's own data models). Pass a row
 * type for typed fields: `useEntityList<{ title: string }>('todo')`.
 * @template {Record<string, unknown>} [T=DataRow]
 * @param {string} entity @param {ListParams} [params] @param {HookOptions} [options]
 * @returns {QueryState<RowsResult<T>>}
 * @example
 * const { data: todos } = useEntityList('todo', { sort: '-created_at', limit: 20 });
 */
export function useEntityList<T extends Record<string, unknown> = DataRow>(entity: string, params?: ListParams, options?: HookOptions): QueryState<RowsResult<T>>;
/** One app entity row. Disabled until `id` is set.
 * @template {Record<string, unknown>} [T=DataRow]
 * @param {string} entity @param {string|undefined} id @param {HookOptions} [options]
 * @returns {QueryState<T>}
 */
export function useEntity<T extends Record<string, unknown> = DataRow>(entity: string, id: string | undefined, options?: HookOptions): QueryState<T>;
/** Create/update/delete an entity row; refreshes the entity's cached reads.
 * @template {Record<string, unknown>} [T=DataRow]
 * @param {string} entity
 * @returns {MutationState<T>}
 * @example
 * const todos = useEntityMutation('todo');
 * todos.mutate({ action: 'update', id: todo._id, data: { done: true } });
 */
export function useEntityMutation<T extends Record<string, unknown> = DataRow>(entity: string): MutationState<T>;
/** @typedef {Record<string, unknown>} DataRow */
/** @typedef {{filter?: Record<string, unknown>, sort?: string, limit?: number, skip?: number}} ListParams */
/** @typedef {{enabled?: boolean}} HookOptions */
/** @template T @typedef {{data: T|undefined, error: Error|null, isLoading: boolean, isPending: boolean, isError: boolean, isFetching: boolean, isSuccess: boolean, refetch: Function}} QueryState */
/** @template T @typedef {T[] & {items: T[], total: number}} RowsResult */
/** @template {string} P @template {string} E @typedef {import('./joorchin.js').PluginRow<P, E>} PluginRowOf */
/** @template [T=Record<string, unknown>] @typedef {{action: 'create', data: Partial<T>} | {action: 'update', id: string, data: Partial<T>} | {action: 'delete', id: string}} MutationVars */
/** @template [T=Record<string, unknown>] @typedef {{mutate: (vars: MutationVars<T>, callbacks?: {onSuccess?: (data: unknown) => void, onError?: (error: Error) => void}) => void, mutateAsync: (vars: MutationVars<T>) => Promise<unknown>, isPending: boolean, isError: boolean, error: Error|null, reset: Function}} MutationState */
/** Stable key prefixes. Exported so a page can invalidate by hand if it must.
 * @type {{plugin: (pluginId: string) => unknown[], pluginList: (pluginId: string, entity: string, params?: ListParams) => unknown[], pluginRecord: (pluginId: string, entity: string, id: string) => unknown[], entity: (entity: string) => unknown[], entityList: (entity: string, params?: ListParams) => unknown[], entityRecord: (entity: string, id: string) => unknown[]}}
 */
export const queryKeys: {
    plugin: (pluginId: string) => unknown[];
    pluginList: (pluginId: string, entity: string, params?: ListParams) => unknown[];
    pluginRecord: (pluginId: string, entity: string, id: string) => unknown[];
    entity: (entity: string) => unknown[];
    entityList: (entity: string, params?: ListParams) => unknown[];
    entityRecord: (entity: string, id: string) => unknown[];
};
export type DataRow = Record<string, unknown>;
export type ListParams = {
    filter?: Record<string, unknown>;
    sort?: string;
    limit?: number;
    skip?: number;
};
export type HookOptions = {
    enabled?: boolean;
};
export type QueryState<T> = {
    data: T | undefined;
    error: Error | null;
    isLoading: boolean;
    isPending: boolean;
    isError: boolean;
    isFetching: boolean;
    isSuccess: boolean;
    refetch: Function;
};
export type RowsResult<T> = T[] & {
    items: T[];
    total: number;
};
export type PluginRowOf<P extends string, E extends string> = import("./joorchin.js").PluginRow<P, E>;
export type MutationVars<T = Record<string, unknown>> = {
    action: "create";
    data: Partial<T>;
} | {
    action: "update";
    id: string;
    data: Partial<T>;
} | {
    action: "delete";
    id: string;
};
export type MutationState<T = Record<string, unknown>> = {
    mutate: (vars: MutationVars<T>, callbacks?: {
        onSuccess?: (data: unknown) => void;
        onError?: (error: Error) => void;
    }) => void;
    mutateAsync: (vars: MutationVars<T>) => Promise<unknown>;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
    reset: Function;
};
