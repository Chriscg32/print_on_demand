import React, { useState } from 'react';

interface OrderFormProps {
  onSubmit?: (orderData: {
    design: string;
    designFile: File | null;
    quantity: number;
    size: string;
    color: string;
  }) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    design: '',
    quantity: 1,
    size: 'M',
    color: 'white'
  });

  const [designFile, setDesignFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Order submitted:', formData);
    if (onSubmit) {
      onSubmit({...formData, designFile});
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDesignFile(e.target.files[0]);
      setFormData({...formData, design: e.target.files[0].name});
    }
  };

  return (
    <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Custom Order</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="design-upload" className="block text-text mb-2">Design Upload</label>
          <input 
            id="design-upload"
            type="file" 
            className="input-field w-full"
            accept="image/*"
            onChange={handleFileChange}
            aria-label="Design Upload"
          />
        </div>
        <div className="form-group">
          <label htmlFor="quantity" className="block text-text mb-2">Quantity</label>
          <input 
            id="quantity"
            type="number" 
            className="input-field w-full"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
            aria-label="Quantity"
          />
        </div>
        <div className="form-group">
          <label htmlFor="size" className="block text-text mb-2">Size</label>
          <select 
            id="size"
            className="input-field w-full"
            value={formData.size}
            onChange={(e) => setFormData({...formData, size: e.target.value})}
            aria-label="Size"
          >
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
            <option value="XL">Extra Large</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="color" className="block text-text mb-2">Color</label>
          <select 
            id="color"
            className="input-field w-full"
            value={formData.color}
            onChange={(e) => setFormData({...formData, color: e.target.value})}
            aria-label="Color"
          >
            <option value="white">White</option>
            <option value="black">Black</option>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary w-full">
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
