import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../Components/Navbar';
import axios from 'axios';
import { Button, Modal, Spinner, Card, Row, Col, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import UseWeb3 from '../UseWeb3/UseWeb';
import { GoPlusCircle } from "react-icons/go";
import { RiIndeterminateCircleLine } from "react-icons/ri";
import { FaShoppingCart, FaTrash, FaWallet } from "react-icons/fa";
import UseFetchIp from '../Components/IP_Address';
import 'animate.css'; // For animations
import '../css/cart.css'; // Custom CSS for additional styling

const AddtoCart = () => {
    const { account, contract } = UseWeb3();
    const [cartLength, setCartLength] = useState(0);
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState({});
    const token = localStorage.getItem('token');
    const [show, setShow] = useState(false);
    const [ip, setIp] = useState('');
    const [spinner, setSpinner] = useState(false);
    

    const fetchIp = async () => {
        const fetchedIp = await UseFetchIp();
        setIp(fetchedIp);
    };

    const fetchData = useCallback(async () => {
        try {
            if (ip !== '' && !token) {
                const response = await axios.post("http://localhost:8080/tempcart/getcart", { ip });
                setCarts(response.data);
            } else if (token) {
                const response = await axios.get("http://localhost:8080/cart/getcartstatus", { headers: { Authorization: `Bearer ${token}` } });
                setCarts(response.data);
                setCartLength(response.data.length);
            }
        } catch (error) {
            toast.error('Error fetching cart data');
        }
    }, [ip, token]);

    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    
    const openRemoveModal = (cartItemId, productId) => {
        setSelectedItem({ cartItemId, productId });
        setShowRemoveModal(true);
    };
    
    const closeRemoveModal = () => {
        setShowRemoveModal(false);
        setSelectedItem(null);
    };
    
    const confirmRemove = async () => {
        if (!selectedItem) return;
        try {
            const { cartItemId, productId } = selectedItem;
    
            if (ip && !token) {
                await axios.delete(`http://localhost:8080/tempcart/remove/${cartItemId}`, { data: { ip } });
                setCarts(carts.filter(cart => cart._id !== cartItemId));
            } else if (token) {
                const response = await axios.delete(`http://localhost:8080/cart/remove/${cartItemId}`, { headers: { Authorization: `Bearer ${token}` } });
                setCarts(carts.filter(cart => cart._id !== cartItemId));
                setCartLength(response.data.length);
            }
            toast.success('Item removed from cart');
        } catch (err) {
            toast.error('Error removing item from cart');
        }
        closeRemoveModal();
    };
    

    async function convert(n) {
        try {
            var sign = +n < 0 ? "-" : "",
                toStr = n.toString();
            if (!/e/i.test(toStr)) {
                return n;
            }
            var [lead, decimal, pow] = n
                .toString()
                .replace(/^-/, "")
                .replace(/^([0-9]+)(e.*)/, "$1.$2")
                .split(/e|\./);
            return +pow < 0
                ? sign +
                "0." +
                "0".repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) +
                lead +
                decimal
                : sign +
                lead +
                (+pow >= decimal.length
                    ? decimal + "0".repeat(Math.max(+pow - decimal.length || 0, 0))
                    : decimal.slice(0, +pow) + "." + decimal.slice(+pow));
        } catch (err) {
            return 0;
        }
    }    

    const handleBuy = async (id, totalPrice, quantity) => {
        if (!token) {
            return setShow(true);
        }
        try {
            setSpinner(true);
            setLoading(prev => ({ ...prev, [id]: true }));
            if (!window.ethereum) {
                toast.error('MetaMask not detected. Please install MetaMask extension.');
                setLoading(prev => ({ ...prev, [id]: false }));
                return;
            }
            const price = totalPrice * 1e18;
            const amount = await convert(price);
            const to = "0xEdD33D21D52a1127f6425BCb7bC806B98b7c8f22";
            await contract.methods.transfer(to, amount).send({ from: account }).then((res) => {
                if (res) {
                    toast.success('Transaction sent successfully!');
                    axios.put(`http://localhost:8080/cart/updatestatus/${id}`, { status: 'sold', quantity: quantity });
                    fetchData();
                } else {
                    toast.error('Transaction failed');
                }
            });
        } catch (error) {
            toast.error('Payment failed');
        }
        setSpinner(false);
        setLoading(prev => ({ ...prev, [id]: false }));
    };

    const handleQuantityChange = async (id, newQuantity) => {
        try {
            if (ip && !token) {
                const response = await axios.put(`http://localhost:8080/tempcart/update/${ip}`, { quantity: newQuantity, ip });
                setCarts(carts.map(cart => cart._id === id ? response.data : cart));
            } else if (token) {
                const response = await axios.put(`http://localhost:8080/cart/update/${id}`, { quantity: newQuantity }, { headers: { Authorization: `Bearer ${token}` } });
                setCarts(carts.map(cart => cart._id === id ? response.data : cart));
            }
        } catch (err) {
            toast.error('Error updating quantity');
        }
    };

    const increaseQuantity = (id, quantity) => {
        handleQuantityChange(id, quantity + 1);
    };

    const decreaseQuantity = (id, quantity) => {
        if (quantity > 1) {
            handleQuantityChange(id, quantity - 1);
        }
    };

    useEffect(() => {
        fetchIp();
    }, [ip, token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <>
            <Navbar count={cartLength} />
            <div className="container mt-5 animate__animated animate__fadeIn">
                {carts.length !== 0 ? (
                    <h2 className="text-center mb-4">
                        <FaShoppingCart className="me-2" />
                        Your Cart
                    </h2>
                ) : (
                    <div className="text-center">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfh9odvam9gncuRE3NXLiyaR1LTroFm4RRAQ&s"
                            alt="Empty Cart"
                            className="img-fluid mb-3"
                            style={{ maxWidth: '300px' }}
                        />
                        <h2 className="text-center">Your Cart is Empty</h2>
                    </div>
                )}

                <Row>
                    {carts.map(cart => (
                        <Col key={cart._id} lg={3} md={6} className="mb-4">
                            <Card className="h-100 shadow-sm animate__animated animate__zoomIn">
                                <Card.Img
                                    variant="top"
                                    src={`http://localhost:8080/uploads/${cart.imageUrl}`}
                                    alt={cart.productName}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{cart.productName}</Card.Title>
                                    <Card.Text>Price: ${cart.price.toFixed(2)}</Card.Text>
                                    <Card.Text>Total Price: ${cart.totalPrice}</Card.Text>
                                    <Card.Text>{cart.description}</Card.Text>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <RiIndeterminateCircleLine
                                            onClick={() => decreaseQuantity(cart._id, cart.quantity)}
                                            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                                            className="quantity-icon"
                                        />
                                        <Form.Control
                                            type="text"
                                            min="1"
                                            value={cart.quantity}
                                            onChange={(e) => handleQuantityChange(cart._id, parseInt(e.target.value))}
                                            style={{ width: '60px', textAlign: 'center', color: 'black' }}
                                            className="quantity-input"
                                        />
                                        <GoPlusCircle
                                            onClick={() => increaseQuantity(cart._id, cart.quantity)}
                                            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                                            className="quantity-icon"
                                        />
                                    </div>
                                    <div className="d-flex justify-content-between mt-auto">
                                        <Button
                                            variant="danger"
                                            onClick={() => openRemoveModal(cart._id, cart.productId)}
                                        >
                                            <FaTrash className="me-2" />
                                            Remove
                                        </Button>
                                        <Button
                                            variant="success"
                                            onClick={() => handleBuy(cart._id, cart.totalPrice, cart.quantity)}
                                            disabled={loading[cart._id]}
                                        >
                                            {loading[cart._id] ? (
                                                <Spinner as="span" animation="border" size="sm" role="status" />
                                            ) : (
                                                <>
                                                    <FaWallet className="me-2" />
                                                    Buy
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {spinner && (
                    <div className="text-center mt-4">
                        <Spinner animation="border" variant="info" />
                    </div>
                )}
            </div>


            <Modal show={showRemoveModal} onHide={closeRemoveModal} centered>
    <Modal.Header closeButton>
        <Modal.Title>Confirm Removal</Modal.Title>
    </Modal.Header>
    <Modal.Body>Are you sure you want to remove this item from your cart?</Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={closeRemoveModal}>Cancel</Button>
        <Button variant="danger" onClick={confirmRemove}>Remove</Button>
    </Modal.Footer>
</Modal>

            <Modal show={show} onHide={() => setShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Login Required</Modal.Title>
                </Modal.Header>
                <Modal.Body>Please log in to proceed with the purchase.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        Close
                    </Button>
                    <Button variant="primary" href="/login">
                        Login
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AddtoCart;