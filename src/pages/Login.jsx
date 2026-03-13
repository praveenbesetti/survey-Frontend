import React, { useState } from "react";
import { Card, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ADMIN_ID = "admin";
const ADMIN_PASSWORD = "admin123";

export const Login = () => {

    const [adminId, setAdminId] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = () => {
        localStorage.setItem("adminToken", "true");

        message.success("Login Successful");

        navigate("/");

    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">

            <Card
                className="shadow-xl rounded-xl"
                style={{ width: 380 }}
                bodyStyle={{ padding: "35px" }}
            >

                <div className="text-center mb-6">

                    <div className="text-4xl mb-2">🌿</div>

                    <Title level={3} style={{ marginBottom: 0 }}>
                        HariyaliMart
                    </Title>

                    <Text type="secondary">
                        Admin Dashboard Login
                    </Text>

                </div>

                <Input
                    placeholder="Admin ID"
                    size="large"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    style={{ marginBottom: 16 }}
                />

                <Input.Password
                    placeholder="Password"
                    size="large"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ marginBottom: 20 }}
                />

                <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleLogin}
                    style={{
                        backgroundColor: "#16a34a",
                        borderColor: "#16a34a"
                    }}
                >
                    Login
                </Button>

            </Card>

        </div>
    );
};