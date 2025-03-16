// butterflyblue-frontend/src/App.jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    fetch('/api/')
      .then(res => res.json())
      .then(data => console.log(data.message))
      .catch(err => console.error('API Error:', err));
  }, []);

  return <div>Check browser console</div>;
}