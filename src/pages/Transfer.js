import React, {  useState } from 'react';
import Navbar from '../Components/Navbar';
import { Button, Dropdown, Spinner } from 'react-bootstrap';
import UseWeb3 from '../UseWeb3/UseWeb';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdCurrencyExchange } from "react-icons/md";
import axios from 'axios';
// import { useDispatch } from 'react-redux';
// import { setTransection } from '../redux/action';


const Home = () => {
    // const { account } = UseWeb3();
    const [value, setValue] = useState('');
    const [value1, setValue1] = useState('');

    const [amount, setAmount] = useState('');
    const [amount1, setAmount1] = useState('');

    const [loading, setLoading] = useState(false);
    const [loading1, setLoading1] = useState(false);

    const [update, setUpdate] = useState(0);

    const [networkName, setNetworkName] = useState('');

    const { account,contract,web3 } = UseWeb3();

    // const [posts, setPosts] = useState([]);

    // const dispatch = useDispatch();

    const TokenSend = async () => {
        if (value === '' || amount === '') {
            toast.error('Required address and amount');
            return;
        }

        if (!window.ethereum) {
            toast.error('MetaMask not detected. Please install MetaMask extension.');
            return;
        }

        setLoading(true);

        try {
            const to = value;
            await contract.methods.transfer(to, amount * 1e18).send({ from: account }).then((res) => {
                console.log('response transfer ',res)
                if (res) {
                    toast.success('Transaction sent successfully!');
                } else {
                    toast.error('Transaction failed');
                }
            });

        } catch (error) {
            console.error('Error requesting accounts', error);
            toast.error('Error requesting MetaMask account access.');
        }

        setLoading(false);
    };

    const handleSubmit1 = async () => {
        console.log(account, "amount1amount1");
        if (value1 === '' || amount1 === '') {
            toast.error('Required address and amount');
            return;
        }

        if (!window.ethereum) {
            toast.error('MetaMask not detected. Please install MetaMask extension.');
            return;
        }

        setLoading1(true);

        try {

            await web3.eth.sendTransaction({
                from: account,
                to: value1,
                value: web3.utils.toWei(amount1, 'ether')
            }).then(async (res) => {
                console.log(res);

                if (res) {
                    console.log('res', res)
                    const data =
                    {
                        name: networkName,
                        from: account,
                        to: value1,
                        value: web3.utils.toWei(amount1, 'ether'),
                        hash: res.transactionHash,
                        type: "currency",
                    }

                    console.log("before data", data);
                    toast.success('Transaction sent successfully!');
                    const response = await axios.post('http://localhost:8080/file/transection', { data })
                    console.log('response in transection', response);
                    // setPosts(response.data);
                    setUpdate(update + 1)     
                } else {
                    toast.error('Transaction failed');
                }
            });

        } catch (error) {
            console.error('Error requesting accounts', error);
            toast.error('Error requesting MetaMask account access.');
        }

        setLoading1(false);
    };

    const handleNetworkSwitch = async (chainId, networkName) => {

        setNetworkName(networkName);
        console.log('switch method');
        if (!window.ethereum) {
            alert('MetaMask not detected. Please install MetaMask extension.');
            return;
        }
        try {
            console.log(chainId, "chainId");
            const ethereum = window.ethereum;
            const response = await ethereum.request({
                method: 'wallet_switchEthereumChain',
                // params: [{ chainId: chainId }],
                params: [{ chainId: web3.utils.toHex(chainId) }],
            });
            console.log(`Response to switch to ${networkName}: `, response);
            setUpdate(update + 1)

            toast.success(`Switched to ${networkName} network successfully!`);
        } catch (error) {
            console.error(`Error switching to ${networkName} network`, error);
            toast.error(`Failed to switch to ${networkName} network. Please try again.`);
        }
    };


    // useEffect(()=>{
    //     const fetchData =async()=>{
    //         const response = await axios.get("http://localhost:8080/transactions")
    //         setTransection(response.data, dispatch)
    //         console.log("get response",response);
           
    //     }

    //     fetchData();
    // }, [dispatch])

    const hrStyle = {
        border: '1px solid red',
    }; 

    return (
        <>
            <Navbar />
            <div className='d-flex '>
                <div className='container  mt-5 pt-5'>
                    <h3>Token Transfer</h3>
                    <div>
                        <label htmlFor="to">To:</label>
                        <input type="text" id="to" onChange={(e) => setValue(e.target.value)} value={value} placeholder='Enter sending address....' className="form-control" />
                    </div>

                    <div>
                        <label htmlFor="amount">Amount</label>
                        <input type="number" id="amount" onChange={(e) => setAmount(e.target.value)} value={amount} placeholder='Enter Your Amount' className="form-control" />
                    </div>

                    <br />
                    <Button onClick={TokenSend} disabled={loading}>
                        {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Submit'}
                    </Button>
                </div>
                <hr style={hrStyle} />

                <div className='container mt-5 pt-5'>

                    <Dropdown>
                        <Dropdown.Toggle variant="warning" id="dropdown-basic">
                            <MdCurrencyExchange size={30} color="green" /> &nbsp;Currency Transfer
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleNetworkSwitch(97, 'Binance Smart Chain')}>BNB Transfer</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleNetworkSwitch(1, 'Ethereum')}>ETH Transfer</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleNetworkSwitch(11155111, 'Sepolia')}>SEPOLIA Transfer</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <div>
                        <label htmlFor="to">To:</label>
                        <input type="text" id="to" onChange={(e) => setValue1(e.target.value)} value={value1} placeholder='Enter sending address....' className="form-control" />
                    </div>
                    <div>
                        <label htmlFor="amount">Amount</label>
                        <input type="number" id="amount" onChange={(e) => setAmount1(e.target.value)} value={amount1} placeholder='Enter Your Amount' className="form-control" />
                    </div>
                    <br />
                    <Button onClick={handleSubmit1} disabled={loading1}>
                        {loading1 ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Submit'}
                    </Button>
                </div>
            </div>
            <br />

        </>
    );
};

export default Home;
