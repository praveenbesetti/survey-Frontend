import React, { useState, useEffect, useMemo } from 'react';
import {
    Table, Card, Typography, Button, Space, Row, Col, Select, 
    Input, Checkbox, Popover, Tag, Divider, Tooltip, Empty
} from 'antd';
import {
    SearchOutlined, DownloadOutlined, FilterOutlined,
    ReloadOutlined, FileTextOutlined, SettingOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

export const SurveyManager = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    
    // Cascading Filter States
    const [filters, setFilters] = useState({ 
        stateName: null, districtName: null, MandalName: null, VillageName: null, surveyId: '' 
    });
    const [geoData, setGeoData] = useState({ states: [], districts: [], mandals: [], villages: [] });

    // Dynamic Column Visibility
    const defaultColumns = ['surveyId', 'familyHead', 'mobile', 'VillageName', 'familyMembers', 'occupation'];
    const [visibleColumns, setVisibleColumns] = useState(defaultColumns);

    // ── COLUMNS DEFINITION ──────────────────────────────────────────
    const allColumns = [
        { title: 'Survey ID', dataIndex: 'surveyId', key: 'surveyId', fixed: 'left', width: 120 },
        { title: 'Family Head', dataIndex: 'familyHead', key: 'familyHead', width: 180 },
        { title: 'Mobile', dataIndex: 'mobile', key: 'mobile', render: (m) => m?.join(', ') || 'N/A' },
        { title: 'Village', dataIndex: 'VillageName', key: 'VillageName' },
        { title: 'Mandal', dataIndex: 'MandalName', key: 'MandalName' },
        { title: 'District', dataIndex: 'districtName', key: 'districtName' },
        { title: 'Door No', dataIndex: 'doorNumber', key: 'doorNumber' },
        { title: 'Members', dataIndex: 'familyMembers', key: 'familyMembers' },
        { title: 'Occupation', dataIndex: 'occupation', key: 'occupation' },
        { title: 'Spending', dataIndex: 'monthlySpending', key: 'monthlySpending', render: (val) => <Tag color="green">₹{val}</Tag> },
        { 
            title: 'Rice Cons.', 
            key: 'rice', 
            render: (record) => record.consumption?.rice ? `${record.consumption.rice.value} ${record.consumption.rice.unit}` : '-' 
        },
        { title: 'Order Method', dataIndex: 'orderMethod', key: 'orderMethod' },
        { title: 'Survey Date', dataIndex: 'createdAt', key: 'createdAt', render: (d) => new Date(d).toLocaleDateString() },
    ];

    const columns = useMemo(() => {
        return allColumns.filter(col => visibleColumns.includes(col.key));
    }, [visibleColumns]);

    // ── DATA FETCHING ──────────────────────────────────────────────
    const fetchSurveys = async (params = {}) => {
        setLoading(true);
        try {
            // Replace with your actual endpoint
            const response = await axios.get('/api/survey-data', {
                params: {
                    page: pagination.current,
                    limit: pagination.pageSize,
                    ...filters,
                    ...params
                }
            });
            setData(response.data.data);
            setPagination(prev => ({ ...prev, total: response.data.total }));
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurveys();
        // Load initial state dropdowns here
    }, [pagination.current, pagination.pageSize]);

    // ── EXPORT TO CSV ──────────────────────────────────────────────
    const exportCSV = () => {
        const headers = columns.map(c => c.title).join(',');
        const rows = data.map(row => 
            columns.map(c => {
                const val = row[c.dataIndex] || '';
                return `"${val}"`;
            }).join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "survey_report.csv");
        document.body.appendChild(link);
        link.click();
    };

    // ── COLUMN SELECTOR COMPONENT ──────────────────────────────────
    const columnSelector = (
        <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px' }}>
            <Checkbox.Group 
                options={allColumns.map(c => ({ label: c.title, value: c.key }))}
                value={visibleColumns}
                onChange={(list) => setVisibleColumns(list)}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            />
        </div>
    );

    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header Section */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2} style={{ margin: 0 }}>
                        <FileTextOutlined /> Survey Forms
                    </Title>
                    <Text type="secondary">Manage and analyze household survey data</Text>
                </Col>
                <Col>
                    <Space>
                        <Popover content={columnSelector} title="Select Columns" trigger="click" placement="bottomRight">
                            <Button icon={<SettingOutlined />}>Columns</Button>
                        </Popover>
                        <Button icon={<DownloadOutlined />} onClick={exportCSV}>Export CSV</Button>
                        <Button type="primary" icon={<ReloadOutlined />} onClick={() => fetchSurveys()} />
                    </Space>
                </Col>
            </Row>

            {/* Filter Section */}
            <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                <Row gutter={[16, 16]} align="end">
                    <Col xs={24} sm={12} md={4}>
                        <Text strong style={{ fontSize: '12px' }}>SURVEY ID</Text>
                        <Input 
                            placeholder="Ex: SRV001" 
                            prefix={<SearchOutlined />} 
                            value={filters.surveyId}
                            onChange={e => setFilters({...filters, surveyId: e.target.value})}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Text strong style={{ fontSize: '12px' }}>STATE</Text>
                        <Select 
                            placeholder="Select State" 
                            style={{ width: '100%' }} 
                            onChange={val => setFilters({...filters, stateName: val})}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Text strong style={{ fontSize: '12px' }}>DISTRICT</Text>
                        <Select 
                            placeholder="Select District" 
                            style={{ width: '100%' }} 
                            disabled={!filters.stateName}
                            onChange={val => setFilters({...filters, districtName: val})}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Text strong style={{ fontSize: '12px' }}>MANDAL</Text>
                        <Select 
                            placeholder="Select Mandal" 
                            style={{ width: '100%' }} 
                            disabled={!filters.districtName}
                            onChange={val => setFilters({...filters, MandalName: val})}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Button 
                            type="primary" 
                            icon={<FilterOutlined />} 
                            block 
                            onClick={() => fetchSurveys({ page: 1 })}
                        >
                            Filter
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Table Section */}
            <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 12, overflow: 'hidden' }}>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="_id"
                    loading={loading}
                    scroll={{ x: 1300, y: 'calc(100vh - 420px)' }}
                    pagination={{
                        ...pagination,
                        onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} surveys`
                    }}
                    size="middle"
                />
            </Card>
        </div>
    );
};