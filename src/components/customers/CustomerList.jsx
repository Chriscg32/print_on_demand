import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Tag } from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCustomers } from '../../services/customerService';

const CustomerList = () => {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const data = await fetchCustomers(currentUser.tenantId);
        setCustomers(data);
      } catch (error) {
        console.error('Error loading customers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomers();
  }, [currentUser]);
  
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <a href={`/dashboard/customers/${record.id}`}>{text}</a>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Orders',
      dataIndex: 'orderCount',
      key: 'orderCount',
      render: (count) => count || 0,
      sorter: (a, b) => (a.orderCount || 0) - (b.orderCount || 0),
    },
    {
      title: 'Total Spent',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: (amount) => `$${(amount || 0).toFixed(2)}`,
      sorter: (a, b) => (a.totalSpent || 0) - (b.totalSpent || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" size="small" href={`/dashboard/customers/${record.id}`}>
            View
          </Button>
          <Button size="small">Contact</Button>
        </Space>
      ),
    },
  ];

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="customer-list-container">
      <div className="customer-list-header">
        <h2>Customers</h2>
        <div className="customer-list-actions">
          <Input 
            placeholder="Search customers..." 
            prefix={<SearchOutlined />} 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250, marginRight: 16 }}
          />
          <Button 
            type="primary" 
            icon={<UserAddOutlined />}
            href="/dashboard/customers/new"
          >
            Add Customer
          </Button>
        </div>
      </div>
      <Table 
        columns={columns} 
        dataSource={filteredCustomers} 
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};
