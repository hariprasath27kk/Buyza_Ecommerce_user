import React, { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaGlobe, FaVenusMars } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Form, Container, Row, Col, Card, FloatingLabel } from 'react-bootstrap';
import countryList from 'country-list';
import '../css/Login.css'; // Reuse the same CSS file

export const Register = () => {
    const navigate = useNavigate();
    const [passwordVisible1, setPasswordVisible1] = useState(false);
    const [passwordVisible2, setPasswordVisible2] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: false,
        country: '',
        gender: ''
    });
    const [usernameValid, setUserNameValid] = useState(true);
    const [emailValid, setEmailValid] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [ip, setIp] = useState('');

    useEffect(() => {
        const fetchIp = async () => {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                setIp(data.ip);
            } catch (error) {
                console.error('Error fetching the IP address', error);
            }
        };

        fetchIp();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'name') {
            setUserNameValid(validateUserName(value));
        }

        if (name === 'email') {
            setEmailValid(validateEmail(value));
        }

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        if (name === 'password') {
            validatePassword(value);
        }
    };

    const validateUserName = (username) => {
        return username.trim() !== '' && username.length >= 3;
    };

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const validatePassword = (password) => {
        const re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        setPasswordValid(re.test(password));
    };

    const handleChange1 = (e) => {
        const { name, value } = e.target;

        setFormData((prevFormData) => {
            const updatedFormData = {
                ...prevFormData,
                [name]: value
            };

            if (name === 'confirmPassword' || name === 'password') {
                setPasswordMatch(updatedFormData.password === updatedFormData.confirmPassword);
            }

            return updatedFormData;
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!passwordValid || !passwordMatch || !emailValid || !usernameValid) {
            toast.error('Please fix the errors before submitting.');
            return;
        }

        const data = {
            username: formData.name.trim(),
            email: formData.email,
            password: formData.password,
            country: formData.country,
            gender: formData.gender,
            roll: 'user',
            ip: ip
        };

        fetch('http://localhost:8080/form/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(async (response) => {
                if (response.ok) {
                    toast.success('Signup successful, Please Login!', { autoClose: 2000 });
                    navigate('/login');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Something went wrong');
                }
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

    const togglePasswordVisibility1 = () => {
        setPasswordVisible1(!passwordVisible1);
    };

    const togglePasswordVisibility2 = () => {
        setPasswordVisible2(!passwordVisible2);
    };

    return (
        <Container fluid className="auth-main d-flex justify-content-center align-items-center">
            <Card className="auth-card p-4">
                <Card.Body>
                    <h1 className="text-center mb-4">Create an Account</h1>
                    <Form onSubmit={handleSubmit}>
                        {/* Username Field */}
                        <FloatingLabel controlId="name" className="mb-3">
                            <div className="auth-input-container">
                                <FaUser className="auth-input-icon" />
                                <Form.Control
                                    type="text"
                                    name="name"
                                    placeholder="Username"
                                    value={formData.name}
                                    onChange={handleChange}
                                    isInvalid={!usernameValid && formData.name !== ''}
                                />
                            </div>
                            {!usernameValid && formData.name !== '' && (
                                <Form.Control.Feedback type="invalid">
                                    Username must be at least 3 characters long.
                                </Form.Control.Feedback>
                            )}
                        </FloatingLabel>

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
                                    type={passwordVisible1 ? "text" : "password"}
                                    placeholder="Password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    isInvalid={!passwordValid && formData.password !== ''}
                                />
                                <span onClick={togglePasswordVisibility1} className="auth-eye-icon">
                                    {!passwordVisible1 ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            {!passwordValid && formData.password !== '' && (
                                <Form.Control.Feedback type="invalid">
                                    Password must be at least 8 characters long, contain a number, a special character, and both uppercase and lowercase letters.
                                </Form.Control.Feedback>
                            )}
                        </FloatingLabel>

                        {/* Confirm Password Field */}
                        <FloatingLabel controlId="confirmPassword" className="mb-3">
                            <div className="auth-password-container">
                                <FaLock className="auth-input-icon" />
                                <Form.Control
                                    type={passwordVisible2 ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange1}
                                    isInvalid={!passwordMatch && formData.confirmPassword !== ''}
                                />
                                <span onClick={togglePasswordVisibility2} className="auth-eye-icon">
                                    {!passwordVisible2 ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            {!passwordMatch && formData.confirmPassword !== '' && (
                                <Form.Control.Feedback type="invalid">
                                    Passwords do not match.
                                </Form.Control.Feedback>
                            )}
                        </FloatingLabel>

                        {/* Country Field */}
                        <FloatingLabel controlId="country" className="mb-3">
    <div className="auth-input-container">
        <FaGlobe className="auth-input-icon" />
        <Form.Select
            name="country"
            value={formData.country}
            onChange={handleChange}
            style={{ paddingLeft: '40px' }} // Add padding to move text to the right
        >
            <option value="">Select Country</option>
            {countryList.getData().map((country) => (
                <option key={country.code} value={country.name}>
                    {country.name}
                </option>
            ))}
        </Form.Select>
    </div>
</FloatingLabel>

                        {/* Gender Field */}
                        <FloatingLabel controlId="gender" className="mb-3">
    <div className="auth-input-container d-flex align-items-center">
        {/* Gender Icon */}
        <FaVenusMars className="auth-gender-icon me-3" /> {/* Icon with right margin */}

        {/* Radio Buttons */}
        <div className="d-flex gap-3">
            <Form.Check
                type="radio"
                id="male"
                label="Male"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleChange}
                inline
            />
            <Form.Check
                type="radio"
                id="female"
                label="Female"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleChange}
                inline
            />
        </div>
    </div>
</FloatingLabel>

                        {/* Terms and Conditions */}
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="I agree to the Terms and Conditions"
                                name="terms"
                                checked={formData.terms}
                                onChange={handleChange}
                                isInvalid={!formData.terms}
                            />
                        </Form.Group>

                        {/* Register Button */}
                        <Button type="submit" variant="primary" className="w-100 mb-3 auth-login-btn">
                            Register
                        </Button>

                        {/* Login Link */}
                        <p className="text-center">
                            Already have an account?{' '}
                            <Link to="/login" className="text-decoration-none auth-register-link">
                                Login now!
                            </Link>
                        </p>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Register;