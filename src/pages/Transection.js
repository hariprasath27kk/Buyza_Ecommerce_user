import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Form, Button } from 'react-bootstrap';
import Navbar from '../Components/Navbar'

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTransactions = async (page, limit) => {
        try {
            const response = await axios.get(`http://localhost:8080/file/transactions?page=${page}&limit=${limit}`);
            console.log("response in pagination=====",response)
            setTransactions(response.data.transactions);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    useEffect(() => {
        fetchTransactions(currentPage,5); 
    }, [currentPage]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePageChange = (page) => {
        console.log("plus");
        setCurrentPage(page);
    };

    const shortenAddress = (address) => {
        const start = address.slice(0, 10);
        const end = address.slice(-9);
        return `${start}......${end}`;
    };

    const filteredTransactions = transactions.filter(transaction =>
        shortenAddress(transaction.from).toLowerCase().includes(searchTerm.toLowerCase())
        // shortenAddress(transaction.to).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <Navbar />
            {/* Search Box */}
            <Form.Group controlId="search">
                <Form.Control
                    type="text"
                    placeholder="Search by From Address"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </Form.Group>

            {/* Table */}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>S.NO</th>
                        <th>Name</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Value</th>
                        <th>Type</th>
                        <th>Hash</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactions.map((transaction, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{transaction.name}</td>
                            <td>{shortenAddress(transaction.from)}</td>
                            <td>{shortenAddress(transaction.to)}</td>
                            <td>{transaction.value}</td>
                            <td>{transaction.type}</td>
                            <td>{shortenAddress(transaction.hash)}</td>
                            <td>{new Date(transaction.updatedAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Pagination Buttons */}
            <div className="pagination">
                <Button variant="outline-primary" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                </Button>
                <span className="mx-2">Page {currentPage} of {totalPages}</span>
                <Button variant="outline-primary" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next
                </Button>
            </div>
        </div>
    );
};

export default Transactions;
