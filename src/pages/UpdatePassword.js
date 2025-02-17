import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import '../globalComponent/style.css'
// import { togglePasswordVisibility } from '../globalComponent/Helper';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const UpdatePassword = () => {

    const location = useLocation();
    const user = location.state?.user;

    const navigate = useNavigate();

    const [passwordValid, setPasswordValid] = useState(true);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [passwordVisible, setPasswordVisible] = useState({
        password: true,
        confirmpassword: true
    })
    const [data, setData] = useState(
        {
            password: '',
            confirmpassword: ''
        }
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value })
        console.log("name", name);

        if (name === 'password') {
            const password = value
            const re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
            setPasswordValid(re.test(password));
            console.log("p", value);
        }


        if (name === 'confirmpassword') {
            setPasswordMatch(data.password !== data.confirmpassword);
            console.log("cp", value);
            console.log("cp", passwordMatch);
        }
    }

    
    const togglePasswordVisibility = (passwordVisible, setPasswordVisible, type) => {

        console.log(type)
        setPasswordVisible(
            { ...passwordVisible, [type]: !passwordVisible[type] }
        );
        console.log("setPasswordVisible", passwordVisible);
    }



    const changePassword = async () => {
        const { password } = data;
        // alert('1')
        if (!passwordMatch) return
        // alert('2')
        try {
            console.log("user id ", user._id);
            const response = await axios.put('http://localhost:8080/form/updatepassword', { password, userid: user._id })
            console.log(response.data);
            navigate("/login")
        } catch (err) {
            console.log("error", err);
        }
    }
    return (
        <>
            <div className='container p-5'>
                <h3>Change Password</h3>
                <br />
                <div className='password-container'>
                    <input type={passwordVisible.password ? "password" : "text"} name='password' placeholder='New Password' onChange={handleChange} value={data.password} />
                    <span onClick={() => togglePasswordVisibility(passwordVisible, setPasswordVisible, 'password')} className="eye-icon">
                        {passwordVisible.password ? <FaEyeSlash /> : <FaEye />}
                    </span>

                </div>
                {!passwordValid && data.password !== '' && (<div className="error-message">Invalid Password</div>)}

                <div className='password-container'>
                    <input type={passwordVisible.confirmpassword ? "password" : "text"} name='confirmpassword' placeholder='Confirm Password' onChange={handleChange} value={data.confirmpassword} />
                    <span onClick={() => togglePasswordVisibility(passwordVisible, setPasswordVisible, 'confirmpassword')} className="eye-icon">
                        {passwordVisible.confirmpassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                {!passwordMatch && <div className="error-message">Passwords do not match.</div>}
                <br />

                <Button className=' w-100' onClick={changePassword}>Change Password</Button>
            </div>
        </>
    )
}

export default UpdatePassword