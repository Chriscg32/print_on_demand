import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Button, Tabs, Space, message } from 'antd';
import { MailOutlined, PhoneOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCustomerById } from '../../services/customerService';
import { fetchCustomerOrders } from '../../services/orderService';

const { TabPane } = Tabs;

const CustomerDetail = () => {
  const { customerId } = useParams();
  const { currentUser } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  
  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoading(true);
        const data = await fetchCustomerById(currentUser.tenantId, customerId);
        setCustomer(data);
      } catch (error) {
        console.error('Error loading customer:', error);
        message.error('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };
    
    const loadOrders = async () => {
      try {
        setOrdersLoading(true);
        const data = await fetchCustomerOrders(currentUser.tenantId, customerId);
        setOrders(data);
      } catch (error) {
        console.error('Error loading customer orders:', error);
        message.error('Failed to load customer orders');
      } finally {
        setOrdersLoading(false);
      }
    };
    
    loadCustomer();
    loadOrders();
  }, [currentUser, customerId]);
  
  if (loading) {
    return <div>Loading customer details...</div>;
  }
  
  if (!customer) {
    return <div>Customer not found</div>;
  }
  
  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text) => <a href={`/dashboard/orders/${text}`}>{text}</a>,
    },
    {
      title: 'Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color;
        switch (status) {
          case 'pending': color = 'gold'; break;
          case 'processing': color = 'blue'; break;
          case 'shipped': color = 'green'; break;
          case 'delivered': color = 'green'; break;
          case 'cancelled': color = 'red'; break;
          default: color = 'default';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `$${total.toFixed(2)}`,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="primary" size="small" href={`/dashboard/orders/${record.orderId}`}>
          View
        </Button>
      ),
    },
  ];
  
  return (
    <div className="customer-detail-container">
      <div className="customer-detail-header">
        <h2>{customer.name}</h2>
        <Space>
          <Button 
            type="primary" 
            icon={<MailOutlined />}
            onClick={() => window.location.href = `mailto:${customer.email}`}
          >
            Email
          </Button>
          <Button 
            icon={<PhoneOutlined />}
            onClick={() => window.location.href = `tel:${customer.phone}`}
          >
            Call
          </Button>
          <Button 
            icon={<EditOutlined />}
            href={`/dashboard/customers/${customerId}/edit`}
          >
            Edit
          </Button>
        </Space>
      </div>
      
      <Card style={{ marginBottom: 20 }}>
        <Descriptions title="Customer Information" bordered>
          <Descriptions.Item label="Name">{customer.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{customer.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{customer.phone}</Descriptions.Item>
          <Descriptions.Item label="Address" span={3}>
            {customer.address?.street}, {customer.address?.city}, {customer.address?.state} {customer.address?.zipCode}, {customer.address?.country}
          </Descriptions.Item>
          <Descriptions.Item label="Customer Since">
            {new Date(customer.createdAt).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Total Orders">{orders.length}</Descriptions.Item>
          <Descriptions.Item label="Total Spent">
            ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Tabs defaultActiveKey="orders">
        <TabPane tab="Orders" key="orders">
          <Table 
            columns={orderColumns} 
            dataSource={orders} 
            rowKey="orderId"
            loading={ordersLoading}
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
        <TabPane tab="Notes" key="notes">
          <Card>
            {customer.notes ? (
              <div>{customer.notes}</div>
            ) : (
              <div>No notes for this customer.</div>
            )}
            <Button type="primary" style={{ marginTop: 16 }}>
              Add Note
            </Button>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default CustomerDetail;
