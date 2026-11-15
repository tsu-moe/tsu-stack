export const REQUEST_ID_HEADER = "X-Request-Id";

export type RequestIdOptions = {
  generator?: () => string;
  headerName?: string;
  limitLength?: number;
};

const INVALID_REQUEST_ID_CHARS_REGEX = /[^\w\-=]/;

export function resolveRequestId(headers: Headers, options: RequestIdOptions = {}) {
  const { generator = () => crypto.randomUUID(), headerName = REQUEST_ID_HEADER, limitLength = 255 } = options;
  const requestId = headers.get(headerName);

  if (!requestId || requestId.length > limitLength || INVALID_REQUEST_ID_CHARS_REGEX.test(requestId)) {
    return generator();
  }

  return requestId;
}
