import React, { useState, useEffect } from 'react';
import {
    Table, Tag, Card, Typography, Button, Space, Row, Col,Popconfirm,
    Select, Modal, Form, Input, message, Divider, Switch
} from 'antd';
import {
    ReloadOutlined, EditOutlined,
    TeamOutlined, PhoneOutlined, UserOutlined, LockOutlined,
    ShopOutlined, SearchOutlined, PlusOutlined,
      DeleteOutlined, QuestionCircleOutlined
     

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

    // ── Edit modal ──
    const [editVisible, setEditVisible] = useState(false);
    const [editingMandal, setEditingMandal] = useState(null);
    const [editForm] = Form.useForm();

    // ── Add modal ──
    const [addVisible, setAddVisible] = useState(false);
    const [addForm] = Form.useForm();
    const [addDistricts, setAddDistricts] = useState([]);
    const [addMandals, setAddMandals] = useState([]);
    const [addStateId, setAddStateId] = useState(null);
    const [addDistrictId, setAddDistrictId] = useState(null);
    const [addLoading, setAddLoading] = useState(false);

    // ── Load states once ──────────────────────────────────────────────────────
    useEffect(() => {
        axios.get('/states')
            .then(res => setStates(res.data.data || res.data))
            .catch(() => message.error('Failed to load states'));
    }, []);

    // ── Filter table ──────────────────────────────────────────────────────────
    const fetchDistricts = async (stateId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/districts/state/${stateId}`);
            setDistricts(res.data.data || res.data);
            setMandals([]);
            setSelectedDistrictId(null);
        } catch { message.error('Failed to load districts'); }
        finally { setLoading(false); }
    };

    const fetchMandals = async (distId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/mandals/agent/${distId}`);
            setMandals(res.data);
        } catch { message.error('Failed to load mandals'); }
        finally { setLoading(false); }
    };

    const filteredMandals = mandals.filter(m =>
        m.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // ── Edit submit ───────────────────────────────────────────────────────────
    const handleEditSave = async (values) => {
        try {
            await axios.put(`/mandals/${editingMandal._id}/agent`, values);
            message.success('Mandal Agent updated successfully');
            setEditVisible(false);
            fetchMandals(selectedDistrictId);
        } catch { message.error('Update failed'); }
    };

    // ── Add modal: cascading selects ──────────────────────────────────────────
    const handleAddStateChange = async (stateId) => {
        setAddStateId(stateId);
        setAddDistrictId(null);
        setAddMandals([]);
        addForm.setFieldsValue({ districtId: undefined, mandalId: undefined });
        try {
            const res = await axios.get(`/districts/state/${stateId}`);
            setAddDistricts(res.data.data || res.data);
        } catch { message.error('Failed to load districts'); }
    };

    const handleAddDistrictChange = async (districtId) => {
        setAddDistrictId(districtId);
        setAddMandals([]);
        addForm.setFieldsValue({ mandalId: undefined });
        try {
            const res = await axios.get(`/mandals/${districtId}`);
            setAddMandals(res.data.data || res.data);
        } catch { message.error('Failed to load mandals'); }
    };


    // ── Add submit ────────────────────────────────────────────────────────────
    const handleAddSave = async (values) => {
        setAddLoading(true);

        // 1. Find the names based on the IDs selected in the form
        const stateName = states.find(s => s._id === values.stateId)?.name;
        const districtName = addDistricts.find(d => d._id === values.districtId)?.name;
        const mandalName = addMandals.find(m => m._id === values.mandalId)?.name;

        // 2. Build the augmented payload
        const payload = {
            ...values,
            stateName,      // Adding the name string
            districtName,   // Adding the name string
            mandalName      // Adding the name string
        };

        try {
            // 3. Send the full payload to your backend
            await axios.post('/mandals/agent', payload);

            message.success(`Agent ${values.agentname} added to ${mandalName} successfully`);
            setAddVisible(false);
            addForm.resetFields();
            setAddDistricts([]);
            setAddMandals([]);
            setAddStateId(null);
            setAddDistrictId(null);

            if (selectedDistrictId) fetchMandals(selectedDistrictId);
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to add agent');
        } finally {
            setAddLoading(false);
        }
    };

    const openAddModal = () => {
        addForm.resetFields();
        setAddDistricts([]);
        setAddMandals([]);
        setAddStateId(null);
        setAddDistrictId(null);
        setAddVisible(true);
    };
    const handleDeleteAgent = async (mandalId) => {
        try {
            // Send a request to clear the ManAgent object for this Mandal
            await axios.delete(`/mandals/${mandalId}/agent`);
            message.success('Agent removed successfully');
            fetchMandals(selectedDistrictId); // Refresh table
        } catch (err) {
            message.error('Failed to delete agent');
        }
    };
    // ── Table columns ─────────────────────────────────────────────────────────
  

const columns = [
    {
        title: 'MANDAL',
        dataIndex: 'name',
        key: 'name',
        width: '10%', // Toned down boldness
        render: (t) => <Text style={{ color: '#000', fontWeight: '500', fontSize: '15px' }}>{t}</Text>,
    },
    {
        title: 'AGENT ID',
        dataIndex: ['ManAgent', 'AgentId'],
        key: 'agentId',
        width: '28%', // Most width for the long ID
        render: (id) => id ? (
            <Text style={{ fontFamily: 'monospace', color: '#000', fontWeight: '500', fontSize: '14px' }}>
                {id}
            </Text>
        ) : null
    },
    {
        title: 'AGENT NAME',
        dataIndex: ['ManAgent', 'name'],
        key: 'agentname',
        width: '12%',
        render: (name) => name ? (
            <Text style={{ color: '#000', fontWeight: '700', fontSize: '15px' }}>{name}</Text>
        ) : null
    },
    {
        title: 'PHONE',
        dataIndex: ['ManAgent', 'phone'],
        key: 'phone',
        width: '10%',
        render: (phone) => phone ? (
            <Text style={{ color: '#000', fontWeight: '600', fontSize: '14px' }}>
                <PhoneOutlined style={{ fontSize: '12px', marginRight: 4 }} />{phone}
            </Text>
        ) : null
    },
    {
        title: 'CREDENTIALS', // <--- Re-inserted column
        key: 'credentials',
        width: '10%',
        render: (record) => record.ManAgent?.userName ? (
            <div style={{ fontSize: '13px', color: '#000', lineHeight: '1.2' }}>
                <div>U: {record.ManAgent.userName}</div>
                <div>P: {record.ManAgent.password}</div>
            </div>
        ) : null
    },
    {
        title: 'STATUS',
        key: 'status',
        width: '10%',
        render: (record) => {
            const agent = record.ManAgent;
            if (!agent?.name) return null;

            const isActive = agent.active; // status flag
            const isDeleted = agent.delete; // del flag

            // Logic: status true & del false -> ACTIVE (Green)
            if (isActive && !isDeleted) {
                return <Text style={{ color: '#16a34a', fontWeight: '800', fontSize: '12px' }}>ACTIVE</Text>;
            }

            // Logic: status false & del false -> INACTIVE (Black)
            if (!isActive && !isDeleted) {
                return <Text style={{ color: '#000', fontWeight: '800', fontSize: '12px' }}>INACTIVE</Text>;
            }

            // Logic: status false & del true -> SUSPENDED (Red)
            if (!isActive && isDeleted) {
                return <Text style={{ color: '#dc2626', fontWeight: '800', fontSize: '12px' }}>SUSPENDED</Text>;
            }

            return null;
        }
    },
    {
        title: 'ACTION',
        width: '10%',
        align: 'center',
        render: (record) => record.ManAgent?.name ? (
            <Space size="middle">
                <Button
                    type="text"
                    icon={<EditOutlined style={{ fontSize: '18px', color: '#000' }} />}
                    onClick={() => {
                        setEditingMandal(record);
                        const agent = record.ManAgent || {};
                        editForm.setFieldsValue({
                            agentname: agent.name,
                            phone: agent.phone,
                            username: agent.userName,
                            password: agent.password,
                            status: agent.active, // maps to active flag
                            isDeleted: agent.delete // maps to del flag
                        });
                        setEditVisible(true);
                    }}
                />
                <Popconfirm
                    title="Remove Agent Profile?"
                    onConfirm={() => handleDeleteAgent(record._id)}
                    okText="Yes"
                    cancelText="No"
                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined style={{ fontSize: '18px' }} />}
                    />
                </Popconfirm>
            </Space>
        ) : null
    }
];
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f2f5', overflow: 'hidden' }}>

            {/* ── FIXED HEADER ─────────────────────────────────────────────── */}
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
                    <Space wrap size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space wrap size="middle">
                            <div style={{ width: 200 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>STATE</Text>
                                <Select
                                    showSearch optionFilterProp="children"
                                    placeholder="Select State" style={{ width: '100%' }}
                                    onChange={(val) => { setSelectedStateId(val); fetchDistricts(val); }}
                                >
                                    {states.map(s => <Select.Option key={s._id} value={s._id}>{s.name}</Select.Option>)}
                                </Select>
                            </div>

                            <div style={{ width: 200 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>DISTRICT</Text>
                                <Select
                                    showSearch optionFilterProp="children"
                                    disabled={!selectedStateId}
                                    value={selectedDistrictId}
                                    placeholder="Select District" style={{ width: '100%' }}
                                    onChange={(val) => { setSelectedDistrictId(val); fetchMandals(val); }}
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

                        {/* ── ADD AGENT BUTTON ── */}
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            style={{ marginTop: 22, backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                            onClick={openAddModal}
                        >
                            Add Agent
                        </Button>
                    </Space>
                </Card>
            </div>

            {/* ── SCROLLABLE TABLE ──────────────────────────────────────────── */}
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
                        size="small" // REDUCES CELL SIZE
                        bordered={false} // REMOVES HEAVY BORDERS
                        scroll={{ y: 'calc(100vh - 320px)' }}
                        rowClassName={(record) => !record.ManAgent?.name ? 'unassigned-row' : ''}
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}
                    />
                </Card>
            </div>

            {/* ── EDIT MODAL ────────────────────────────────────────────────── */}
            <Modal
                title={<b><EditOutlined /> Edit Agent: {editingMandal?.name}</b>}
                open={editVisible}
                onCancel={() => setEditVisible(false)}
                onOk={() => editForm.submit()}
                destroyOnClose
            >
                <Form form={editForm} layout="vertical" onFinish={handleEditSave}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="agentname" label="Agent Name" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} placeholder="Full Name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="phone" label="Phone Number" rules={[{ required: true, len: 10, message: 'Enter valid 10-digit number' }]}>
                                <Input prefix={<PhoneOutlined />} maxLength={10} placeholder="10 Digit Mobile" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider orientation="left" style={{ fontSize: 12, color: '#999' }}>Login Details</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                                <Input.Password prefix={<LockOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="status" label="Status" valuePropName="checked">
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── ADD MODAL ─────────────────────────────────────────────────── */}
            <Modal
                title={<b><PlusOutlined /> Add New Agent</b>}
                open={addVisible}
                onCancel={() => setAddVisible(false)}
                onOk={() => addForm.submit()}
                confirmLoading={addLoading}
                destroyOnClose
            >
                <Form form={addForm} layout="vertical" onFinish={handleAddSave}>
                    <Divider orientation="left" style={{ fontSize: 12, color: '#999' }}>Location</Divider>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="stateId" label="State" rules={[{ required: true, message: 'Select a state' }]}>
                                <Select
                                    showSearch optionFilterProp="children"
                                    placeholder="Select State"
                                    onChange={handleAddStateChange}
                                >
                                    {states.map(s => <Select.Option key={s._id} value={s._id}>{s.name}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="districtId" label="District" rules={[{ required: true, message: 'Select a district' }]}>
                                <Select
                                    showSearch optionFilterProp="children"
                                    placeholder="Select District"
                                    disabled={!addStateId}
                                    onChange={handleAddDistrictChange}
                                >
                                    {addDistricts.map(d => <Select.Option key={d._id} value={d._id}>{d.name}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="mandalId" label="Mandal" rules={[{ required: true, message: 'Select a mandal' }]}>
                                <Select
                                    showSearch optionFilterProp="children"
                                    placeholder="Select Mandal"
                                    disabled={!addDistrictId}
                                >
                                    {addMandals.map(m => <Select.Option key={m._id} value={m._id}>{m.name}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left" style={{ fontSize: 12, color: '#999' }}>Agent Details</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="agentname" label="Agent Name" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} placeholder="Full Name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="phone" label="Phone Number" rules={[{ required: true, len: 10, message: 'Enter valid 10-digit number' }]}>
                                <Input prefix={<PhoneOutlined />} maxLength={10} placeholder="10 Digit Mobile" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left" style={{ fontSize: 12, color: '#999' }}>Login Details</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                                <Input.Password prefix={<LockOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="status" label="Status" initialValue={true} valuePropName="checked">
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
