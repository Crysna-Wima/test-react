import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Input,
  Typography,
  Tag,
  Form,
  Switch,
  Row,
  Col,
  Card,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import type { Area } from '../services/api';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

const { Title } = Typography;

interface TableParams {
  pagination: TablePaginationConfig;
  sortField: string;
  sortOrder: string;
  filters: Record<string, FilterValue | null>;
}

const AreaList: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
    },
    sortField: 'area_id',
    sortOrder: 'ascend',
    filters: {},
  });
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query for fetching areas with parameters for pagination, sorting, and filtering
  const { data, isLoading, refetch } = useQuery(
    ['areas', tableParams],
    () => api.getAreas(
      tableParams.pagination.current,
      tableParams.pagination.pageSize,
      tableParams.sortField,
      tableParams.sortOrder === 'ascend' ? 'asc' : 'desc',
      { search: searchText }
    ),
    {
      keepPreviousData: true,
      onSuccess: (data) => {
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: data.totalCount,
          },
        });
      },
    }
  );

  // Mutation for deleting an area
  const deleteMutation = useMutation(api.deleteArea, {
    onSuccess: () => {
      message.success('Area deleted successfully');
      queryClient.invalidateQueries(['areas']);
    },
    onError: () => {
      message.error('Failed to delete area');
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Area> | SorterResult<Area>[]
  ) => {
    const sorterResult = Array.isArray(sorter) ? sorter[0] : sorter;
    
    setTableParams({
      pagination,
      filters,
      sortField: sorterResult.field as string || 'area_id',
      sortOrder: sorterResult.order || 'ascend',
    });
  };

  const handleSearch = () => {
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1,
      },
    });
    refetch();
  };

  const handleReset = () => {
    setSearchText('');
    setTableParams({
      pagination: {
        current: 1,
        pageSize: 10,
      },
      sortField: 'area_id',
      sortOrder: 'ascend',
      filters: {},
    });
    refetch();
  };

  const columns: ColumnsType<Area> = [
    {
      title: 'ID',
      dataIndex: 'area_id',
      key: 'area_id',
      sorter: true,
      width: 120,
      fixed: 'left',
    },
    {
      title: 'Name',
      dataIndex: 'area_name',
      key: 'area_name',
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'draft' ? 'blue' : status === 'active' ? 'green' : 'volcano'}>
          {status.toUpperCase()}
        </Tag>
      ),
      sorter: true,
      width: 120,
    },
    {
      title: 'Active',
      dataIndex: 'enable',
      key: 'enable',
      render: (enable: boolean) => <Switch checked={enable} disabled />,
      sorter: true,
      width: 100,
    },
    {
      title: 'Created Date',
      dataIndex: ['created', 'date'],
      key: 'created_date',
      sorter: true,
      width: 150,
    },
    {
      title: 'Modified Date',
      dataIndex: ['modified', 'date'],
      key: 'modified_date',
      sorter: true,
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.base64pk)}
            size="small"
          />
          <Popconfirm
            title="Are you sure to delete this area?"
            onConfirm={() => handleDelete(record.base64pk)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              loading={deleteMutation.isLoading}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3}>Area Management</Title>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={() => navigate('/add')}
            style={{ marginRight: 16 }}
          >
            Add New Area
          </Button>
        </Col>
      </Row>
      
      <Card style={{ marginBottom: 16 }}>
        <Form layout="inline">
          <Row gutter={16} style={{ width: '100%' }}>
            <Col flex="auto">
              <Form.Item label="Search" style={{ width: '100%' }}>
                <Input
                  placeholder="Search by ID or name"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onPressEnter={handleSearch}
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item>
                <Space>
                  <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
                    Search
                  </Button>
                  <Button onClick={handleReset} icon={<ReloadOutlined />}>
                    Reset
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Table
        columns={columns}
        dataSource={data?.data}
        rowKey="base64pk"
        loading={isLoading}
        onChange={handleTableChange}
        pagination={{
          ...tableParams.pagination,
          showTotal: (total) => `Total ${total} items`,
        }}
        scroll={{ x: 1200 }}
        size="middle"
      />
    </div>
  );
};

export default AreaList;