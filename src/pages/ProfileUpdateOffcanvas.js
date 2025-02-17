import React, { useEffect, useState } from 'react';
import { Button, FloatingLabel, Form, Modal, Nav, Offcanvas } from 'react-bootstrap';
import { toast } from 'react-toastify';
import UseWeb3 from '../UseWeb3/UseWeb';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaUserEdit, FaImage, FaTrash, FaSignOutAlt, FaExchangeAlt } from 'react-icons/fa';
import '../css//ProfileUpdateCanvas.css'; // Import custom CSS

const ProfileUpdateCanvas = ({ show, handleClose }) => {
  const [user, setUser] = useState(null);
  const [updateUser, setUpdateUser] = useState({});

  const token = localStorage.getItem('token');
  const { account, tokenBalance, TBMB, symbol } = UseWeb3();

  const [showModel, setShowModel] = useState(false);
  const handleShowModel = () => setShowModel(true);
  const handleCloseModel = () => setShowModel(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:8080/form/getuser', { headers: { Authorization: `Bearer ${token}` } });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUpdateUser({...updateUser, file: file });
    }
  };

  const handleRemoveImage = () => {
    setUpdateUser({ ...updateUser, file: '' });
  };

  const editProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('file', updateUser.file);
      formData.append('name', updateUser.name);
      const response = await axios.post('http://localhost:8080/form/updateuserprofile', formData, { headers: { Authorization: `Bearer ${token}` } });
      setUser(response.data.result);
      toast.success("Profile Updated");
      handleCloseModel();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user profile. Please try again later.');
    }
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    const start = address.slice(0, 10);
    const end = address.slice(-9);
    return `${start}......${end}`;
  };

  const Logout = () => {
    toast.success("Logout Successful");
    localStorage.clear();
    window.location.reload();
  };

  return (
    <>
      <Offcanvas show={show} onHide={handleClose} placement='end' backdrop="static" className="custom-offcanvas">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Profile</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='text-center'>
          <div className="profile-image-container">
            <img src={`http://localhost:8080/uploads/${user?.image}`} alt="Profile" className="profile-image" />
          </div>
          <Button variant="primary" onClick={handleShowModel} className="edit-profile-btn">
            <FaUserEdit className="icon" /> Edit Profile
          </Button>
          <h1 className="username">{user?.username}</h1>
          <Nav.Link href="#link" className='text-primary address-link'>
            <h4>{shortenAddress(account)}</h4>
          </Nav.Link>
          <Nav.Link href="#home" className='text-success balance-link'>
            <h4>{tokenBalance ? (tokenBalance / 1e18).toFixed(4) : 'Loading...'} {symbol}</h4>
          </Nav.Link>
          <Nav.Link href="#home" className='text-danger balance-link'>
            <h4>{TBMB ? (TBMB / 1e18).toFixed(4) : 'Loading...'} BNB</h4>
          </Nav.Link>
          <Link to='/transaction' className='text-decoration-none fs-2 transaction-link'>
            <FaExchangeAlt className="icon" /> Transaction
          </Link><br />
          <Button variant="danger" onClick={Logout} className="logout-btn">
            <FaSignOutAlt className="icon" /> Logout
          </Button>
        </Offcanvas.Body>
      </Offcanvas>

      <Modal show={showModel} onHide={handleCloseModel} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FloatingLabel controlId="floatingTextarea" label="Name" className="mb-3">
            <Form.Control type="text" placeholder="Name" value={updateUser.name} onChange={(e) => setUpdateUser({ ...updateUser, name: e.target.value })} />
          </FloatingLabel>

          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label><FaImage className="icon" /> Upload Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
          </Form.Group>
          {updateUser.file && (
            <div className="image-preview">
              <h4>Preview:</h4>
              <img src={URL.createObjectURL(updateUser.file)} alt="Selected" className="preview-image" />
              <Button variant="danger" size="sm" className='ms-4 remove-btn' onClick={handleRemoveImage}>
                <FaTrash className="icon" /> Remove
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModel}>
            Close
          </Button>
          <Button variant="primary" onClick={editProfile}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProfileUpdateCanvas;