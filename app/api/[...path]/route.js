// Next.js route handler for every /api/... URL. The logic lives in server/api.js.
import { handleApi } from '@/server/api';

export const runtime = 'nodejs'; // MongoDB driver needs Node.js (not the Edge runtime)
export const dynamic = 'force-dynamic'; // always read fresh data from the database

async function handler(request, { params }) {
  const { path } = await params;
  return handleApi(request, path);
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
