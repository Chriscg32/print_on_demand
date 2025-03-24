export default function handler(req, res) {
  // Add caching headers for better performance
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return res.status(200).json({ products: [] /* your products data */ });
    case 'POST':
      // Handle product creation
      return res.status(201).json({ message: 'Product created' });
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}
