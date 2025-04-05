import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Descriptions, 
  Tag, 
  Spin, 
  message, 
  Modal, 
  Form, 
  Input, 
  Select,
  Row,
  Col,
  Divider,
  Tabs
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  DownloadOutlined, 
  ShareAltOutlined,
  TagsOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { fetchDesignById, updateDesign, deleteDesign } from '../../services/designService';
import { fetchProductsUsingDesign } from '../../services/productService';

const { Option } = Select;
const { TabPane } = Tabs;

const DesignDetail = () => {
  const { designId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [design, setDesign] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  useEffect(() => {
    const loadDesign = async () => {
      try {
        setLoading(true);
        const data = await fetchDesignById(currentUser.tenantId, designId);
        setDesign(data);
        form.setFieldsValue({
          name: data.name,
          category: data.category,
          tags: data.tags,
          description: data.description
        });
      } catch (error) {
        console.error('Error loading design:', error);
        message.error('Failed to load design details');
      } finally {
        setLoading(false);
      }
    };
    
    const loadRelatedProducts = async () => {
      try {
        setProductsLoading(true);
        const data = await fetchProductsUsingDesign(currentUser.tenantId, designId);
        setRelatedProducts(data);
      } catch (error) {
        console.error('Error loading related products:', error);
        message.error('Failed to load related products');
      } finally {
        setProductsLoading(false);
      }
    };
    
    loadDesign();
    loadRelatedProducts();
  }, [currentUser, designId, form]);
  
  const handleUpdateDesign = async (values) => {
    try {
      await updateDesign(currentUser.tenantId, designId, values);
      setDesign({...design, ...values});
      setEditModalVisible(false);
      message.success('Design updated successfully');
    } catch (error) {
      console.error('Error updating design:', error);
      message.error('Failed to update design');
    }
  };
  
  const handleDeleteDesign = async () => {
    try {
      await deleteDesign(currentUser.tenantId, designId);
      message.success('Design deleted successfully');
      navigate('/dashboard/designs');
    } catch (error) {
      console.error('Error deleting design:', error);
      message.error('Failed to delete design');
    }
  };
  
  const confirmDelete = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this design?',
      content: relatedProducts.length > 0 
        ? `This design is used in ${relatedProducts.length} product(s). Deleting it may affect these products.` 
        : 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: handleDeleteDesign
    });
  };
  
  if (loading) {
    return (
      <div className="design-loading">
        <Spin size="large" />
      </div>
    );
  }
  
  if (!design) {
    return <div>Design not found</div>;
  }
  
  return (
    <div className="design-detail-container">
      <div className="design-detail-header">
        <h2>{design.name}</h2>
        <div>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => setEditModalVisible(true)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            style={{ marginRight: 8 }}
            onClick={() => window.open(design.downloadUrl)}
          >
            Download
          </Button>
          <Button 
            icon={<ShareAltOutlined />} 
            style={{ marginRight: 8 }}
          >
            Share
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </div>
      </div>
      
      <Row gutter={24}>
        <Col span={16}>
          <Card className="design-preview-card">
            <div className="design-preview">
              <img 
                src={design.previewUrl} 
                alt={design.name} 
                style={{ maxWidth: '100%', maxHeight: '500px' }} 
              />
            </div>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card title="Design Information">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Name">{design.name}</Descriptions.Item>
              <Descriptions.Item label="Category">{design.category}</Descriptions.Item>
              <Descriptions.Item label="Uploaded">
                {new Date(design.uploadedAt).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="File Type">
                {design.fileType}
              </Descriptions.Item>
              <Descriptions.Item label="Dimensions">
                {design.width} x {design.height} px
              </Descriptions.Item>
              <Descriptions.Item label="File Size">
                {(design.fileSize / 1024).toFixed(2)} KB
              </Descriptions.Item>
              <Descriptions.Item label="Tags">
                {design.tags && design.tags.map(tag => (
                  <Tag key={tag} color="blue">{tag}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>
            
            {design.description && (
              <div style={{ marginTop: 16 }}>
                <h4>Description</h4>
                <p>{design.description}</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <Tabs defaultActiveKey="products">
        <TabPane 
          tab={
            <span>
              <FileImageOutlined />
              Products Using This Design ({relatedProducts.length})
            </span>
          } 
          key="products"
        >
          {productsLoading ? (
            <Spin />
          ) : relatedProducts.length > 0 ? (
            <Row gutter={[16, 16]}>
              {relatedProducts.map(product => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <Card
                    hoverable
                    cover={<img alt={product.name} src={product.thumbnailUrl} />}
                    onClick={() => navigate(`/dashboard/products/${product.id}`)}
                  >
                    <Card.Meta 
                      title={product.name} 
                      description={`$${product.price.toFixed(2)}`} 
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div>This design is not used in any products yet.</div>
          )}
        </TabPane>
      </Tabs>
      
      <Modal
        title="Edit Design"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateDesign}
        >
          <Form.Item
            name="name"
            label="Design Name"
            rules={[{ required: true, message: 'Please enter a design name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select>
              <Option value="logo">Logo</Option>
              <Option value="illustration">Illustration</Option>
              <Option value="pattern">Pattern</Option>
              <Option value="typography">Typography</Option>
              <Option value="photo">Photo</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select mode="tags" placeholder="Add tags">
              <Option value="seasonal">Seasonal</Option>
              <Option value="holiday">Holiday</Option>
              <Option value="abstract">Abstract</Option>
              <Option value="nature">Nature</Option>
              <Option value="geometric">Geometric</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DesignDetail;
