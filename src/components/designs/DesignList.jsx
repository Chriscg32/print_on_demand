import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Input, Select, Empty, Spin, Modal, Upload, message } from 'antd';
import { SearchOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { fetchDesigns, deleteDesign } from '../../services/designService';

const { Option } = Select;
const { Meta } = Card;

const DesignList = () => {
  const { currentUser } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploadVisible, setUploadVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  useEffect(() => {
    const loadDesigns = async () => {
      try {
        setLoading(true);
        const data = await fetchDesigns(currentUser.tenantId);
        setDesigns(data);
      } catch (error) {
        console.error('Error loading designs:', error);
        message.error('Failed to load designs');
      } finally {
        setLoading(false);
      }
    };
    
    loadDesigns();
  }, [currentUser]);
  
  const handleDeleteDesign = async (designId) => {
    try {
      await deleteDesign(currentUser.tenantId, designId);
      setDesigns(designs.filter(design => design.id !== designId));
      message.success('Design deleted successfully');
    } catch (error) {
      console.error('Error deleting design:', error);
      message.error('Failed to delete design');
    }
  };
  
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Please select at least one file to upload');
      return;
    }
    
    setUploadLoading(true);
    
    try {
      // Here you would implement the actual upload logic
      // This is a placeholder for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success(`${fileList.length} design(s) uploaded successfully`);
      setUploadVisible(false);
      setFileList([]);
      
      // Refresh the designs list
      const data = await fetchDesigns(currentUser.tenantId);
      setDesigns(data);
    } catch (error) {
      console.error('Error uploading designs:', error);
      message.error('Failed to upload designs');
    } finally {
      setUploadLoading(false);
    }
  };
  
  const uploadProps = {
    onRemove: file => {
      setFileList(fileList.filter(item => item.uid !== file.uid));
    },
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
    multiple: true,
    accept: 'image/*,.ai,.psd,.eps,.svg',
  };
  
  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || design.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="design-list-container">
      <div className="design-list-header">
        <h2>Design Library</h2>
        <div className="design-list-actions">
          <Input 
            placeholder="Search designs..." 
            prefix={<SearchOutlined />} 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200, marginRight: 16 }}
          />
          <Select
            defaultValue="all"
            style={{ width: 150, marginRight: 16 }}
            onChange={(value) => setCategoryFilter(value)}
          >
            <Option value="all">All Categories</Option>
            <Option value="logo">Logos</Option>
            <Option value="illustration">Illustrations</Option>
            <Option value="pattern">Patterns</Option>
            <Option value="typography">Typography</Option>
            <Option value="photo">Photos</Option>
          </Select>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setUploadVisible(true)}
          >
            Upload Design
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="designs-loading">
          <Spin size="large" />
        </div>
      ) : filteredDesigns.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredDesigns.map(design => (
            <Col xs={24} sm={12} md={8} lg={6} key={design.id}>
              <Card
                hoverable
                cover={<img alt={design.name} src={design.thumbnailUrl} />}
                actions={[
                  <Button type="link" href={`/dashboard/designs/${design.id}`}>View</Button>,
                  <Button type="link" href={`/dashboard/designs/${design.id}/edit`}>Edit</Button>,
                  <Button 
                    type="link" 
                    danger
                    onClick={() => {
                      Modal.confirm({
                        title: 'Are you sure you want to delete this design?',
                        content: 'This action cannot be undone.',
                        onOk: () => handleDeleteDesign(design.id),
                      });
                    }}
                  >
                    Delete
                  </Button>,
                ]}
              >
                <Meta 
                  title={design.name} 
                  description={
                    <>
                      <div>{design.category}</div>
                      <div>Uploaded: {new Date(design.uploadedAt).toLocaleDateString()}</div>
                    </>
                  } 
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty 
          description={
            <span>
              No designs found. {searchText || categoryFilter !== 'all' ? 'Try adjusting your filters.' : 'Upload your first design!'}
            </span>
          }
        />
      )}
      </div>
      
      <Modal
        title="Upload Designs"
        visible={uploadVisible}
        onCancel={() => {
          setUploadVisible(false);
          setFileList([]);
        }}
        footer={[
          <Button key="back" onClick={() => {
            setUploadVisible(false);
            setFileList([]);
          }}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={uploadLoading} 
            onClick={handleUpload}
          >
            Upload
          </Button>,
        ]}
      >
        <Upload.Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Click or drag files to this area to upload</p>
          <p className="ant-upload-hint">
            Support for single or bulk upload. Supported formats: PNG, JPG, SVG, AI, PSD, EPS
          </p>
        </Upload.Dragger>
      </Modal>
    </div>
  );
};

export default DesignList;
