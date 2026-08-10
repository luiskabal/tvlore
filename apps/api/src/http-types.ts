export type HttpRequestWithCorrelationId = {
  correlationId?: string;
  headers: Record<string, string | string[] | undefined>;
  path?: string;
  url?: string;
};

export type HttpResponse = {
  header(name: string, value: string): void;
  status(code: number): HttpResponse;
  json(body: unknown): void;
};

export type Next = () => void;

