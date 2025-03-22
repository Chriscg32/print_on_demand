// Example API route for Next.js
// This would typically be placed in pages/api/hello.js or app/api/hello/route.js

// For Pages Router (pages/api/hello.js)
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from the API!' });
}

// For App Router (app/api/hello/route.js)
/*
export async function GET() {
  return Response.json({ message: 'Hello from the API!' });
}
*/