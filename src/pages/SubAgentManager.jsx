import React, { useState, useEffect, useMemo } from 'react';
import {
    Table, Tag, Card, Typography, Button, Space, Row, Col, Empty,
    Badge, Select, Modal, Form, Input, Switch, message, Divider, Tooltip, Popconfirm
} from 'antd';
import {
    SearchOutlined, ReloadOutlined, UserAddOutlined,
    EditOutlined, TeamOutlined, EnvironmentOutlined,
    PhoneOutlined, UserOutlined, LockOutlined, DeleteOutlined,
    QuestionCircleOutlined, HomeOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

export const SubAgentManager = () => {
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);
    const [villages, setVillages] = useState([]);

    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({ stateId: null, districtId: null, mandalId: null });

    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState({ state: false, dist: false, mandal: false });
    const [modalVisible, setModalVisible] = useState(false);
    const [activeVillage, setActiveVillage] = useState(null); // Full object for house_count check
    const [editingAgent, setEditingAgent] = useState(null);
    const [form] = Form.useForm();

    // ── DATA FETCHING ──────────────────────────────────────────────────
    useEffect(() => {
        setGeoLoading(prev => ({ ...prev, state: true }));
        axios.get('/states').then(res => setStates(res.data.data || res.data)).finally(() => setGeoLoading(prev => ({ ...prev, state: false })));
    }, []);

    const handleStateChange = (val) => {
        setFilters({ stateId: val, districtId: null, mandalId: null });
        axios.get(`/districts/state/${val}`).then(res => setDistricts(res.data.data || res.data));
    };

    const handleDistrictChange = (val) => {
        setFilters(prev => ({ ...prev, districtId: val, mandalId: null }));
        axios.get(`/mandals/agent/${val}`).then(res => setMandals(res.data));
    };

    const fetchVillages = async (mandalId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/villages/mandal/${mandalId}`);
            setVillages(res.data.data || res.data);
        } finally { setLoading(false); }
    };

    const filteredVillages = useMemo(() => {
        return villages.filter(v => v.name.toLowerCase().includes(searchText.toLowerCase()));
    }, [villages, searchText]);

    // ── HOUSEHOLD CALCULATION ──────────────────────────────────────────
    const getAssignedHouseholds = (village) => {
        // Change 'subagents' to 'subAgent'
        return village.subAgent?.reduce((sum, sa) => sum + (Number(sa.houseHolds) || 0), 0) || 0;
    };

    // ── ACTIONS ────────────────────────────────────────────────────────
    const handleSaveAgent = async (values) => {
        const totalAssigned = getAssignedHouseholds(activeVillage);
        const currentAgentHH = editingAgent ? editingAgent.houseHolds : 0;
        const newTotal = (totalAssigned - currentAgentHH) + Number(values.houseHolds);

        if (newTotal > activeVillage.house_count) {
            return message.error(`Limit Exceeded! Only ${activeVillage.house_count - (totalAssigned - currentAgentHH)} houses remaining.`);
        }

        try {
            const payload = {
                ...values,
                stateName: states.find(s => s._id === filters.stateId)?.name,
                districtName: districts.find(d => d._id === filters.districtId)?.name,
                mandalName: mandals.find(m => m._id === filters.mandalId)?.name,
                villageName: activeVillage.name
            };

            if (editingAgent) {
                await axios.put(`/villages/${activeVillage._id}/subagent/${editingAgent._id}`, payload);
            } else {
                await axios.post(`/villages/${activeVillage._id}/subagent`, payload);
            }
            setModalVisible(false);
            fetchVillages(filters.mandalId);
        } catch (err) { message.error("Failed to save"); }
    };

    const handleDeleteSubAgent = async (villageId, subAgentId) => {
        try {
            await axios.delete(`/villages/${villageId}/subagent/${subAgentId}`);
            message.success("Sub-agent removed");
            fetchVillages(filters.mandalId);
        } catch (err) { message.error("Delete failed"); }
    };

    // ── COLUMNS ────────────────────────────────────────────────────────
    const villageColumns = [
        {
            title: 'VILLAGE NAME',
            dataIndex: 'name',
            render: (t) => <Text style={{ color: '#000', fontWeight: '500', fontSize: '15px' }}>{t}</Text>
        },
        {
            title: 'ACTIVE SUB-AGENTS',
            // Change 'subagents' to 'subAgent'
            dataIndex: 'subAgent',
            width: 200,
            render: (agents) => (
                <Space>
                    <Badge count={agents?.length || 0} color="#000" showZero />
                    <Text type="secondary">Registered</Text>
                </Space>
            )
        },
        {
            title: 'TOTAL HOUSES',
            dataIndex: 'house_count',
            width: 150,
            render: (count) => <Text style={{ color: '#000', fontWeight: '700' }}>{count}</Text>
        },
        {
            title: 'ASSIGNMENT PROGRESS',
            render: (village) => {
                const assigned = getAssignedHouseholds(village);
                const remaining = village.house_count - assigned;
                return (
                    <Space>
                        <Text style={{ fontSize: '12px' }}>Assigned: <b>{assigned}</b></Text>
                        <Divider type="vertical" />
                        <Text style={{ fontSize: '12px', color: remaining === 0 ? '#16a34a' : '#dc2626' }}>
                            Remaining: <b>{remaining}</b>
                        </Text>
                    </Space>
                );
            }
        },
        {
            title: 'ACTION',
            width: 150,
            align: 'right',
            render: (record) => (
                <Button type="text" icon={<UserAddOutlined style={{ color: '#000' }} />} onClick={() => {
                    setActiveVillage(record);
                    setEditingAgent(null);
                    form.resetFields();
                    setModalVisible(true);
                }}> Add Sub-Agent</Button>
            )
        }
    ];

    const expandedRowRender = (village) => {
        const agentColumns = [
            {
                title: 'SUB-AGENT NAME',
                dataIndex: 'name',
                render: (t) => <Text style={{ color: '#000', fontWeight: '700', fontSize: '14px' }}>{t}</Text>
            },
            {
                title: 'PHONE',
                dataIndex: 'phone',
                render: (t) => <Text style={{ color: '#000', fontWeight: '500' }}>{t}</Text>
            },
            {
                title: 'ASSIGNED HH',
                dataIndex: 'houseHolds',
                render: (t) => <Text style={{ color: '#000', fontWeight: '800' }}>{t}</Text>
            },
            {
                title: 'CREDENTIALS',
                render: (agent) => (
                    <div style={{ fontSize: '12px' }}>
                        {/* FIXED: Change agent.username to agent.userName */}
                        U: {agent.userName} | P: {agent.password}
                    </div>
                )
            },
            {
                title: 'STATUS',
                render: (agent) => {
                    if (agent.active && !agent.delete) return <Text style={{ color: '#16a34a', fontWeight: '800', fontSize: '12px' }}>ACTIVE</Text>;
                    if (!agent.active && !agent.delete) return <Text style={{ color: '#000', fontWeight: '800', fontSize: '12px' }}>INACTIVE</Text>;
                    return <Text style={{ color: '#dc2626', fontWeight: '800', fontSize: '12px' }}>SUSPENDED</Text>;
                }
            },
            {
                title: 'ACTION',
                align: 'right',
                width: 120,
                render: (agent) => (
                    <Space>
                        <Button type="text" icon={<EditOutlined style={{ color: '#000' }} />} onClick={() => {
                            setActiveVillage(village);
                            setEditingAgent(agent);
                            // FIXED: Use userName here too for the form
                            form.setFieldsValue({ ...agent, username: agent.userName, status: agent.active, isDeleted: agent.delete });
                            setModalVisible(true);
                        }} />
                        <Popconfirm title="Remove Agent?" onConfirm={() => handleDeleteSubAgent(village._id, agent._id)}>
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Space>
                )
            }
        ];

        // FIXED: Change village.subagents to village.subAgent
        return <Table columns={agentColumns} dataSource={village.subAgent} pagination={false} size="small" rowKey="_id" bordered={false} />;
    };
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f2f5', overflow: 'hidden' }}>
            <div style={{ padding: '24px 24px 0 24px' }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col><Title level={3} style={{ margin: 0 }}><TeamOutlined /> Sub-Agent Manager</Title></Col>
                    <Col><Input placeholder="Search Village..." prefix={<SearchOutlined />} style={{ width: 300 }} onChange={e => setSearchText(e.target.value)} /></Col>
                </Row>

                <Card style={{ marginBottom: 16, borderRadius: 8 }}>
                    <Space wrap size="large" align="end">
                        <div style={{ width: 180 }}>
                            <Text type="secondary" style={{ fontSize: '11px' }}>STATE</Text>
                            <Select placeholder="State" style={{ width: '100%' }} onChange={handleStateChange}>
                                {states.map(s => <Select.Option key={s._id} value={s._id}>{s.name}</Select.Option>)}
                            </Select>
                        </div>
                        <div style={{ width: 180 }}>
                            <Text type="secondary" style={{ fontSize: '11px' }}>DISTRICT</Text>
                            <Select placeholder="District" style={{ width: '100%' }} disabled={!filters.stateId} onChange={handleDistrictChange}>
                                {districts.map(d => <Select.Option key={d._id} value={d._id}>{d.name}</Select.Option>)}
                            </Select>
                        </div>
                        <div style={{ width: 180 }}>
                            <Text type="secondary" style={{ fontSize: '11px' }}>MANDAL</Text>
                            <Select placeholder="Mandal" style={{ width: '100%' }} disabled={!filters.districtId} onChange={(val) => setFilters(prev => ({ ...prev, mandalId: val }))}>
                                {mandals.map(m => <Select.Option key={m._id} value={m._id}>{m.name}</Select.Option>)}
                            </Select>
                        </div>
                        <Button type="primary" icon={<SearchOutlined />} onClick={() => fetchVillages(filters.mandalId)}>Load Villages</Button>
                    </Space>
                </Card>
            </div>

            <div style={{ flex: 1, padding: '0 24px 24px 24px', overflow: 'hidden' }}>
                <Table
                    loading={loading}
                    columns={villageColumns}
                    dataSource={filteredVillages}
                    rowKey="_id"
                    expandable={{ expandedRowRender }}
                    pagination={false}
                    size="small"
                    scroll={{ y: 'calc(100vh - 350px)' }}
                />
            </div>

            <Modal title="Sub-Agent Configuration" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()} destroyOnClose>
                <Form form={form} layout="vertical" onFinish={handleSaveAgent}>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="name" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="phone" label="Phone" rules={[{ required: true, len: 10 }]}><Input /></Form.Item></Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="username" label="Username" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="password" label="Password" rules={[{ required: true }]}><Input.Password /></Form.Item></Col>
                    </Row>
                    <Divider orientation="left">Work Assignment</Divider>
                    <Form.Item name="houseHolds" label={`Assigned Households (Village Total: ${activeVillage?.house_count || 0})`} rules={[{ required: true }]}>
                        <Input type="number" prefix={<HomeOutlined />} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="active" label="Login Status" valuePropName="checked" initialValue={true}>
                                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                            </Form.Item>
                        </Col>

                    </Row>
                </Form>
            </Modal>
        </div>
    );
};