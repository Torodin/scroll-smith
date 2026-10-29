export type FetchLike = (input: string, init?: RequestInit) => Response | Promise<Response>;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  async request(
    method: string,
    path: string,
    options: { query?: Record<string, unknown>; body?: unknown } = {},
  ): Promise<unknown> {
    const url = new URL(path, this.baseUrl);
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, `${value as string | number | boolean}`);
    }
    const res = await this.fetchImpl(url.toString(), {
      method,
      headers: options.body === undefined ? undefined : { "content-type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    if (res.status === 204) return null;
    const text = await res.text();
    let data: unknown = text;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // keep raw text
    }
    if (!res.ok) throw new ApiError(res.status, describeError(data, res.statusText));
    return data;
  }
}

function describeError(data: unknown, fallback: string): string {
  if (typeof data === "string" && data) return data;
  if (data && typeof data === "object") {
    const record = data as { error?: unknown };
    if (typeof record.error === "string") return record.error;
    return JSON.stringify(data);
  }
  return fallback;
}
