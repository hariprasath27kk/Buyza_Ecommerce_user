import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaGoogle, FaFacebook, FaGithub } from 'react-icons/fa';
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Button, Form, Container, Row, Col, Card, FloatingLabel } from "react-bootstrap";
import UseFetchIp from "../Components/IP_Address";
import '../css/Login.css';

export const Login = () => {
    const navigate = useNavigate();
    const [ip, setIp] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordValid, setPasswordValid] = useState(true);
    const [emailValid, setEmailValid] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'password') {
            const password = value;
            const re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
            setPasswordValid(re.test(password));
        }

        if (name === 'email') {
            const email = value;
            setEmailValid(
                String(email)
                    .toLowerCase()
                    .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    )
            );
        }
    };

    useEffect(() => {
        fetchIp();
    }, [ip]);

    const fetchIp = async () => {
        const fetchedIp = await UseFetchIp();
        setIp(fetchedIp);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const { email, password } = formData;

        fetch("http://localhost:8080/form/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, roll: "user", ip })
        })
            .then(async (response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    const errorData = await response.json();
                    if (response.status === 400) {
                        throw new Error(errorData.message || 'Bad Request');
                    } else {
                        throw new Error(errorData.message || 'Something went wrong');
                    }
                }
            })
            .then((data) => {
                toast.success("Login Successfully", { autoClose: 2000 });
                localStorage.setItem('token', data.token);
                navigate('/');
            })
            .catch(error => {
                toast.error(error.message, { autoClose: 3000 });
            });
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <Container fluid className="auth-main d-flex justify-content-center align-items-center">
    <Card className="auth-card p-4">
        <Card.Body>
            <h1 className="text-center mb-4">Welcome Back!</h1>
            <Form onSubmit={handleSubmit}>
                {/* Email Field */}
                <FloatingLabel controlId="email" className="mb-3">
                    <div className="auth-input-container">
                        <FaEnvelope className="auth-input-icon" />
                        <Form.Control
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            isInvalid={!emailValid && formData.email !== ''}
                        />
                    </div>
                    {!emailValid && formData.email !== '' && (
                        <Form.Control.Feedback type="invalid">
                            Invalid email format.
                        </Form.Control.Feedback>
                    )}
                </FloatingLabel>

                {/* Password Field */}
                <FloatingLabel controlId="password" className="mb-3">
                    <div className="auth-password-container">
                        <FaLock className="auth-input-icon" />
                        <Form.Control
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!passwordValid && formData.password !== ''}
                        />
                        <span onClick={togglePasswordVisibility} className="auth-eye-icon">
                            {!passwordVisible ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    {!passwordValid && formData.password !== '' && (
                        <Form.Control.Feedback type="invalid">
                            Invalid Password
                        </Form.Control.Feedback>
                    )}
                </FloatingLabel>

                {/* Remember Me & Forgot Password */}
                <Row className="mb-3">
                    <Col>
                    <Form.Check
    type="checkbox"
    id="rememberMe" // Add a unique ID
    label="Remember me"
    className="auth-remember-me"
/>
                    </Col>
                    <Col className="text-end">
                        <Link
                            to={`/forgot-password?email=${encodeURIComponent(formData.email)}`}
                            className="auth-forgot-password-link"
                        >
                            Forgot password?
                        </Link>
                    </Col>
                </Row>

                {/* Login Button */}
                <Button type="submit" variant="primary" className="w-100 mb-3 auth-login-btn">
                    Login
                </Button>

                {/* Social Login Buttons */}
                <div className="auth-social-login text-center mb-3">
                    <p className="mb-2">Or login with:</p>
                    <div className="auth-social-icons">
                        <Button variant="outline-danger" className="auth-social-icon">
                            <FaGoogle />
                        </Button>
                        <Button variant="outline-primary" className="auth-social-icon">
                            <FaFacebook />
                        </Button>
                        <Button variant="outline-dark" className="auth-social-icon">
                            <FaGithub />
                        </Button>
                    </div>
                </div>

                {/* Register Link */}
                <p className="text-center">
                    Don't have an account? <Link to="/register" className="text-decoration-none auth-register-link">Register</Link> for free!
                </p>
            </Form>
        </Card.Body>
    </Card>
</Container>

    );
};