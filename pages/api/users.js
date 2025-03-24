export default function handler(req, res) {
  // Add caching headers where appropriate
  res.setHeader('Cache-Control', 'private, no-cache');
  
  switch (req.method) {
    case 'GET':
      return res.status(200).json({ users: [] /* your users data */ });
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}
