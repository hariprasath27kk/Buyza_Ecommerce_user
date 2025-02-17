import { useEffect, useState } from 'react';
import Web3 from 'web3';
import ContractAbi from '../ABI/ContractABI.json';

const contractAddress = '0x8CE7720fD183AeC96b676FD8250724b05b0d7a6F'

const UseWeb3 = () => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [tokenBalance, setTokenBalance] = useState(null);
    const [TBMB, setTBMB] = useState(null);
    const [symbol, setSymbol] = useState(null);


    useEffect(() => {
       

        initWeb3();
    }, []);

     const initWeb3 = async () => {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                setWeb3(web3);

                try {
                    const accounts = await web3.eth.getAccounts();
                    setAccount(accounts[0]);
                    // console.log('accounts',accounts)

                    const TBMB1 = await web3.eth.getBalance(accounts[0])
                    // console.log('tbmb',typeof(TBMB1));
                    
                    const TBMB = TBMB1.toString();

                    setTBMB(TBMB);

                    const contract = new web3.eth.Contract(ContractAbi, contractAddress);
                    setContract(contract);
                    const symbol = await contract.methods._symbol().call();
                    setSymbol(symbol);

                    if (accounts[0] && contract) {
                        // console.log('entry if')
                        const balance = await contract.methods.balanceOf(accounts[0]).call();
                        // console.log('balance',balance/(1e18));
                        const newbalance = balance.toString();
                        setTokenBalance(newbalance);
                        // console.log('balance', newbalance);
                    }
                } catch (error) {
                    console.error('Error connecting to MetaMask', error);
                }
            } else {
                console.log('MetaMask not detected');
            }
        };

    return { account, tokenBalance, TBMB, symbol, web3, contract,contractAddress };
};

export default UseWeb3;
