export type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 413; error: "Payload too large" }
  | { ok: false; status: 400; error: "Body must be valid JSON" };

export async function readJsonBody(
  request: Request,
  maxBytes: number,
): Promise<JsonBodyResult> {
  const raw = await request.text();

  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    return { ok: false, status: 413, error: "Payload too large" };
  }

  if (!raw.trim()) {
    return { ok: true, value: {} };
  }

  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, status: 400, error: "Body must be valid JSON" };
  }
}
