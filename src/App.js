import { ToastContainer } from 'react-toastify';
import './App.css';
import Transfer from './pages/Transfer';
import { BrowserRouter, Outlet, Route, Routes, Navigate } from 'react-router-dom';
import Transection from './pages/Transection';
import { Provider } from 'react-redux';
import store from './redux/store';
import Product from './pages/Products';
import Viewproduct from './pages/viewproduct';
import AddtoCart from './pages/AddtoCart';
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import ForgetPassword from './pages/ForgetPassword';
import UpdatePassword from './pages/UpdatePassword';
// import Category from './pages/Category';
// import Products from './pages/Products';


const PrivateRoute = () => {
  const token = localStorage.getItem('token')
  return token ? <Outlet /> : <Navigate to='/' />
}

const PublicRoute = () => {
  const token = localStorage.getItem('token')
  return !token ? <Outlet /> : <Navigate to='/' />
}

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route element={<PrivateRoute />}>
              <Route element={<Transfer />} path='/transfer' />
              <Route element={<Transection />} path='/transaction' />
            </Route>

            <Route element={<PublicRoute />}>
              <Route element={<Login />} path='/login' />
              <Route element={<Register />} path='/register' />
              <Route path="/forgot-password" element={<ForgetPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
            </Route>

            <Route>
              <Route element={<AddtoCart />} path='/cart' />
              <Route element={<Product />} path='/' />
              <Route element={<Viewproduct />} path='/viewproduct/:id' />
              <Route element={<Product />} path='/:category' />
              <Route element={<Product />} path='/:category/:subcategory' />
            </Route>
          </Routes>
        </BrowserRouter>

      </div>
      <ToastContainer />
    </Provider>
  );
}

export default App;
