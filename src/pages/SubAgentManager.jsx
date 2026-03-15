import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
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
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);
    const [villages, setVillages] = useState([]);
    
    // Search State
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({ stateId: null, districtId: null, mandalId: null });

    // UI States
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState({ state: false, dist: false, mandal: false });
    const [modalVisible, setModalVisible] = useState(false);
    const [activeVillageId, setActiveVillageId] = useState(null);
    const [editingAgent, setEditingAgent] = useState(null);
    const [form] = Form.useForm();

    // 1. Initial Load: Fetch States
    useEffect(() => {
        setGeoLoading(prev => ({ ...prev, state: true }));
        axios.get('/states')
            .then(res => setStates(res.data.data || res.data))
            .catch(() => message.error("Failed to load states"))
            .finally(() => setGeoLoading(prev => ({ ...prev, state: false })));
    }, []);

    // 2. Handle State Change -> Fetch Districts
    const handleStateChange = (stateId) => {
        setFilters({ stateId, districtId: null, mandalId: null });
        setDistricts([]);
        setMandals([]);
        setVillages([]);
        
        setGeoLoading(prev => ({ ...prev, dist: true }));
        axios.get(`/districts/state/${stateId}`)
            .then(res => setDistricts(res.data.data || res.data))
            .catch(() => message.error("Failed to load districts"))
            .finally(() => setGeoLoading(prev => ({ ...prev, dist: false })));
    };

    // 3. Handle District Change -> Fetch Mandals
    const handleDistrictChange = (distId) => {
        setFilters(prev => ({ ...prev, districtId: distId, mandalId: null }));
        setMandals([]);
        setVillages([]);

        setGeoLoading(prev => ({ ...prev, mandal: true }));
        axios.get(`/mandals/agent/${distId}`)
            .then(res => setMandals(res.data))
            .catch(() => message.error("Failed to load mandals"))
            .finally(() => setGeoLoading(prev => ({ ...prev, mandal: false })));
    };

    // 4. Fetch Villages for selected Mandal
    const fetchVillages = async (mandalId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/villages/mandal/${mandalId}`);
            setVillages(res.data.data || res.data);
        } catch (err) {
            message.error("Failed to load villages");
        } finally {
            setLoading(false);
        }
    };

    // Real-time Search Filter Logic
    const filteredVillages = useMemo(() => {
        return villages.filter(v => 
            v.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [villages, searchText]);

    // 5. Modal Logic
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
                message.success("Sub-agent updated");
            } else {
                await axios.post(`/villages/${activeVillageId}/subagent`, values);
                message.success("Agent registered");
            }
            setModalVisible(false);
            fetchVillages(filters.mandalId); 
        } catch (err) {
            message.error("Operation failed");
        }
    };

    // --- Table Column Definitions ---
    const villageColumns = [
        {
            title: 'Village Name',
            dataIndex: 'name',
            render: (t) => <Text strong><EnvironmentOutlined /> {t}</Text>
        },
        {
            title: 'Active Agents',
            dataIndex: 'subagents',
            width: 200,
            render: (agents) => (
                <Space>
                    <Badge count={agents?.length || 0} color="#108ee9" showZero />
                    <Text type="secondary">Registered</Text>
                </Space>
            )
        },
        {
            title: 'Actions',
            width: 150,
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
                render: (agent) => (
                    <Space direction="vertical" size={0}>
                        <Text strong>{agent.name || "N/A"}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}><PhoneOutlined /> {agent.phone || "N/A"}</Text>
                    </Space>
                )
            },
            { title: 'Username', dataIndex: 'username', render: (u) => <Tag icon={<UserOutlined />}>{u}</Tag> },
            { title: 'Surveyor Id', dataIndex: 'surveyorId', render: (id) => <Text copyable>{id || "N/A"}</Text> },
            { 
                title: 'Status', 
                dataIndex: 'isAuthorized', 
                render: (auth) => <Badge status={auth ? "success" : "error"} text={auth ? "Active" : "Blocked"} /> 
            },
            { title: 'Surveys', dataIndex: 'count', render: (c) => <Text>{c || 0} Submissions</Text> },
            {
                title: 'Edit',
                align: 'right',
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
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f2f5', overflow: 'hidden' }}>
            
            {/* HEADER */}
            <div style={{ padding: '0px 24px 0 24px', display:"fixed" }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col><Title level={2} style={{ margin: 0 }}><TeamOutlined /> Sub-Agent Manager</Title></Col>
                    <Col>
                        {/* SEARCH BAR */}
                        <Input 
                            placeholder="Search village name..." 
                            prefix={<SearchOutlined />} 
                            style={{ width: 300 }}
                            allowClear
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </Col>
                </Row>

                <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                    <Space wrap size="large" align="end" style={{ width: '100%' }}>
                        <div style={{ width: 180 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>STATE</Text>
                            <Select
                                showSearch
                                optionFilterProp="children"
                                placeholder="Select State"
                                style={{ width: '100%', marginTop: 4 }}
                                loading={geoLoading.state}
                                onChange={handleStateChange}
                            >
                                {states.map(s => <Select.Option key={s._id} value={s._id}>{s.name}</Select.Option>)}
                            </Select>
                        </div>

                        <div style={{ width: 180 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>DISTRICT</Text>
                            <Select
                                showSearch
                                optionFilterProp="children"
                                placeholder="Select District"
                                style={{ width: '100%', marginTop: 4 }}
                                loading={geoLoading.dist}
                                disabled={!filters.stateId}
                                value={filters.districtId}
                                onChange={handleDistrictChange}
                            >
                                {districts.map(d => <Select.Option key={d._id} value={d._id}>{d.name}</Select.Option>)}
                            </Select>
                        </div>

                        <div style={{ width: 180 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>MANDAL</Text>
                            <Select
                                showSearch
                                optionFilterProp="children"
                                placeholder="Select Mandal"
                                style={{ width: '100%', marginTop: 4 }}
                                loading={geoLoading.mandal}
                                disabled={!filters.districtId}
                                value={filters.mandalId}
                                onChange={(val) => setFilters(prev => ({ ...prev, mandalId: val }))}
                            >
                                {mandals.map(m => <Select.Option key={m._id} value={m._id}>{m.name}</Select.Option>)}
                            </Select>
                        </div>

                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            disabled={!filters.mandalId}
                            onClick={() => fetchVillages(filters.mandalId)}
                        >
                            Load Villages
                        </Button>
                        
                        <Button icon={<ReloadOutlined />} onClick={() => filters.mandalId && fetchVillages(filters.mandalId)}>
                            Refresh
                        </Button>
                    </Space>
                </Card>
            </div>

            {/* SCROLLABLE TABLE CONTENT */}
            <div style={{ flex: 1, padding: '0 24px 24px 24px', overflow: 'hidden' }}>
                <Card bodyStyle={{ padding: 0 }} style={{ height: '100%', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Table
                        loading={loading}
                        columns={villageColumns}
                        dataSource={filteredVillages} // Using filtered data
                        rowKey="_id"
                        expandable={{ expandedRowRender }}
                        pagination={false}
                        scroll={{ y: 'calc(100vh - 350px)' }}
                        locale={{ emptyText: <Empty description="Select filters to load villages" /> }}
                    />
                </Card>
            </div>

            {/* MODAL Remains the same */}
            <Modal
                title={editingAgent ? <b>Update Agent Profile</b> : <b>Register Sub-Agent</b>}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSaveAgent}>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="name" label="Full Name" rules={[{ required: true }]}><Input prefix={<UserOutlined />} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="phone" label="Phone" rules={[{ required: true, len: 10 }]}><Input prefix={<PhoneOutlined />} /></Form.Item></Col>
                    </Row>
                    <Divider orientation="left" style={{ fontSize: 12 }}>Credentials</Divider>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="username" label="Username" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="password" label="Password" rules={[{ required: true }]}><Input.Password prefix={<LockOutlined />} /></Form.Item></Col>
                    </Row>
                    <Form.Item name="isAuthorized" label="Account Access" valuePropName="checked">
                        <Switch checkedChildren="Authorized" unCheckedChildren="Blocked" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};