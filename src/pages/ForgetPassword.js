import axios from 'axios';
import React, { useState } from 'react'
import { Button, Modal } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgetPassword = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email')
    const navigate = useNavigate();
    // const [email1,setEmail1] = useState('');

    const [show, setShow] = useState(false)
    const handleClose = () => { setShow(false) }


    console.log("email", email);

    const [data, setData] = useState({ email: email })
    const [otp,setOtp] =useState('');

    const handelChange = (e) => {
        console.log("dfd");
        const { name, value } = e.target;
        setData({ ...data, [name]: value })
    }

    const verifyEmail =async (email) => {

        console.log("v1");
       await axios.post('http://localhost:8080/form/verifyemail',{email})
        .then(response=>{
            console.log("submit",response.data);
            console.log("verify email method user ",response)
            const otpFormServer = response.data.otp;
            // const emailId = response.data.user.email;
            // setEmail1(emailId);
            setOtp(otpFormServer);
            console.log("otpFormServer",otpFormServer);
            // localStorage.setItem('otp',otp)
            setShow(true)
        }).catch(error=>{
            console.log("error",error);
        })
       
    }

    const submit= ()=>{
        axios.post('http://localhost:8080/form/verifyotp',{otp:otp,email:email})
        .then(response => {
            console.log("OTP verification response:", response.data);
            const user = response.data
            localStorage.setItem('user',user);
            handleClose();
            navigate("/update-password",{state:user})

        })
        .catch(error => {
            console.error("Error verifying OTP:", error);
            toast.error(error.message);
        });
    }


    return (
        <>

            <div className='container w-50 p-5'>ForgotPassword

                <input type="text" name="email" placeholder='enter your email id' value={data.email} onChange={handelChange} />

                <button className='text-center' onClick={()=>verifyEmail(data.email)}>submit</button>

                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title className="w-100 d-flex justify-content-center">
                            <input type="text " placeholder='enter a code' onChange={(e) => setOtp(e.target.value)}
                            />
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="w-100 d-flex justify-content-center">
                        <Button onClick={()=>{submit()}}>
                            Submit
                        </Button>

                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>



            </div>
        </>
    )
}

export default ForgetPassword