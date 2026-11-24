import { getAuthHeaders } from './auth.js';

function parseBody(xhr) {
  const text = xhr.responseText || '';
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Browser upload transport with real byte progress. `fetch` does not expose
 * upload progress, so generated sites should use this for file submissions.
 */
export function uploadRequest({
  url,
  body,
  method = 'POST',
  headers = {},
  onProgress,
}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.withCredentials = true;

    for (const [name, value] of Object.entries({
      ...getAuthHeaders(),
      ...headers,
    })) {
      xhr.setRequestHeader(name, value);
    }

    xhr.upload.addEventListener('progress', (event) => {
      const percent = event.lengthComputable
        ? Math.min(100, Math.round((event.loaded / event.total) * 100))
        : null;
      onProgress?.({ loaded: event.loaded, total: event.lengthComputable ? event.total : null, percent });
    });
    xhr.addEventListener('load', () => {
      const response = parseBody(xhr);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(response);
      } else {
        const message = response?.error?.message || response?.message || `Upload failed (${xhr.status})`;
        reject(new Error(message));
      }
    });
    xhr.addEventListener('error', () => reject(new Error('Upload failed because the network connection was lost')));
    xhr.addEventListener('abort', () => reject(new DOMException('Upload cancelled', 'AbortError')));
    xhr.send(body);
  });
}

export function uploadFile({ file, fieldName = 'files', fields = {}, ...options }) {
  const body = new FormData();
  body.append(fieldName, file);
  for (const [name, value] of Object.entries(fields)) {
    body.append(name, String(value));
  }
  return uploadRequest({ ...options, body });
}
