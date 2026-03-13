import React, { useState, useEffect } from 'react';
import {
    Table, Tag, Card, Typography, Button, Space, 
    Statistic, Row, Col, Badge, Select, Tooltip
} from 'antd';
import {
    SearchOutlined, ReloadOutlined, FileExcelOutlined, 
    TeamOutlined, DatabaseOutlined, ShopOutlined
} from '@ant-design/icons';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const { Title, Text } = Typography;

export const Admin = () => {
    const [groupedSurveys, setGroupedSurveys] = useState([]);
    const [filters, setFilters] = useState({ district: '', mandal: '' });
    const [loading, setLoading] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({ district: '', mandal: '' });
    
    // Geo States
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);
    const [geoLoading, setGeoLoading] = useState({ dist: false, mandal: false });

    // 1. Fetch Districts on Mount
    useEffect(() => {
        setGeoLoading(prev => ({ ...prev, dist: true }));
        axios.get(`${API_BASE}/districts`)
            .then(res => setDistricts(res.data))
            .finally(() => setGeoLoading(prev => ({ ...prev, dist: false })));
    }, []);

    // 2. Fetch Grouped Data whenever filters change
    useEffect(() => {
        fetchGroupedData();
    }, [appliedFilters]);

    const fetchGroupedData = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(appliedFilters);
            // Calling your NEW grouped endpoint
            const response = await fetch(`${API_BASE}/surveys/grouped?${query}`);
            const result = await response.json();
            if (result.success) {
                setGroupedSurveys(result.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDistrictChange = (value, option) => {
        setFilters({ district: option.children, mandal: '' });
        setMandals([]);
        setGeoLoading(prev => ({ ...prev, mandal: true }));
        axios.get(`${API_BASE}/mandals/${value}`)
            .then(res => setMandals(res.data))
            .finally(() => setGeoLoading(prev => ({ ...prev, mandal: false })));
    };

    const columns = [
        {
            title: "District",
            dataIndex: "district",
            key: "district",
            fixed: 'left',
            render: (text) => <Tag color="blue" style={{fontWeight: 'bold'}}>{text}</Tag>
        },
        {
            title: "Mandal Name",
            dataIndex: "mandal",
            key: "mandal",
            render: (text) => <Text strong><ShopOutlined /> {text}</Text>
        },
        {
            title: "Total Surveys",
            dataIndex: "surveyCount",
            key: "surveyCount",
            align: 'center',
            render: (count) => <Badge count={count} overflowCount={9999} color="#52c41a" />
        },
        {
            title: "Rice (Total Kg)",
            dataIndex: "rice",
            key: "rice",
            render: (val) => <Text style={{color: '#f59e0b'}}>{val} Kg</Text>
        },
        {
            title: "Milk (Total Litres)",
            dataIndex: "milk",
            key: "milk",
            render: (val) => <Text style={{color: '#3b82f6'}}>{val} L</Text>
        },
        {
            title: "Sugar (Total Kg)",
            dataIndex: "sugar",
            key: "sugar",
            render: (val) => <Text>{val} Kg</Text>
        }
    ];

    return (
        <div style={{ padding: '30px', backgroundColor: '#f4f7fe', minHeight: '100vh' }}>
            
            {/* Stats Header */}
            <Row gutter={[20, 20]} style={{ marginBottom: '30px' }}>
                <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={2}>Mandal Consumption Report</Title>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchGroupedData}>Refresh</Button>
                        <Button type="primary" icon={<FileExcelOutlined />} style={{backgroundColor: '#107c41'}}>Export Report</Button>
                    </Space>
                </Col>
                <Col xs={24} sm={12}>
                    <Card bordered={false} style={{ borderRadius: '15px' }}>
                        <Statistic title="Total Mandals Covered" value={groupedSurveys.length} prefix={<DatabaseOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card bordered={false} style={{ borderRadius: '15px' }}>
                        <Statistic title="Total Families Impacted" value={groupedSurveys.reduce((acc, curr) => acc + curr.surveyCount, 0)} prefix={<TeamOutlined />} />
                    </Card>
                </Col>
            </Row>

            {/* Cascading Filter Card */}
            <Card style={{ marginBottom: '25px', borderRadius: '15px', border: 'none' }}>
                <Space wrap size="large">
                    <div style={{ width: 220 }}>
                        <Text type="secondary" small>Filter District</Text>
                        <Select
                            showSearch
                            placeholder="Select District"
                            style={{ width: '100%' }}
                            loading={geoLoading.dist}
                            onChange={handleDistrictChange}
                        >
                            {districts.map(d => <Select.Option key={d._id} value={d._id}>{d.name}</Select.Option>)}
                        </Select>
                    </div>

                    <div style={{ width: 220 }}>
                        <Text type="secondary" small>Filter Mandal</Text>
                        <Select
                            showSearch
                            placeholder="Select Mandal"
                            style={{ width: '100%' }}
                            loading={geoLoading.mandal}
                            disabled={!filters.district}
                            onChange={(val, opt) => setFilters({...filters, mandal: opt.children})}
                        >
                            {mandals.map(m => <Select.Option key={m._id} value={m._id}>{m.name}</Select.Option>)}
                        </Select>
                    </div>

                    <div style={{ alignSelf: 'flex-end', marginBottom: '5px' }}>
                        <Button type="primary" shape="round" icon={<SearchOutlined />} onClick={() => setAppliedFilters(filters)}>
                            Generate Report
                        </Button>
                    </div>
                </Space>
            </Card>

            {/* Summary Table */}
            <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <Table
                    columns={columns}
                    dataSource={groupedSurveys}
                    loading={loading}
                    rowKey={(record) => `${record.district}-${record.mandal}`}
                    pagination={false} // Since grouped data is small (one per mandal)
                />
            </Card>
        </div>
    );
};