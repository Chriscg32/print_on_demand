import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Steps, Button, Modal, Select, message } from 'antd';
import { ShoppingOutlined, InboxOutlined, CarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { fetchOrderById, updateOrderStatus } from '../../services/orderService';

const { Step } = Steps;

const OrderDetail = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateStatusVisible, setUpdateStatusVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const data = await fetchOrderById(currentUser.tenantId, orderId);
        setOrder(data);
        setNewStatus(data.status);
      } catch (error) {
        console.error('Error loading order:', error);
        message.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    loadOrder();
  }, [currentUser, orderId]);
  
  const handleUpdateStatus = async () => {
    try {
      await updateOrderStatus(currentUser.tenantId, orderId, newStatus);
      setOrder({...order, status: newStatus});
      setUpdateStatusVisible(false);
      message.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Failed to update order status');
    }
  };
  
  const getStepStatus = (orderStatus, step) => {
    const statusMap = {
      'pending': 0,
      'processing': 1,
      'shipped': 2,
      'delivered': 3,
      'cancelled': -1
    };
    
    const orderStep = statusMap[orderStatus];
    const currentStep = statusMap[step];
    
    if (orderStatus === 'cancelled') {
      return 'error';
    }
    
    if (currentStep < orderStep) {
      return 'finish';
    } else if (currentStep === orderStep) {
      return 'process';
    } else {
      return 'wait';
    }
  };
  
  if (loading) {
    return <div>Loading order details...</div>;
  }
  
  if (!order) {
    return <div>Order not found</div>;
  }
  
  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Variant',
      dataIndex: 'variant',
      key: 'variant',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (text) => `$${text.toFixed(2)}`,
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => `$${(record.price * record.quantity).toFixed(2)}`,
    },
  ];
  
  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <h2>Order #{order.orderId}</h2>
        <Button 
          type="primary" 
          onClick={() => setUpdateStatusVisible(true)}
        >
          Update Status
        </Button>
      </div>
      
      <Card title="Order Status" style={{ marginBottom: 20 }}>
        <Steps current={getStepStatus(order.status, 'processing')}>
          <Step status={getStepStatus(order.status, 'pending')} title="Order Placed" icon={<ShoppingOutlined />} />
          <Step status={getStepStatus(order.status, 'processing')} title="Processing" icon={<InboxOutlined />} />
          <Step status={getStepStatus(order.status, 'shipped')} title="Shipped" icon={<CarOutlined />} />
          <Step status={getStepStatus(order.status, 'delivered')} title="Delivered" icon={<CheckCircleOutlined />} />
        </Steps>
      </Card>
      
      <Card title="Order Information" style={{ marginBottom: 20 }}>
        <Descriptions bordered>
          <Descriptions.Item label="Order ID">{order.orderId}</Descriptions.Item>
          <Descriptions.Item label="Date">{new Date(order.orderDate).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Status">{order.status.toUpperCase()}</Descriptions.Item>
          <Descriptions.Item label="Customer Name">{order.customerName}</Descriptions.Item>
          <Descriptions.Item label="Email">{order.customerEmail}</Descriptions.Item>
          <Descriptions.Item label="Phone">{order.customerPhone}</Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Card title="Shipping Address" style={{ marginBottom: 20 }}>
        <Descriptions bordered>
          <Descriptions.Item label="Address">{order.shippingAddress.street}</Descriptions.Item>
          <Descriptions.Item label="City">{order.shippingAddress.city}</Descriptions.Item>
          <Descriptions.Item label="State">{order.shippingAddress.state}</Descriptions.Item>
          <Descriptions.Item label="Zip Code">{order.shippingAddress.zipCode}</Descriptions.Item>
          <Descriptions.Item label="Country">{order.shippingAddress.country}</Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Card title="Order Items">
        <Table 
          columns={productColumns} 
          dataSource={order.items} 
          rowKey="productId"
          pagination={false}
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <strong>Subtotal:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  ${order.subtotal.toFixed(2)}
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <strong>Shipping:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  ${order.shipping.toFixed(2)}
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <strong>Tax:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  ${order.tax.toFixed(2)}
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <strong>Total:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>${order.total.toFixed(2)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
      
      <Modal
        title="Update Order Status"
        visible={updateStatusVisible}
        onOk={handleUpdateStatus}
        onCancel={() => setUpdateStatusVisible(false)}
      >
        <Select
          style={{ width: '100%' }}
          value={newStatus}
          onChange={(value) => setNewStatus(value)}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
      </Modal>
    </div>
  );
};

export default OrderDetail;
