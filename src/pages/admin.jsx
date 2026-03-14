import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Card,
    Table,
    Tag,
    Divider,
    Typography,
    Row,
    Col,
    Select,
    Button,
    Spin,
    Input
} from "antd";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import {
    TeamOutlined,
    DollarCircleOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    DollarOutlined
} from "@ant-design/icons";

const { Title } = Typography;
// const { Option } = Select;

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
    eggs: { label: "Eggs", unit: "", icon: "🥚", color: "#f59e0b" },
    bathSoap: { label: "Bath Soap", unit: "Kg", icon: "🧼", color: "#0ea5e9" },
    shampoo: { label: "Shampoo", unit: "Kg", icon: "🧴", color: "#8b5cf6" },
    detergent: { label: "Detergent", unit: "Kg", icon: "🧺", color: "#06b6d4" },
    dishWash: { label: "Dish Wash", unit: "Litre", icon: "🍽️", color: "#14b8a6" },
    toothpaste: { label: "Tooth Paste", unit: "Kg", icon: "🪥", color: "#6366f1" },
    other: { label: "Other", unit: "", icon: "📦", color: "#999999" }
};

const formatLabel = (key) => {
    return key
        .replace(/([A-Z])/g, " $1") // add space before capitals
        .replace(/^./, str => str.toUpperCase()) // capitalize first letter
        .trim();
};

export const Admin = () => {
    const [filters, setFilters] = useState({
        state: "",
        district: "",
        mandal: ""
    });
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);
    const [geoLoading, setGeoLoading] = useState({
        dist: false,
        mandal: false
    });

    const [data, setData] = useState([]);
    const [level, setLevel] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                setGeoLoading(prev => ({ ...prev, dist: true }));

                const res = await axios.get(
                    "http://localhost:5000/api/districts"
                );

                setDistricts(res.data);

            } catch (err) {
                console.error(err);
            } finally {
                setGeoLoading(prev => ({ ...prev, dist: false }));
            }
        };

        fetchDistricts();
    }, []);

    const handleDistrictChange = async (value, option) => {

        handleChange(option.children, "district");

        try {
            setGeoLoading(prev => ({ ...prev, mandal: true }));

            const res = await axios.get(
                `http://localhost:5000/api/mandals/${value}`
            );

            setMandals(res.data);

        } catch (err) {
            console.error(err);
        } finally {
            setGeoLoading(prev => ({ ...prev, mandal: false }));
        }
    };

    const handleChange = (value, name) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchData = async () => {
        setLoading(true);

        try {
            const query = new URLSearchParams(
                Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v)
                )
            );

            const res = await fetch(
                `http://localhost:5000/api/survey-data/grouped?${query}`
            );

            const result = await res.json();

            setData(result.data || []);
            setLevel(result.level);

        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    };

    const resetFilters = () => {
        setFilters({
            state: "",
            district: "",
            mandal: ""
        });
 setMandals([]);
        setData([]);
    };

    /* --------------------------------------- */
    /* SUMMARY CALCULATIONS */
    /* --------------------------------------- */

    const totalSurveys = data.reduce((acc, cur) => acc + cur.surveyCount, 0);

    const totalFamilies = data.reduce(
        (acc, cur) => acc + (cur.familyMembers || 0),
        0
    );

    const totalSpending = data.reduce(
        (acc, cur) => acc + (cur.monthlySpending || 0),
        0
    );

    /* --------------------------------------- */
    /* TABLE COLUMNS */
    /* --------------------------------------- */

    const columns = [
        {
            title: "Location",
            dataIndex: "location",
            render: text => <Tag color="blue">{text}</Tag>
        },
        {
            title: "Survey Count",
            dataIndex: "surveyCount"
        }
    ];

    /* --------------------------------------- */
    /* EXPANDED ROW UI */
    /* --------------------------------------- */

    const expandedRowRender = record => {
        const totals = Object.entries(record.totals || {});

        const distributions = Object.entries(record.distributions || {});

        const chartData = totals
            .map(([key, value]) => ({
                name: formatLabel(key),
                value
            }))
            .sort((a, b) => b.value - a.value);

        return (
            <div>
                <Row gutter={16} style={{ marginBottom: 20 }}>

                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

                                <TeamOutlined style={{ fontSize: 26, color: "#1890ff" }} />

                                <div>
                                    <div style={{ fontWeight: 600, color: "#666" }}>
                                        Family Members
                                    </div>

                                    <div style={{ fontSize: 22, fontWeight: 700 }}>
                                        {record.familyMembers}
                                    </div>
                                </div>

                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

                                <DollarCircleOutlined style={{ fontSize: 26, color: "#52c41a" }} />

                                <div>
                                    <div style={{ fontWeight: 600, color: "#666" }}>
                                        Monthly Spending
                                    </div>

                                    <div style={{ fontSize: 22, fontWeight: 700 }}>
                                        ₹ {(record.monthlySpending || 0).toLocaleString()}
                                    </div>
                                </div>

                            </div>
                        </Card>
                    </Col>

                </Row>
                <Title level={5}>Consumption Totals</Title>

                <Row gutter={[16, 16]}>
                    {totals.map(([item, value]) => {

                        const config = itemConfig[item] || {};

                        return (

                            <Col xs={12} sm={12} md={8} lg={6} xl={4} key={item}>

                                <Card
                                    size="small"
                                    bordered
                                    style={{
                                        borderLeft: `5px solid ${config.color || "#1890ff"}`,
                                        borderRadius: 8
                                    }}
                                >

                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

                                        <div
                                            style={{
                                                fontSize: 22,
                                                width: 36,
                                                height: 36,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                background: "#f5f5f5",
                                                borderRadius: 6
                                            }}
                                        >
                                            {config.icon}
                                        </div>

                                        <div style={{ flex: 1 }}>

                                            <div style={{ fontSize: 13, color: "#666" }}>
                                                {config.label}
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: 18,
                                                    fontWeight: 700,
                                                    color: config.color || "#1890ff"
                                                }}
                                            >
                                                {Number(value).toLocaleString()}{" "}
                                                <span style={{ fontSize: 12, color: "#999" }}>
                                                    {config.unit}
                                                </span>
                                            </div>

                                        </div>

                                    </div>

                                </Card>

                            </Col>

                        );

                    })}
                </Row>
                <Divider />

                <Title level={5}>Consumption Chart</Title>

                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>

                        <XAxis
                            dataKey="name"
                            angle={-35}
                            textAnchor="end"
                            interval={0}
                        />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey="value"
                            fill="#1677ff"
                            radius={[6, 6, 0, 0]}
                        />

                    </BarChart>
                </ResponsiveContainer>

                <Divider />

                <Title level={5}>Distributions</Title>

                <Row gutter={24}>
                    {distributions.map(([category, values], i) => (
                        <Col md={8} key={category}>
                            <Card size="small">
                                <strong>{formatLabel(category)}</strong>

                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={values}
                                            dataKey="percent"
                                            nameKey="value"
                                            outerRadius={80}
                                            label
                                        >
                                            {values.map((entry, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 pt-20">

            <Title level={3}>Survey Analytics Dashboard</Title>

            {/* FILTERS */}

            <Card style={{ marginBottom: 20 }}>
                <Row gutter={[16, 16]} align="middle">

                    {/* State */}

                    <Col>
                        <Input
                            placeholder="State"
                            style={{ width: 180 }}
                            value={filters.state}
                            onChange={(e) =>
                                handleChange(e.target.value, "state")
                            }
                        />
                    </Col>

                    {/* District */}

                    <Col>
                        <Select
                            showSearch
                            placeholder="Select District"
                            value={filters.district || undefined}
                            style={{ width: 200 }}
                            loading={geoLoading.dist}
                            onChange={handleDistrictChange}
                            optionFilterProp="children"
                        >
                            {districts.map(d => (
                                <Select.Option key={d._id} value={d._id}>
                                    {d.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>

                    {/* Mandal */}

                    <Col>
                        <Select
                            showSearch
                            placeholder="Select Mandal"
                            value={filters.mandal || undefined}
                            style={{ width: 200 }}
                            loading={geoLoading.mandal}
                            disabled={!filters.district}
                            onChange={(value, option) =>
                                handleChange(option.children, "mandal")
                            }
                            optionFilterProp="children"
                        >
                            {mandals.map(m => (
                                <Select.Option key={m._id} value={m._id}>
                                    {m.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>

                    {/* Buttons */}

                    <Col>
                        <Button type="primary" onClick={fetchData}>
                            Search
                        </Button>
                    </Col>

                    <Col>
                        <Button onClick={resetFilters}>
                            Reset
                        </Button>
                    </Col>

                </Row>
            </Card>

            {/* SUMMARY */}

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>

                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={{ background: "#f0f5ff" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

                            <EnvironmentOutlined style={{ fontSize: 28, color: "#1677ff" }} />

                            <div>
                                <div style={{ color: "#666", fontSize: 13 }}>
                                    Locations
                                </div>

                                <div style={{ fontSize: 24, fontWeight: 700 }}>
                                    {data.length}
                                </div>
                            </div>

                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={{ background: "#f6ffed" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

                            <FileTextOutlined style={{ fontSize: 28, color: "#52c41a" }} />

                            <div>
                                <div style={{ color: "#666", fontSize: 13 }}>
                                    Total Surveys
                                </div>

                                <div style={{ fontSize: 24, fontWeight: 700 }}>
                                    {totalSurveys}
                                </div>
                            </div>

                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={{ background: "#fff7e6" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

                            <TeamOutlined style={{ fontSize: 28, color: "#fa8c16" }} />

                            <div>
                                <div style={{ color: "#666", fontSize: 13 }}>
                                    Family Members
                                </div>

                                <div style={{ fontSize: 24, fontWeight: 700 }}>
                                    {totalFamilies}
                                </div>
                            </div>

                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={{ background: "#f9f0ff" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

                            <DollarOutlined style={{ fontSize: 28, color: "#722ed1" }} />

                            <div>
                                <div style={{ color: "#666", fontSize: 13 }}>
                                    Total Spending
                                </div>

                                <div style={{ fontSize: 24, fontWeight: 700 }}>
                                    ₹ {totalSpending.toLocaleString()}
                                </div>
                            </div>

                        </div>
                    </Card>
                </Col>

            </Row>

            {/* TABLE */}

            <Spin spinning={loading}>
                <Table
                    rowKey="location"
                    columns={columns}
                    dataSource={data}
                    expandable={{ expandedRowRender }}
                    pagination={false}
                />
            </Spin>
        </div>
    );
};