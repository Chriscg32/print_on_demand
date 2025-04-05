import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Space } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { fetchOrders } from '../../services/orderService';

const OrderList = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchOrders(currentUser.tenantId);
        setOrders(data);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, [currentUser]);
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'gold';
      case 'processing': return 'blue';
      case 'shipped': return 'green';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };
  
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text) => <a href={`/dashboard/orders/${text}`}>{text}</a>,
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (text) => `$${text.toFixed(2)}`,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" size="small" href={`/dashboard/orders/${record.orderId}`}>
            View
          </Button>
          <Button size="small">Update Status</Button>
        </Space>
      ),
    },
  ];
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <div className="order-list-container">
      <div className="order-list-header">
        <h2>Orders</h2>
        <div className="order-list-filters">
          <Input 
            placeholder="Search orders..." 
            prefix={<SearchOutlined />} 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200, marginRight: 16 }}
          />
          <Select
            defaultValue="all"
            style={{ width: 120 }}
            onChange={(value) => setFilterStatus(value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>
      </div>
      <Table 
        columns={columns} 
        dataSource={filteredOrders} 
        rowKey="orderId"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default OrderList;
