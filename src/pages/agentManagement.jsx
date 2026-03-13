import React, { useState, useEffect } from 'react';
import {
    Table, Tag, Card, Typography, Button, Space, Row, Col, 
     Select, Modal, Form, Input, message, Divider
} from 'antd';
import {
     ReloadOutlined, EditOutlined, 
    TeamOutlined, PhoneOutlined, UserOutlined, LockOutlined, ShopOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;


export const AgentManager = () => {
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingMandal, setEditingMandal] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        axios.get(`/districts`).then(res => setDistricts(res.data));
    }, []);

    const fetchMandals = async (distId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/agent/${distId}`);
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

    const columns = [
        {
            title: 'Mandal Name',
            dataIndex: 'name',
            width: '25%',
            render: (t) => <Text strong><ShopOutlined /> {t}</Text>
        },
        {
            title: 'Agent Name',
            dataIndex: 'agentname',
            width: '20%',
            render: (t) => t ? <Tag color="blue">{t}</Tag> : <Text type="secondary">Not Assigned</Text>
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            width: '20%',
            render: (t) => <span><PhoneOutlined /> {t || 'N/A'}</span>
        },
        {
            title: 'Username',
            dataIndex: 'username',
            width: '20%',
            render: (t) => <Text code>{t}</Text>
        },
        {
            title: 'Password',
            dataIndex: 'password',
            width: '20%',
            render: (t) => <Text code>{t}</Text>
        },
        {
            title: 'Action',
            width: '15%',
            align: 'right',
            render: (record) => (
                <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={() => {
                        setEditingMandal(record);
                        form.setFieldsValue(record);
                        setModalVisible(true);
                    }}
                >
                    Edit Agent
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
            <Title level={2}><TeamOutlined /> Mandal Agent Management</Title>

            <Card style={{ marginBottom: 20, borderRadius: 12 }}>
                <Space wrap size="large">
                    <div style={{ width: 300 }}>
                        <Text type="secondary">Select District to view Mandals</Text>
                        <Select
                            showSearch
                            placeholder="Choose District"
                            style={{ width: '100%', marginTop: 5 }}
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
                        onClick={() => selectedDistrictId && fetchMandals(selectedDistrictId)}
                    >
                        Refresh
                    </Button>
                </Space>
            </Card>

            <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 12, overflow: 'hidden', width: '95%', margin: '0 auto' }}>
                <Table
                    loading={loading}
                    columns={columns}
                    dataSource={mandals}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={<b>Edit Agent for {editingMandal?.name}</b>}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="agentname" label="Agent Name" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="phone" label="Phone Number" rules={[{ required: true, len: 10 }]}>
                                <Input prefix={<PhoneOutlined />} maxLength={10} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider>Credentials</Divider>
                    <Form.Item name="username" label="Login Username" rules={[{ required: true }]}>
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