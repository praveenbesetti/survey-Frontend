import React, { useState, useEffect } from 'react';
import {
    Table, Tag, Card, Typography, Button, Space, Row, Col, 
    Select, Modal, Form, Input, message, Divider
} from 'antd';
import {
    ReloadOutlined, EditOutlined, 
    TeamOutlined, PhoneOutlined, UserOutlined, LockOutlined, ShopOutlined, SearchOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

export const AgentManager = () => {
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);
    const [searchText, setSearchText] = useState('');
    
    const [selectedStateId, setSelectedStateId] = useState(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingMandal, setEditingMandal] = useState(null);
    const [form] = Form.useForm();

    // 1. Fetch States
    useEffect(() => {
        axios.get('/states')
            .then(res => setStates(res.data.data || res.data))
            .catch(() => message.error("Failed to load states"));
    }, []);

    // 2. Fetch Districts
    const fetchDistricts = async (stateId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/districts/state/${stateId}`);
            setDistricts(res.data.data || res.data);
            setMandals([]);
            setSelectedDistrictId(null);
        } catch (err) {
            message.error("Failed to load districts");
        } finally {
            setLoading(false);
        }
    };

    // 3. Fetch Mandals
    const fetchMandals = async (distId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/mandals/agent/${distId}`);
            setMandals(res.data);
        } catch (err) {
            message.error("Failed to load mandals");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values) => {
        try {
            await axios.put(`/mandals/${editingMandal._id}/agent`, values);
            message.success("Mandal Agent updated successfully");
            setModalVisible(false);
            fetchMandals(selectedDistrictId);
        } catch (err) {
            message.error("Update failed");
        }
    };

    // Filtered data for search
    const filteredMandals = mandals.filter(m => 
        m.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Mandal Name',
            dataIndex: 'name',
            key: 'name',
            render: (t) => <Text strong><ShopOutlined /> {t}</Text>,
        },
        {
            title: 'Agent Name',
            dataIndex: 'agentname',
            key: 'agentname',
            render: (t) => t ? <Tag color="blue">{t}</Tag> : <Text type="secondary">Not Assigned</Text>
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (t) => t ? <span><PhoneOutlined /> {t}</span> : '—'
        },
        {
            title: 'Credentials',
            key: 'credentials',
            render: (record) => (
                <Space direction="vertical" size={0}>
                    <Text size="small" type="secondary">U: {record.username}</Text>
                    <Text size="small" type="secondary">P: {record.password}</Text>
                </Space>
            )
        },
        {
            title: 'Action',
            width: 120,
            align: 'right',
            render: (record) => (
                <Button 
                    type="link" 
                    icon={<EditOutlined />} 
                    onClick={() => {
                        setEditingMandal(record);
                        form.setFieldsValue(record);
                        setModalVisible(true);
                    }}
                >
                    Edit
                </Button>
            )
        }
    ];

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            background: '#f0f2f5',
            overflow: 'hidden' 
        }}>
            {/* FIXED HEADER SECTION */}
            <div style={{ padding: '24px 24px 0 24px' }}>
                <Row justify="space-between" align="middle">
                    <Col><Title level={3} style={{ margin: 0 }}><TeamOutlined /> Mandal Agent Manager</Title></Col>
                    <Col>
                        <Input 
                            placeholder="Quick search mandal..." 
                            prefix={<SearchOutlined />} 
                            style={{ width: 250 }}
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </Col>
                </Row>
                
                <Card style={{ marginTop: 16, marginBottom: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Space wrap size="middle">
                        <div style={{ width: 200 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>STATE</Text>
                            <Select
                                placeholder="Select State"
                                style={{ width: '100%' }}
                                onChange={(val) => {
                                    setSelectedStateId(val);
                                    fetchDistricts(val);
                                }}
                            >
                                {states.map(s => <Select.Option key={s._id} value={s._id}>{s.name}</Select.Option>)}
                            </Select>
                        </div>

                        <div style={{ width: 200 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>DISTRICT</Text>
                            <Select
                                showSearch
                                disabled={!selectedStateId}
                                value={selectedDistrictId}
                                placeholder="Select District"
                                style={{ width: '100%' }}
                                onChange={(val) => {
                                    setSelectedDistrictId(val);
                                    fetchMandals(val);
                                }}
                            >
                                {districts.map(d => <Select.Option key={d._id} value={d._id}>{d.name}</Select.Option>)}
                            </Select>
                        </div>

                        <Button 
                            icon={<ReloadOutlined />} 
                            style={{ marginTop: 22 }} 
                            disabled={!selectedDistrictId}
                            onClick={() => fetchMandals(selectedDistrictId)}
                        >
                            Refresh
                        </Button>
                    </Space>
                </Card>
            </div>

            {/* SCROLLABLE TABLE SECTION */}
            <div style={{ flex: 1, padding: '0 24px 24px 24px', overflow: 'hidden' }}>
                <Card 
                    bodyStyle={{ padding: 0 }} 
                    style={{ height: '100%', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                >
                    <Table
                        loading={loading}
                        columns={columns}
                        dataSource={filteredMandals}
                        rowKey="_id"
                        pagination={false} 
                        scroll={{ y: 'calc(100vh - 360px)' }} 
                        bordered
                        size="middle"
                    />
                </Card>
            </div>

            {/* EDIT MODAL */}
            <Modal
                title={<b>Edit Agent: {editingMandal?.name}</b>}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="agentname" label="Agent Name" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} placeholder="Full Name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="phone" label="Phone Number" rules={[{ required: true, len: 10 }]}>
                                <Input prefix={<PhoneOutlined />} maxLength={10} placeholder="10 Digit Mobile" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider orientation="left" style={{ fontSize: '12px', color: '#999' }}>Login Details</Divider>
                    <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                        <Input prefix={<UserOutlined />} />
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};