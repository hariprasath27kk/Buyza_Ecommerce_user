import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Card, Row, Col, Spinner } from 'react-bootstrap';
import Navbar from '../Components/Navbar';
import { toast } from 'react-toastify';
import { socket, joinRoom, leaveRoom } from '../socket';
import IpAddress from '../Components/IP_Address';
import { CartPlus, Search, ExclamationCircle, BoxArrowRight, StarFill, Heart, Eye } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/product.css'; // Import the custom CSS file

const Products = () => {
    const { category, subcategory } = useParams();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [noResultsMessage, setNoResultsMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [likedProducts, setLikedProducts] = useState({});
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        const initializeSocket = async () => {
            const ip = await IpAddress();
            if (token) {
                joinRoom(token);
            } else if (ip) {
                joinRoom(ip);
            }
        };

        initializeSocket();

        return () => {
            const cleanupSocket = async () => {
                const ip = await IpAddress();
                if (token) {
                    leaveRoom(token);
                } else if (ip) {
                    leaveRoom(ip);
                }
            };

            cleanupSocket();
            socket.off('cartUpdated');
        };
    }, [token, category, subcategory]);

    useEffect(() => {
        fetchFilterData();
    }, [searchTerm]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let url;
            if (category && subcategory) {
                url = `http://localhost:8080/product/getproducts/${category}/${subcategory}`;
            } else if (category && category !== 'All') {
                url = `http://localhost:8080/product/getproducts/${category}`;
            } else {
                url = 'http://localhost:8080/product/getallproducts';
            }

            const response = await axios.get(url);
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterData = async () => {
        setLoading(true);
        try {
            if (searchTerm.match(" ")) {
                fetchProducts();
                return;
            }

            const response = await axios.get(`http://localhost:8080/product/search/${encodeURIComponent(searchTerm || " ")}`);
            if (response.status === 201) {
                setProducts([]);
                setNoResultsMessage('No products found matching the search criteria');
            } else {
                setProducts(response.data);
                setNoResultsMessage('');
            }
        } catch (error) {
            console.error('Error fetching filtered products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddtoCart = async (product) => {
        try {
            const ip = await IpAddress();

            if (token) {
                const response = await axios.post("http://localhost:8080/cart/addtocart", { product }, { headers: { Authorization: `Bearer ${token}` } });

                if (response) {
                    toast.success("Product added Successfully");
                    socket.emit('cartUpdated');
                    navigate('/cart');
                }
            } else if (ip !== '' && !token) {
                const response = await axios.post("http://localhost:8080/tempcart/addtocart", { ip, product });

                if (response) {
                    toast.success("Product added Successfully");
                    socket.emit('cartUpdated');
                    navigate('/cart');
                }
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const handleLike = (productId) => {
        setLikedProducts(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
        // You can also send a request to the backend to save the like status
    };

    const handleView = (productId) => {
        navigate(`/viewproduct/${productId}`);
    };

    const shortenDescription = (address) => {
        if (!address) return '';
        const start = address.slice(0, 10);
        const end = address.slice(-9);
        return `${start}......${end}`;
    };

    return (
        <div className='bo1'>
            <Navbar />

            <div className="p1">
                <Form className="d-flex align-items-center w-25 ms-5">
                    <Search className="me-2 text-primary" size={20} />
                    <Form.Control
                        type="text"
                        placeholder="Search for products"
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Form>

                {loading && (
                    <div className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <p><BoxArrowRight className="text-primary fa-spin" size={25} /> Fetching products...</p>
                    </div>
                )}

                <Row className="r1">
                    {noResultsMessage ? (
                        <Col xs={12}>
                            <h1 className="text-center w-100">{noResultsMessage}</h1>
                        </Col>
                    ) : (
                        products.map(product => (
                            <Col key={product._id} md={3} lg={3} sm={12} className="product mb-2 mt-2 ms-2">
                                <Card className="product-card animate__animated animate__fadeIn">
                                    <Card.Img className='card-img'  src={`http://localhost:8080/uploads/${product.imageUrl}`} height={"320px"} alt={product.productName} />
                                    <Card.Body>
                                        <Card.Title>{product.productName}</Card.Title>
                                        <Card.Text>Price: ${product.price}</Card.Text>
                                        <Card.Text>Description: {shortenDescription(product.description)}</Card.Text>
                                        <Card.Text>
                                            <StarFill className="text-warning me-1" />
                                            <StarFill className="text-warning me-1" />
                                            <StarFill className="text-warning me-1" />
                                            <StarFill className="text-warning me-1" />
                                            <StarFill className="text-warning me-1" />
                                            {product.rating || '5.0 Rating'}
                                        </Card.Text>
                                        <div className="d-flex justify-content-between">
                                            <Button variant="secondary" onClick={() => handleView(product._id)} className="view-btn">
                                                <Eye className="me-2" size={20} /> View
                                            </Button>
                                            <Button variant="primary" onClick={() => handleAddtoCart(product)} className="add-to-cart-btn">
                                                <CartPlus className="me-2" size={20} /> Add to Cart
                                            </Button>
                                            <Button variant="outline-danger" onClick={() => handleLike(product._id)} className="like-btn">
                                                <Heart className={likedProducts[product._id] ? 'liked' : ''} size={20} />
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>
            </div>
        </div>
    );
};

export default Products;