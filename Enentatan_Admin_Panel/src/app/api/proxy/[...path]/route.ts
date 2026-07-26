import { NextRequest, NextResponse } from 'next/server';

// Server-side only — never sent to the browser, so no CORS issue.
const upstreamBaseUrl = (() => {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? 'https://api.eventstan.com';
  try {
    const parsed = new URL(base);
    if (parsed.hostname === 'localhost') {
      parsed.hostname = '127.0.0.1';
    }
    return `${parsed.toString().replace(/\/$/, '')}/api/v1/`;
  } catch {
    return `${base}/api/v1/`;
  }
})();

// Headers that must not be forwarded as-is (hop-by-hop / host-specific)
const STRIP_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'accept-encoding',
]);

const STRIP_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'transfer-encoding',
  'connection',
]);

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = params;
  const targetPath = (path ?? []).join('/');
  const search = req.nextUrl.search;
  const targetUrl = `${upstreamBaseUrl}${targetPath}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!STRIP_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const init: RequestInit = {
    method: req.method,
    headers,
    body,
    redirect: 'manual',
  };

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, init);
  } catch (err) {
    return NextResponse.json(
      { message: 'Upstream request failed', error: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  upstreamResponse.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as HEAD,
  handler as OPTIONS,
};

export const dynamic = 'force-dynamic';
