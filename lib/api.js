// Small helper for calling the Express API.
// '/api/...' is handled by Express in server.js (same server and port as the website).
export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch('/api/' + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Server is not responding. Start it with "npm run dev" in the project folder.');
  }

  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
