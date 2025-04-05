import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, Divider, Modal, message } from 'antd';
import { CheckOutlined, CloseOutlined, CrownOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { fetchSubscriptionPlans, getCurrentSubscription, updateSubscription } from '../../services/billingService';

const SubscriptionPlans = () => {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingUpgrade, setProcessingUpgrade] = useState(false);
  
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const plansData = await fetchSubscriptionPlans();
        setPlans(plansData);
        
        const currentSubscription = await getCurrentSubscription(currentUser.tenantId);
        setCurrentPlan(currentSubscription);
      } catch (error) {
        console.error('Error loading subscription data:', error);
        message.error('Failed to load subscription information');
      } finally {
        setLoading(false);
      }
    };
    
    loadPlans();
  }, [currentUser]);
  
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setUpgradeModalVisible(true);
  };
  
  const handleUpgrade = async () => {
    try {
      setProcessingUpgrade(true);
      await updateSubscription(currentUser.tenantId, selectedPlan.id);
      setCurrentPlan({
        ...currentPlan,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      message.success(`Successfully upgraded to ${selectedPlan.name} plan`);
      setUpgradeModalVisible(false);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      message.error('Failed to upgrade subscription');
    } finally {
      setProcessingUpgrade(false);
    }
  };
  
  const renderFeature = (included) => {
    return included ? (
      <CheckOutlined style={{ color: '#52c41a' }} />
    ) : (
      <CloseOutlined style={{ color: '#f5222d' }} />
    );
  };
  
  return (
    <div className="subscription-plans-container">
      <div className="subscription-plans-header">
        <h2>Subscription Plans</h2>
        {currentPlan && (
          <div className="current-plan-info">
            <span>Current Plan: <strong>{currentPlan.planName}</strong></span>
            <span style={{ marginLeft: 16 }}>
              Next Billing Date: {new Date(currentPlan.nextBillingDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
      
      {loading ? (
        <div>Loading subscription plans...</div>
      ) : (
        <Row gutter={[16, 16]}>
          {plans.map(plan => {
            const isCurrentPlan = currentPlan && currentPlan.planId === plan.id;
            
            return (
              <Col xs={24} sm={24} md={8} key={plan.id}>
                <Badge.Ribbon 
                  text="Current Plan" 
                  color="green" 
                  style={{ display: isCurrentPlan ? 'block' : 'none' }}
                >
                  <Card 
                    title={
                      <div style
