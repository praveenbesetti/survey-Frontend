import React, { useState, useEffect, useMemo } from "react"; // Added useMemo here
import axios from "axios";
import {
    Card, Table, Tag, Divider, Typography, Row, Col, 
    Select, Button, Spin, message, Statistic, Space, Input // Added Input here
} from "antd";
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
    TeamOutlined, EnvironmentOutlined, FileTextOutlined,
    DollarOutlined, ReloadOutlined, SearchOutlined
} from "@ant-design/icons";
import { API_BASE } from "../url";

const { Title, Text } = Typography;

// Configuration for colors and units
const COLORS = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1"];

const itemConfig = {
    rice: { label: "Rice", unit: "Kg", icon: "🍚", color: "#f59e0b" },
    wheat: { label: "Wheat", unit: "Kg", icon: "🌾", color: "#eab308" },
    toorDal: { label: "Toor Dal", unit: "Kg", icon: "🥣", color: "#f97316" },
    moongDal: { label: "Moong Dal", unit: "Kg", icon: "🥗", color: "#22c55e" },
    chanaDal: { label: "Chana Dal", unit: "Kg", icon: "🫘", color: "#facc15" },
    oil: { label: "Oil", unit: "Litre", icon: "🛢️", color: "#f97316" },
    sugar: { label: "Sugar", unit: "Kg", icon: "🍬", color: "#ec4899" },
    salt: { label: "Salt", unit: "Kg", icon: "🧂", color: "#94a3b8" },
    tea: { label: "Tea", unit: "Kg", icon: "🍵", color: "#16a34a" },
    milk: { label: "Milk", unit: "Litre", icon: "🥛", color: "#3b82f6" },
    eggs: { label: "Eggs", unit: "Pcs", icon: "🥚", color: "#f59e0b" },
    bathSoap: { label: "Bath Soap", unit: "Pcs", icon: "🧼", color: "#0ea5e9" },
    shampoo: { label: "Shampoo", unit: "Pcs", icon: "🧴", color: "#8b5cf6" },
    detergent: { label: "Detergent", unit: "Kg", icon: "🧺", color: "#06b6d4" },
    dishWash: { label: "Dish Wash", unit: "Litre", icon: "🍽️", color: "#14b8a6" },
    toothpaste: { label: "Tooth Paste", unit: "Pcs", icon: "🪥", color: "#6366f1" },
    other: { label: "Other", unit: "", icon: "📦", color: "#999999" }
};

const formatLabel = (key) => {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()).trim();
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const rawKey = label.replace(/\s+/g, "").toLowerCase();
        const configKey = Object.keys(itemConfig).find(k => k.toLowerCase() === rawKey) || "other";
        const unit = itemConfig[configKey]?.unit || "";

        return (
            <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Text strong>{label}</Text>
                <br />
                <Text type="success" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {payload[0].value.toLocaleString()} {unit}
                </Text>
            </div>
        );
    }
    return null;
};

const ExpandedDashboard = ({ record }) => {
    const totals = Object.entries(record.totals || {});
    const chartData = totals
        .map(([key, value]) => ({ 
            name: formatLabel(key), 
            value: Number(value) 
        }))
        .sort((a, b) => b.value - a.value);

    return (
        <div style={{ padding: '24px', background: '#fafafa', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
            <Title level={5} style={{ marginBottom: 20 }}>
                📊 Detailed Resource Consumption: <Tag color="blue" style={{ fontSize: '14px' }}>{record.location}</Tag>
            </Title>
            
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card title="Total Volume by Item" size="small" bordered={false}>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData} margin={{ bottom: 60, top: 20 }}>
                                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} fontSize={11} stroke="#888" />
                                <YAxis tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => {
                                        const rawKey = entry.name.replace(/\s+/g, "").toLowerCase();
                                        const key = Object.keys(itemConfig).find(k => k.toLowerCase() === rawKey);
                                        return <Cell key={`cell-${index}`} fill={itemConfig[key]?.color || "#1890ff"} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
            
            <Divider orientation="left">Demographics & Distributions</Divider>
            
            <Row gutter={[16, 16]}>
                {Object.entries(record.distributions || {}).map(([category, values]) => (
                    <Col xs={24} md={8} key={category}>
                        <Card 
                            size="small" 
                            title={`${formatLabel(category)} Split`}
                            style={{ textAlign: 'center', borderRadius: '8px' }}
                        >
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie 
                                        data={values} 
                                        dataKey="percent" 
                                        nameKey="value" 
                                        outerRadius={65} 
                                        label={({ percent }) => `${(percent <= 1 ? percent * 100 : percent).toFixed(1)}%`}
                                    >
                                        {values.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${(value <= 1 ? value * 100 : value).toFixed(1)}%`, `Category: ${name}`]} />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export const Admin = () => {
    const [filters, setFilters] = useState({ state: "", district: "", mandal: "" });
    const [tableSearch, setTableSearch] = useState(""); // Search state
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState({ state: false, dist: false, mandal: false });

    useEffect(() => {
        setGeoLoading(prev => ({ ...prev, state: true }));
        axios.get('/states')
            .then(res => setStates(res.data.data || res.data))
            .catch(() => message.error("Failed to load states"))
            .finally(() => setGeoLoading(prev => ({ ...prev, state: false })));
    }, []);

    const handleStateChange = (stateId, option) => {
        setFilters({ state: option.children, district: "", mandal: "" });
        setDistricts([]);
        setMandals([]);
        setGeoLoading(prev => ({ ...prev, dist: true }));
        axios.get(`/districts/state/${stateId}`)
            .then(res => setDistricts(res.data.data || res.data))
            .catch(() => message.error("Failed to load districts"))
            .finally(() => setGeoLoading(prev => ({ ...prev, dist: false })));
    };

    const handleDistrictChange = (distId, option) => {
        setFilters(prev => ({ ...prev, district: option.children, mandal: "" }));
        setMandals([]);
        setGeoLoading(prev => ({ ...prev, mandal: true }));
        axios.get(`/mandals/agent/${distId}`)
            .then(res => setMandals(res.data))
            .catch(() => message.error("Failed to load mandals"))
            .finally(() => setGeoLoading(prev => ({ ...prev, mandal: false })));
    };

    const fetchData = async () => {
        if (!filters.state) return message.warning("Please select a state");
        setLoading(true);
        try {
            const query = new URLSearchParams(
                Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
            );
            const res = await fetch(`${API_BASE}/survey-data/grouped?${query}`);
            const result = await res.json();
            setData(result.data || []);
        } catch (err) {
            message.error("Failed to fetch analytics");
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setFilters({ state: "", district: "", mandal: "" });
        setDistricts([]);
        setMandals([]);
        setData([]);
        setTableSearch("");
    };

    // Filter Logic
    const filteredData = useMemo(() => {
        return data.filter(item => 
            item.location.toLowerCase().includes(tableSearch.toLowerCase())
        );
    }, [data, tableSearch]);

    const totalSurveys = data.reduce((acc, cur) => acc + cur.surveyCount, 0);
    const totalFamilies = data.reduce((acc, cur) => acc + (cur.familyMembers || 0), 0);
    const totalSpending = data.reduce((acc, cur) => acc + (cur.monthlySpending || 0), 0);

    const columns = [
        {
            title: "Geography",
            dataIndex: "location",
            render: text => <Text strong><EnvironmentOutlined /> {text}</Text>
        },
        {
            title: "Surveys",
            dataIndex: "surveyCount",
            align: 'center',
            render: count => <Tag color="blue">{count}</Tag>
        },
        {
            title: "Total Spending",
            dataIndex: "monthlySpending",
            render: val => <Text strong>₹{val?.toLocaleString()}</Text>
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
        <div style={{ padding: '20px 24px 0 24px', flexShrink: 0 }}>
            <Title level={3} style={{ margin: '0 0 16px 0' }}>📊 Analytics Center</Title>

            <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
                <Row gutter={[12, 12]} align="bottom">
                    <Col flex="1">
                        <Text type="secondary" style={{ fontSize: 10 }}>STATE</Text>
                        <Select placeholder="State" style={{ width: '100%' }} loading={geoLoading.state} onChange={handleStateChange} value={filters.state || undefined}>
                            {states.map(s => <Select.Option key={s._id} value={s._id}>{s.name}</Select.Option>)}
                        </Select>
                    </Col>
                    <Col flex="1">
                        <Text type="secondary" style={{ fontSize: 10 }}>DISTRICT</Text>
                        <Select showSearch disabled={!filters.state} placeholder="District" style={{ width: '100%' }} loading={geoLoading.dist} onChange={handleDistrictChange} value={filters.district || undefined}>
                            {districts.map(d => <Select.Option key={d._id} value={d._id}>{d.name}</Select.Option>)}
                        </Select>
                    </Col>
                    <Col flex="1">
                        <Text type="secondary" style={{ fontSize: 10 }}>MANDAL</Text>
                        <Select showSearch disabled={!filters.district} placeholder="Mandal" style={{ width: '100%' }} loading={geoLoading.mandal} onChange={(v, o) => setFilters(prev => ({ ...prev, mandal: o.children }))} value={filters.mandal || undefined}>
                            {mandals.map(m => <Select.Option key={m._id} value={m._id}>{m.name}</Select.Option>)}
                        </Select>
                    </Col>
                    <Col>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} onClick={fetchData} loading={loading}>Search</Button>
                            <Button icon={<ReloadOutlined />} onClick={resetFilters}>Reset</Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                <Col span={6}>
                    <Card size="small" bordered={false} bodyStyle={{ padding: '8px 12px' }}>
                        <Statistic title={<Text style={{ fontSize: 11 }}>Locations</Text>} value={filteredData.length} valueStyle={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small" bordered={false} bodyStyle={{ padding: '8px 12px' }}>
                        <Statistic title={<Text style={{ fontSize: 11 }}>Total Surveys</Text>} value={totalSurveys} valueStyle={{ fontSize: 18, fontWeight: 'bold', color: '#52c41a' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small" bordered={false} bodyStyle={{ padding: '8px 12px' }}>
                        <Statistic title={<Text style={{ fontSize: 11 }}>People Reach</Text>} value={totalFamilies} valueStyle={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small" bordered={false} bodyStyle={{ padding: '8px 12px' }}>
                        <Statistic title={<Text style={{ fontSize: 11 }}>Expenditure</Text>} value={totalSpending} suffix={<small style={{fontSize: 10}}>INR</small>} valueStyle={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1' }} />
                    </Card>
                </Col>
            </Row>

            {/* SEARCH INPUT BAR - ADDED HERE */}
            <div style={{ marginBottom: 12 }}>
                <Input 
                    placeholder="Quick search location name..." 
                    prefix={<SearchOutlined />} 
                    allowClear
                    value={tableSearch}
                    onChange={e => setTableSearch(e.target.value)}
                />
            </div>
        </div>

        {/* SCROLLABLE DATA SECTION */}
        <div style={{ flex: 1, padding: '0 24px 24px 24px', overflow: 'hidden' }}>
            <Card bodyStyle={{ padding: 0 }} style={{ height: '100%', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Table
                    rowKey="location"
                    columns={columns}
                    dataSource={filteredData} // Using filteredData here
                    loading={loading}
                    expandable={{
                        expandedRowRender: (record) => <ExpandedDashboard record={record} />,
                        expandRowByClick: true
                    }}
                    pagination={{ 
                        pageSize: 20, 
                        size: 'small',
                        showSizeChanger: false 
                    }}
                    scroll={{ y: 'calc(100vh - 410px)' }} // Offset adjusted for search bar
                />
            </Card>
        </div>
    </div>
  );
};