/** @typedef {{user: Record<string, unknown>, actor: string, capabilities: string[], simulated: boolean}} MiniAppSession */
/** @returns {MiniAppSession|null} the current Mini App session, or null before authentication. */
export function miniAppSession(): MiniAppSession | null;
export function clearMiniAppSession(): void;
/**
 * @param {Record<string, unknown>} app the app handle (simulated previews carry `__joorchinSimulated`)
 * @param {Record<string, unknown>} [previewUser]
 * @returns {Promise<MiniAppSession|null>}
 */
export function authenticateMiniApp(app: Record<string, unknown>, previewUser?: Record<string, unknown>): Promise<MiniAppSession | null>;
/** @returns {Promise<MiniAppSession|null>} */
export function renewMiniAppSession(): Promise<MiniAppSession | null>;
/** Renew before expiry and on foreground return; refusal unmounts protected UI. */
/**
 * @param {Record<string, unknown>} app
 * @param {(session: MiniAppSession) => void} onSession
 * @param {(error: Error) => void} onError
 * @returns {() => void} stop function
 */
export function maintainMiniAppSession(app: Record<string, unknown>, onSession: (session: MiniAppSession) => void, onError: (error: Error) => void): () => void;
export type MiniAppSession = {
    user: Record<string, unknown>;
    actor: string;
    capabilities: string[];
    simulated: boolean;
};
