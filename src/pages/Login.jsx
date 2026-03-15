import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Input, Card, Alert, Row, Col, Typography, Divider } from 'antd';
import { 
    UserOutlined, 
    LockOutlined, 
    ShoppingOutlined, 
    ArrowLeftOutlined,
    SafetyCertificateOutlined,
    ThunderboltOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;


const Login = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const floatingVeg = ['🥬', '🍅', '🥕', '🥦', '🧅', '🫑', '🌽', '🥒'];

    // Flow State
    const [mode, setMode] = useState('login'); 
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fpMessage, setFpMessage] = useState('');
    const [fpError, setFpError] = useState('');
    const [fpLoading, setFpLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);

    // Green Team Colors
    const ACCENT_GREEN = '#0c831f'; 

    const onFinish = async (values) => {
        setFpError('');
        setFpLoading(true);
        try {
            const res = await axios.post('/web-auth/login', values);
            if (res.data && res.data.success) {
                const { data } = res.data;
                localStorage.setItem('user', JSON.stringify(data));
                localStorage.setItem('isAuthenticated', 'true');
                navigate('/', { replace: true });
            }
        } catch (err) {
            setFpError(err.response?.data?.message || 'Login failed');
        } finally { setFpLoading(false); }
    };

    const handleSendEmail = async () => {
        if (!email) { setFpError('Please enter your email'); return; }
        setFpError(''); setFpLoading(true);
        try {
            await axios.post('/web-auth/forgot-password', { email });
            setFpMessage('OTP sent to your email');
            setMode('otp');
        } catch (err) { setFpError('Failed to send OTP'); } finally { setFpLoading(false); }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) { setFpError('Enter 6-digit code'); return; }
        setFpError(''); setFpLoading(true);
        try {
            await axios.post('/web-auth/verify-otp', { email, otp });
            setFpMessage('OTP verified'); setMode('reset');
        } catch (err) { setFpError('Invalid OTP'); } finally { setFpLoading(false); }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) { setFpError('Passwords mismatch'); return; }
        setFpError(''); setFpLoading(true);
        try {
            await axios.post('/web-auth/reset-password', { email, otp, newPassword });
            setFpMessage('Success! Login now'); setMode('login');
        } catch (err) { setFpError('Reset failed'); } finally { setFpLoading(false); }
    };

    const handleGoBack = () => {
        setMode(mode === 'otp' ? 'email' : 'login');
        setFpError(''); setFpMessage('');
    };

    useEffect(() => {
        if (localStorage.getItem('isAuthenticated') === 'true') navigate('/', { replace: true });
    }, [navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8faf8',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            position: 'relative', overflow: 'hidden'
        }}>
            {/* Floating Background Elements (From Landing) */}
            {floatingVeg.map((emoji, i) => (
                <div key={i} className="absolute text-5xl opacity-10 pointer-events-none"
                    style={{
                        top: `${Math.random() * 90}%`,
                        left: `${Math.random() * 90}%`,
                        animation: `float-veggie ${4 + Math.random() * 3}s ease-in-out infinite`,
                        position: 'absolute'
                    }}>{emoji}</div>
            ))}

            <div style={{ width: '100%', maxWidth: '1000px', zIndex: 10, padding: '20px' }}>
                <Row gutter={[40, 40]} align="middle" justify="center">
                    
                    {/* Left side - Magic Branding */}
                    <Col xs={0} md={12}>
                        <div style={{ animation: 'fadeInLeft 0.8s ease-out' }}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-bold mb-6">
                                <ThunderboltOutlined /> 15 Min Delivery Magic
                            </div>
                            <h1 style={{ fontSize: '64px', fontWeight: 'bold', color: ACCENT_GREEN, marginBottom: '10px' }}>
                                Fresh Magic
                            </h1>
                            <Title level={2} style={{ marginTop: 0, fontWeight: '600' }}>
                                Partner Portal
                            </Title>
                            <p style={{ color: '#666', fontSize: '18px', maxWidth: '400px' }}>
                                Managing the enchantment of farm-fresh delivery starts here.
                            </p>
                        </div>
                    </Col>

                    {/* Right side - Glass Card Login */}
                    <Col xs={24} md={10}>
                        <Card className="glass-card" style={{ 
                            borderRadius: '24px', 
                            border: '1px solid rgba(12, 131, 31, 0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                            background: 'rgba(255, 255, 255, 0.9)'
                        }}>
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <ShoppingOutlined style={{ fontSize: '40px', color: ACCENT_GREEN, marginBottom: '15px' }} />
                                <Title level={3} style={{ margin: 0 }}>
                                    {mode === 'login' ? 'Partner Sign In' : 'Magic Recovery'}
                                </Title>
                                <Text type="secondary">Authorized HariyaliMart Access Only</Text>
                            </div>

                            {fpMessage && <Alert type="success" message={fpMessage} showIcon style={{ marginBottom: 20 }} />}
                            {fpError && <Alert type="error" message={fpError} showIcon style={{ marginBottom: 20 }} />}

                            <Form form={form} layout="vertical" size="large" onFinish={
                                mode === 'login' ? onFinish : mode === 'email' ? handleSendEmail : 
                                mode === 'otp' ? handleVerifyOtp : handleResetPassword
                            }>
                                {mode === 'login' && (
                                    <>
                                        <Form.Item name="username" rules={[{ required: true }]}>
                                            <Input prefix={<UserOutlined style={{ color: ACCENT_GREEN }} />} placeholder="Username" />
                                        </Form.Item>
                                        <Form.Item name="password" rules={[{ required: true }]}>
                                            <Input.Password prefix={<LockOutlined style={{ color: ACCENT_GREEN }} />} placeholder="Password" />
                                        </Form.Item>
                                        <Button type="primary" htmlType="submit" block loading={fpLoading}
                                            style={{ background: ACCENT_GREEN, borderColor: ACCENT_GREEN, height: '50px', borderRadius: '12px', fontWeight: 'bold' }}>
                                            Login to Hariyali
                                        </Button>
                                        <Button type="link" block onClick={() => setMode('email')} style={{ color: ACCENT_GREEN, marginTop: '10px' }}>
                                            Forgot Credentials?
                                        </Button>
                                    </>
                                )}

                                {mode === 'email' && (
                                    <>
                                        <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                                            <Input placeholder="Enter Registered Email" onChange={(e) => setEmail(e.target.value)} />
                                        </Form.Item>
                                        <Button type="primary" block onClick={handleSendEmail} loading={fpLoading} style={{ background: ACCENT_GREEN, borderRadius: '12px' }}>Send Magic Code</Button>
                                        <Button type="text" block onClick={handleGoBack} style={{ marginTop: 10 }}>Back</Button>
                                    </>
                                )}

                                {mode === 'otp' && (
                                    <>
                                        <Form.Item style={{ textAlign: 'center' }}>
                                            <Input.OTP length={6} onChange={setOtp} />
                                        </Form.Item>
                                        <Button type="primary" block onClick={handleVerifyOtp} loading={fpLoading} style={{ background: ACCENT_GREEN, borderRadius: '12px' }}>Verify Code</Button>
                                        <Button type="text" block onClick={handleGoBack} style={{ marginTop: 10 }}>Back</Button>
                                    </>
                                )}

                                {mode === 'reset' && (
                                    <>
                                        <Form.Item name="newPassword" rules={[{ required: true }]}><Input.Password placeholder="New Password" onChange={(e) => setNewPassword(e.target.value)} /></Form.Item>
                                        <Form.Item name="confirmPassword" rules={[{ required: true }]}><Input.Password placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} /></Form.Item>
                                        <Button type="primary" block onClick={handleResetPassword} loading={fpLoading} style={{ background: ACCENT_GREEN, borderRadius: '12px' }}>Update Password</Button>
                                    </>
                                )}
                            </Form>
                            
                            <Divider>
                                <SafetyCertificateOutlined style={{ color: ACCENT_GREEN }} /> HariyaliMart Security
                            </Divider>
                        </Card>
                    </Col>
                </Row>
            </div>

            <style>{`
                @keyframes float-veggie {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(10deg); }
                }
                @keyframes fadeInLeft {
                    from { opacity: 0; transform: translateX(-40px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .glass-card { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.8) !important; }
            `}</style>
        </div>
    );
};

export default Login;