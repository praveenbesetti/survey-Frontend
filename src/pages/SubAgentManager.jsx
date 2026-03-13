import React, { useState, useEffect } from 'react';
import {
    Table, Tag, Card, Typography, Button, Space, Row, Col, Empty,
    Badge, Select, Modal, Form, Input, Switch, message, Divider
} from 'antd';
import {
    SearchOutlined, ReloadOutlined, UserAddOutlined,
    EditOutlined, TeamOutlined, EnvironmentOutlined,
    PhoneOutlined, UserOutlined, LockOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;


export const SubAgentManager = () => {
    // Selection States
    const [villages, setVillages] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);
    const [filters, setFilters] = useState({ district: '', mandal: '' });
    const [appliedMandalId, setAppliedMandalId] = useState(null);

    // UI States
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState({ dist: false, mandal: false });
    const [modalVisible, setModalVisible] = useState(false);
    const [activeVillageId, setActiveVillageId] = useState(null);
    const [editingAgent, setEditingAgent] = useState(null);
    const [form] = Form.useForm();

    // 1. Initial Load: Districts
    useEffect(() => {
        setGeoLoading(prev => ({ ...prev, dist: true }));
        axios.get(`/districts`)
            .then(res => setDistricts(res.data))
            .finally(() => setGeoLoading(prev => ({ ...prev, dist: false })));
    }, []);

    // 2. Fetch Villages when Mandal is Filtered
    const fetchVillages = async (mandalId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/villages/mandal/${mandalId}`);
            setVillages(res.data.data);
            setAppliedMandalId(mandalId);
        } catch (err) {
            message.error("Failed to load villages");
        } finally {
            setLoading(false);
        }
    };

    // 3. Dropdown Handlers
    const handleDistrictChange = (value, option) => {
        setFilters({ district: option.children, mandal: '', mandalId: '' });
        setMandals([]);
        setGeoLoading(prev => ({ ...prev, mandal: true }));
        axios.get(`/mandals/${value}`)
            .then(res => setMandals(res.data))
            .finally(() => setGeoLoading(prev => ({ ...prev, mandal: false })));
    };

    // 4. Modal Handlers (Add/Edit Agent)
    const handleOpenModal = (villageId, agent = null) => {
        setActiveVillageId(villageId);
        setEditingAgent(agent);
        if (agent) {
            form.setFieldsValue(agent);
        } else {
            form.resetFields();
            form.setFieldsValue({ isAuthorized: true });
        }
        setModalVisible(true);
    };

    const handleSaveAgent = async (values) => {
        try {
            if (editingAgent) {
                await axios.put(`/villages/${activeVillageId}/subagent/${editingAgent._id}`, values);
                message.success("Sub-agent profile updated");
            } else {
                await axios.post(`/villages/${activeVillageId}/subagent`, values);
                message.success("New sub-agent registered successfully");
            }
            setModalVisible(false);
            fetchVillages(appliedMandalId); // Refresh table
        } catch (err) {
            message.error("Operation failed. Check server connection.");
        }
    };

    // --- Table Columns ---

    const villageColumns = [
        {
            title: 'Village Name',
            dataIndex: 'name',
            width: '40%', // Takes up 40% of the space
            render: (t) => <Text strong><EnvironmentOutlined /> {t}</Text>
        },
        {
            title: 'Active Agents',
            dataIndex: 'subagents',
            width: '30%', // Takes up 30% of the space
            render: (agents) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge count={agents?.length || 0} color="#108ee9" showZero />
                    <Text type="secondary" style={{ fontSize: '12px' }}>Registered</Text>
                </div>
            )
        },
        {
            title: 'Actions',
            width: '30%', // Takes up the remaining 30%
            align: 'right',
            render: (record) => (
                <Button type="primary" ghost icon={<UserAddOutlined />} onClick={() => handleOpenModal(record._id)}>
                    Add Agent
                </Button>
            )
        }
    ];

    const expandedRowRender = (villageRecord) => {
        const agentColumns = [
            {
                title: 'Name & Phone',
                key: 'name',
                render: (agent) => (
                    <Space direction="vertical" size={0}>
                        <Text strong>{agent.name || "Untitled Agent"}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}><PhoneOutlined /> {agent.phoneNumber || "No Phone"}</Text>
                    </Space>
                )
            },
            { title: 'Username', dataIndex: 'username', render: (u) => <Tag icon={<UserOutlined />}>{u}</Tag> },
            { title: 'Token', dataIndex: 'token', render: (t) => <Text code>{t}</Text> },
            {
                title: 'Status',
                dataIndex: 'isAuthorized',
                render: (auth) => <Badge status={auth ? "success" : "error"} text={auth ? "Active" : "Blocked"} />
            },
            {
                title: 'Surveys',
                dataIndex: 'count',
                render: (c) => <Text type="secondary">{c} submitted</Text>
            },
            {
                title: 'Edit',
                render: (agent) => <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenModal(villageRecord._id, agent)} />
            }
        ];

        return (
            <Table
                columns={agentColumns}
                dataSource={villageRecord.subagents}
                pagination={false}
                size="small"
                rowKey="_id"
                bordered
            />
        );
    };

    return (
        <div style={{ padding: '30px', background: '#f0f2f5', minHeight: '100vh' }}>
            <Title level={2}><TeamOutlined /> Sub-Agent Administration</Title>

            {/* Selection Bar */}
            <Card style={{ marginBottom: 20, borderRadius: 12 }}>
                <Space wrap size="large">
                    <div style={{ width: 220 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>District</Text>
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
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Mandal</Text>
                        <Select
                            showSearch
                            placeholder="Select Mandal"
                            style={{ width: '100%' }}
                            loading={geoLoading.mandal}
                            disabled={!filters.district}
                            onChange={(val) => setFilters({ ...filters, mandalId: val })}
                        >
                            {mandals.map(m => <Select.Option key={m._id} value={m._id}>{m.name}</Select.Option>)}
                        </Select>
                    </div>

                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        style={{ marginTop: 22 }}
                        onClick={() => fetchVillages(filters.mandalId)}
                        disabled={!filters.mandalId}
                    >
                        Load Villages
                    </Button>
                </Space>
            </Card>

            {/* Village Table */}
            <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 12, overflow: 'hidden' }}>
                <Table
                    loading={loading}
                    columns={villageColumns}
                    dataSource={villages}
                    rowKey="_id"
                    expandable={{ expandedRowRender }}
                    locale={{ emptyText: <Empty description="Select a Mandal to view villages" /> }}
                />
            </Card>

            {/* Create/Edit Agent Modal */}
            <Modal
                title={editingAgent ? <b><EditOutlined /> Update Agent Profile</b> : <b><UserAddOutlined /> Register Sub-Agent</b>}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSaveAgent}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="Agent Full Name" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} placeholder="e.g. Ramesh" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true, len: 10 }]}>
                                <Input prefix={<PhoneOutlined />} placeholder="9988776655" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left" style={{ fontSize: 12 }}>Credentials</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                                <Input placeholder="village_sub_01" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                                <Input.Password prefix={<LockOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="isAuthorized" label="Account Authorization" valuePropName="checked">
                        <Switch checkedChildren="Authorized" unCheckedChildren="Blocked" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};