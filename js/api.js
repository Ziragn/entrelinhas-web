const base = (window.ENTRELINHAS_CONFIG?.apiBaseUrl || "http://localhost:8000").replace(/\/$/, "");

export const apiBase = base;
export async function request(path, { method = "GET", body, signal } = {}) {
  const timeout = AbortSignal.timeout(25000);
  const combinedSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method, headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined, signal: combinedSignal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("Não foi possível conectar. Verifique se a API está em execução e tente novamente.");
  }
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) {
    const message = typeof data.detail === "string" ? data.detail : "Confira os campos informados e tente novamente.";
    throw new Error(message);
  }
  return data;
}
