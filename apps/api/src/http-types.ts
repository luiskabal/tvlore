export type HttpRequestWithCorrelationId = {
  correlationId?: string;
  headers: Record<string, string | string[] | undefined>;
  method?: string;
  originalUrl?: string;
  path?: string;
  url?: string;
};

export type HttpResponse = {
  header(name: string, value: string): void;
  on(event: "finish", listener: () => void): void;
  statusCode?: number;
  status(code: number): HttpResponse;
  json(body: unknown): void;
};

export type Next = () => void;
