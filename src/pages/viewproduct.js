import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Spinner, Row, Col, Container } from 'react-bootstrap';
import { CartPlus, HeartFill, Heart, StarFill, ArrowLeft } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import Navbar from '../Components/Navbar';
import UseFetchIp from '../Components/IP_Address';
import { socket } from '../socket';
import '../css/viewproduct.css';

const ProductView = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const token = localStorage.getItem('token');
    const [ip, setIp] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchIp = async () => {
            const fetchedIp = await UseFetchIp();
            setIp(fetchedIp);
        };
        fetchIp();
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/product/product/${id}`);
                setProduct(response.data);
            } catch (error) {
                console.error('Error fetching product:', error);
                toast.error('Failed to fetch product details');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        try {
            if (token) {
                await axios.post("http://localhost:8080/cart/addtocart", { product }, { headers: { Authorization: `Bearer ${token}` } });
            } else if (ip) {
                await axios.post("http://localhost:8080/tempcart/addtocart", { ip, product });
            }
            toast.success("Product added to cart!");
            socket.emit('cartUpdated');
            navigate('/cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Error adding product to cart');
        }
    };

    const handleLike = () => {
        setLiked(!liked);
        toast.success(liked ? 'Removed from favorites' : 'Added to favorites');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (!product) {
        return <div className="text-center mt-5">Product not found</div>;
    }

    return (
        <div className="product-view-container">
            <Navbar />
            <Container className="mt-4">
                <Button variant="light" className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft className="me-2" size={20} /> Back to Products
                </Button>
                <Row className="">
                    <Col md={8} lg={6}>
                        <Card className="product-view-card animate__animated animate__fadeIn">
                            <Card.Img
                                variant="top"
                                src={`http://localhost:8080/uploads/${product.imageUrl}`}
                                alt={product.productName}
                                className="product-view-image"
                            />
                            <Card.Body className='viewproduct-cardbody'>
                                <Card.Title className="product-name">{product.productName}</Card.Title>
                                <Card.Text className="product-price">${product.price.toFixed(2)}</Card.Text>
                                <Card.Text className="product-description">{product.description}</Card.Text>
                                <Card.Text className="product-rating">
                                    {Array.from({ length: 5 }, (_, index) => (
                                        <StarFill key={index} className="text-warning me-1" />
                                    ))}
                                    {product.rating || '5.0 Rating'}
                                </Card.Text>
                                <div className="button-group">
                                    <Button onClick={handleAddToCart} className="add-to-cart-btn">
                                        <CartPlus className="me-2" size={20} /> Add to Cart
                                    </Button>
                                    <Button onClick={handleLike} className={`like-btn ${liked ? 'liked' : ''}`}>
                                        {liked ? <HeartFill size={20} /> : <Heart size={20} />}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ProductView;
