/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Select, Switch, message, Typography, Row, Col } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as api from '../services/api';
import type { AreaFormData } from '../services/api';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AreaForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Query for fetching area data in edit mode
  const { data: areaData, isLoading: isLoadingArea } = useQuery(
    ['area', id],
    () => api.getArea(id!),
    {
      enabled: isEditMode,
      onSuccess: (data) => {
        // Format data for the form
        form.setFieldsValue({
          area_id: data.area_id,
          area_name: data.area_name,
          status: data.status,
          enable: data.enable,
          description: data.description,
        });
      },
      onError: () => {
        message.error('Failed to load area data');
        navigate('/');
      },
    }
  );

  // Mutation for creating a new area
  const createMutation = useMutation(api.createArea, {
    onSuccess: () => {
      message.success('Area created successfully');
      queryClient.invalidateQueries(['areas']);
      navigate('/');
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      
      // More specific error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorData = error.response.data;
        if (typeof errorData === 'object' && errorData !== null) {
          // Handle structured error responses
          const errorMessages = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${errors}`)
            .join(', ');
          message.error(`Failed to create area: ${errorMessages}`);
        } else {
          message.error(`Failed to create area: ${error.response.status} ${error.response.statusText}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        message.error('Network error: Server did not respond. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        message.error(`Error creating area: ${error.message}`);
      }
    },
  });

  // Mutation for updating an existing area
  const updateMutation = useMutation(
    (data: AreaFormData) => api.updateArea(id!, data),
    {
      onSuccess: () => {
        message.success('Area updated successfully');
        queryClient.invalidateQueries(['areas']);
        queryClient.invalidateQueries(['area', id]);
        navigate('/');
      },
      onError: (error: any) => {
        console.error('Update error:', error);
        
        if (error.response) {
          const errorData = error.response.data;
          if (typeof errorData === 'object' && errorData !== null) {
            const errorMessages = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${errors}`)
              .join(', ');
            message.error(`Failed to update area: ${errorMessages}`);
          } else {
            message.error(`Failed to update area: ${error.response.status} ${error.response.statusText}`);
          }
        } else if (error.request) {
          message.error('Network error: Server did not respond. Please check your connection.');
        } else {
          message.error(`Error updating area: ${error.message}`);
        }
      },
    }
  );

  const handleSubmit = (values: AreaFormData) => {
    console.log('Submitting form with values:', values);
    
    if (isEditMode) {
      console.log(`Updating area with ID: ${id}`);
      updateMutation.mutate(values);
    } else {
      console.log('Creating new area');
      createMutation.mutate(values);
    }
  };

  const handleReset = () => {
    if (isEditMode && areaData) {
      form.setFieldsValue({
        area_id: areaData.area_id,
        area_name: areaData.area_name,
        status: areaData.status,
        enable: areaData.enable,
        description: areaData.description,
      });
    } else {
      form.resetFields();
    }
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3}>{isEditMode ? 'Edit Area' : 'Add New Area'}</Title>
        </Col>
        <Col>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
            style={{ marginRight: 16 }}
          >
            Back to List
          </Button>
        </Col>
      </Row>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'draft',
            enable: true,
          }}
          disabled={isLoadingArea}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Area ID"
                name="area_id"
                rules={[
                  { required: true, message: 'Please enter area ID' },
                  { max: 20, message: 'Area ID cannot exceed 20 characters' },
                ]}
                tooltip="Unique identifier for the area"
              >
                <Input 
                  placeholder="Enter area ID" 
                  disabled={isEditMode} 
                  autoComplete="off" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Area Name"
                name="area_name"
                rules={[
                  { required: true, message: 'Please enter area name' },
                  { max: 100, message: 'Area name cannot exceed 100 characters' },
                ]}
              >
                <Input placeholder="Enter area name" autoComplete="off" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="draft">Draft</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Active"
                name="enable"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={createMutation.isLoading || updateMutation.isLoading}
              icon={<SaveOutlined />}
              style={{ marginRight: 8 }}
            >
              {isEditMode ? 'Update' : 'Save'}
            </Button>
            <Button onClick={handleReset}>Reset</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AreaForm;