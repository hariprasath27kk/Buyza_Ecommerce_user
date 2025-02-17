import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Nav, NavDropdown, Navbar, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUserCircle, FaHome, FaBox, FaSignInAlt, FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import { socket } from '../socket';
import ProfileUpdateCanvas from '../pages/ProfileUpdateOffcanvas';
import '../css/navbar.css'; // Custom CSS for styling

function BasicExample({ count }) {
    const token = localStorage.getItem('token');
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [subCategories, setSubCategories] = useState([]);
    const [cartLength, setCartLength] = useState(0);
    const [length, setLength] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubCategories();
    }, []);

    useEffect(() => {
        fetchSocket();
    }, []);

    const fetchSocket = () => {
        socket.on('cartUpdated', (data) => {
            console.log("Cart updated event received", data.length);
            setLength(data.length);
        });

        return () => {
            socket.off('cartUpdated');
        };
    };

    useEffect(() => {
        fetchLength();
    }, [count, cartLength]);

    const fetchLength = async () => {
        try {
            const response = await axios.get("http://localhost:8080/cart/getcartstatus", { headers: { Authorization: `Bearer ${token}` } });
            setCartLength(response.data.length);
        } catch (error) {
            console.log("error", error);
        }
    };

    const fetchSubCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/subcategory');
            setSubCategories(response.data);
        } catch (error) {
            console.log("error", error);
        }
    };

    const handleShow = () => setShowOffcanvas(true);
    const handleClose = () => setShowOffcanvas(false);

    const [activeDropdown, setActiveDropdown] = useState(false);

    const handleSelect = (eventKey) => {
        navigate(`/${eventKey}`);
    };

    // Organize subCategories by category
    const categoriesMap = subCategories.reduce((acc, subcat) => {
        const category = subcat.categoryId.Category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(subcat);
        return acc;
    }, {});

    return (
        <>
            <Navbar expand="lg" className="custom-navbar">
                <div className="container-fluid">
                    <Link to="/" className="navbar-brand">
                        <img src="/Asserts/buyza_logo.png" alt="Logo" className="navbar-logo" />
                    </Link>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-toggle" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/" className="nav-link">
                                <FaHome className="nav-icon" /> Home
                            </Nav.Link>
                            <Nav.Link href="/" className="nav-link">
                                <FaBox className="nav-icon" /> All
                            </Nav.Link>
                            <NavDropdown
                                title={
                                    <span>
                                        Categories
                                        {/* <FaChevronDown className="dropdown-icon" /> */}
                                    </span>
                                }
                                id="collasible-nav-dropdown"
                                show={activeDropdown}
                                onToggle={(isOpen) => setActiveDropdown(isOpen)}
                                className="nav-dropdown"
                            >
                                {Object.entries(categoriesMap).map(([category, subcats]) => (
                                    <NavDropdown
                                        key={category}
                                        title={category}
                                        id={`collasible-nav-dropdown-${category}`}
                                        className="dropdown-submenu"
                                    >
                                        {subcats.map((subcat) => (
                                            <NavDropdown.Item
                                                key={subcat._id}
                                                eventKey={`${category}/${subcat.subCategory}`}
                                                className="dropdown-item"
                                                onClick={() => handleSelect(`${category}/${subcat.subCategory}`)}
                                            >
                                                {subcat.subCategory}
                                            </NavDropdown.Item>
                                        ))}
                                    </NavDropdown>
                                ))}
                            </NavDropdown>
                        </Nav>
                        <Nav className="ms-auto d-flex align-items-center">
                            <Nav.Link href="/cart" className="nav-link cart-link">
                                <FaShoppingCart className="cart-icon" />
                                <Badge bg="danger" className="cart-badge">{cartLength}</Badge>
                            </Nav.Link>
                            {token ? (
                                <Nav.Link onClick={handleShow} className="nav-link">
                                    <FaUserCircle size={30} className="user-icon" />
                                </Nav.Link>
                            ) : (
                                <Nav.Link href="/login" className="nav-link">
                                    <Button variant="outline-primary" className="login-button">
                                        <FaSignInAlt className="login-icon" /> Login
                                    </Button>
                                </Nav.Link>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </div>
            </Navbar>
            <ProfileUpdateCanvas show={showOffcanvas} handleClose={handleClose} />
        </>
    );
}

export default BasicExample;