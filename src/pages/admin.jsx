import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Card, Space, Typography, Divider, Tag, Empty } from "antd";
import { SearchOutlined, FilterOutlined, ExpandOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";

const { Title } = Typography;

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
    toothpaste: { label: "Tooth Paste", unit: "Kg", icon: "🪥", color: "#6366f1" }
};

export const Admin = () => {
    const [surveys, setSurveys] = useState([]);
    const [filters, setFilters] = useState({ district: '', mandal: '', village: '' });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const limit = 10; // items per page
    const [appliedFilters, setAppliedFilters] = useState({
        district: '',
        mandal: '',
        village: ''
    });
    const [totals, setTotals] = useState({});

    useEffect(() => {
        fetchSurveys();
    }, [appliedFilters, page]);

    const columns = [
        {
            title: "Survey ID",
            dataIndex: "surveyId",
            width: 150,
            fixed: 'left',
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        { title: "Surveyor", dataIndex: "surveyorId", width: 120 },
        { title: "Ward Area", dataIndex: "wardArea", width: 120 },
        { title: "Door No", dataIndex: "doorNumber", width: 120 },
        {
            title: "Family Head",
            dataIndex: "familyHead",
            width: 150,
            render: (text) => <strong>{text}</strong>
        },
        { title: "Mobile", dataIndex: "mobile", width: 150 },
        { title: "Family Members", dataIndex: "familyMembers", width: 120 },
        { title: "Family Type", dataIndex: "familyType", width: 120 },
        { title: "Occupation", dataIndex: "occupation", width: 150 },
        { title: "Grocery Source", dataIndex: "grocerySource", width: 150 },
        { title: "Monthly Spending", dataIndex: "monthlySpending", width: 150 },
        { title: "Purchase Frequency", dataIndex: "purchaseFrequency", width: 150 },
        { title: "Brand Preference", dataIndex: "brandedPreference", width: 150 },
        { title: "Product Type", dataIndex: "productType", width: 150 },
        { title: "Cheaper Option", dataIndex: "cheaperOption", width: 150 },
        { title: "Order Method", dataIndex: "orderMethod", width: 150 }
    ];

    const consumptionColumns = [
        {
            title: "Item",
            dataIndex: "item",
            render: (text) => <Tag color="green">{text.replace(/([A-Z])/g, ' $1').toLowerCase()}</Tag>
        },
        { title: "Value", dataIndex: "value" },
        { title: "Unit", dataIndex: "unit" },
        { title: "Original Input", dataIndex: "originalInput" }
    ];

    const expandedRowRender = (record) => {
        const consumptionData = Object.entries(record.consumption || {}).map(([key, val]) => ({
            item: key,
            value: val?.value,
            unit: val?.unit,
            originalInput: val?.originalInput
        }));

        return (
            <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
                <Title level={4} style={{ marginBottom: '16px', color: '#1890ff' }}>
                    {/* <ExpandOutlined style={{ marginRight: '8px' }} /> */}
                    Consumption Details
                </Title>
                <Table
                    columns={consumptionColumns}
                    dataSource={consumptionData}
                    pagination={false}
                    size="small"
                    rowKey="item"
                    bordered
                />
                <Divider />
                <Space direction="vertical" size="small">
                    <div><strong>Survey Date:</strong> {new Date(record.createdAt).toLocaleDateString()}</div>
                    <div><strong>Last Updated:</strong> {new Date(record.updatedAt).toLocaleDateString()}</div>
                </Space>
            </div>
        );
    };

    const fetchSurveys = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                district: appliedFilters.district,
                mandal: appliedFilters.mandal,
                village: appliedFilters.village
            });
            const response = await fetch(
                `http://localhost:5000/api/surveys?${query}`
            );
            if (!response.ok) throw new Error('Failed to fetch surveys');
            const data = await response.json();
            setSurveys(data.surveys || []);
            setTotalPages(data.totalPages || 1);
            setTotals(data.totals || {});
        } catch (error) {
            console.error('Error fetching surveys:', error);
            setSurveys([]);
            setTotalPages(1);
            setTotals({});
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        setPage(1);
        setAppliedFilters(filters);
    };

    const handleReset = () => {
        setFilters({ district: '', mandal: '', village: '' });
        setAppliedFilters({ district: '', mandal: '', village: '' });
        setPage(1);
    };

    return (

        <div className="min-h-screen pt-16">

            <div className="p-6 bg-bg-primary text-text-primary min-h-screen">
                <Card
                    title={
                        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                            <FilterOutlined style={{ marginRight: '8px' }} />
                            Admin Dashboard - Survey Data
                        </Title>
                    }
                    style={{ marginBottom: '24px' }}
                >
                    {/* Filters */}
                    <div className="mb-6">
                        <Space align="end" wrap size="large">

                            <div>
                                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                                    District
                                </label>
                                <Input
                                    name="district"
                                    value={filters.district}
                                    onChange={handleFilterChange}
                                    placeholder="Enter district"
                                    prefix={<SearchOutlined />}
                                    style={{ width: 200 }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                                    Mandal
                                </label>
                                <Input
                                    name="mandal"
                                    value={filters.mandal}
                                    onChange={handleFilterChange}
                                    placeholder="Enter mandal"
                                    prefix={<SearchOutlined />}
                                    style={{ width: 200 }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                                    Village
                                </label>
                                <Input
                                    name="village"
                                    value={filters.village}
                                    onChange={handleFilterChange}
                                    placeholder="Enter village"
                                    prefix={<SearchOutlined />}
                                    style={{ width: 200 }}
                                />
                            </div>

                            <Space>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={handleSearch}
                                    loading={loading}
                                >
                                    Search
                                </Button>

                                <Button onClick={handleReset} disabled={loading}>
                                    Reset
                                </Button>
                            </Space>

                        </Space>
                    </div>

                    {/* Table */}
                    <Table
                        rowKey="surveyId"
                        columns={columns}
                        dataSource={surveys}
                        loading={loading}
                        scroll={{ x: 2000 }}
                        expandable={{
                            expandedRowRender,
                            expandIcon: ({ expanded, onExpand, record }) =>
                                expanded ? (
                                    <MinusOutlined
                                        style={{ fontSize: 14, color: "#1890ff", cursor: "pointer" }}
                                        onClick={e => onExpand(record, e)}
                                    />
                                ) : (
                                    <PlusOutlined
                                        style={{ fontSize: 14, color: "#1890ff", cursor: "pointer" }}
                                        onClick={e => onExpand(record, e)}
                                    />
                                )
                        }}
                        locale={{
                            emptyText: (
                                <Empty
                                    description="No survey data found"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            )
                        }}
                        pagination={{
                            current: page,
                            pageSize: limit,
                            total: totalPages * limit,
                            onChange: (p) => setPage(p),
                            showSizeChanger: false,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} surveys`
                        }}
                        size="middle"
                        bordered
                    />
                    {Object.keys(totals).length > 0 && (
  <Card title="Consumption Totals" style={{ marginTop: 24 }}>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        width: "100%"
      }}
    >

      {Object.entries(totals).map(([item, value]) => {

        const config = itemConfig[item] || {};

        return (
          <Card
            key={item}
            size="small"
            bordered
            style={{
              textAlign: "center",
              borderTop: `4px solid ${config.color || "#1890ff"}`
            }}
          >

            <div style={{ fontSize: 28 }}>
              {config.icon}
            </div>

            <div style={{ fontWeight: 600, marginTop: 6 }}>
              {config.label}
            </div>

            <div style={{ fontSize: 20, color: config.color, fontWeight: 700 }}>
              {value} {config.unit}
            </div>

          </Card>
        );
      })}

    </div>

  </Card>
)}
                </Card>
            </div>
        </div>
    );
};