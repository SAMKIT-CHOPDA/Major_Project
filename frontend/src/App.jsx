// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { CartProvider } from './context/CartContext';

// import PrivateRoute             from './components/common/PrivateRoute';
// import { GuestRoute,
//          AdminGuestRoute,
//          AdminRoute }           from './components/common/PrivateRoute';

// import Home          from './pages/customer/Home';
// import Login         from './pages/customer/Login';
// import Register      from './pages/customer/Register';
// import Products      from './pages/customer/Products';
// import ProductDetail from './pages/customer/ProductDetail';
// import Cart          from './pages/customer/Cart';
// import Checkout      from './pages/customer/Checkout';
// import OrderSuccess  from './pages/customer/OrderSuccess';
// import OrderHistory  from './pages/customer/OrderHistory';
// import Profile       from './pages/customer/Profile';
// import About         from './pages/customer/About';
// import Contact       from './pages/customer/Contact';
// import ForgotPassword from './pages/customer/ForgotPassword';
// import ResetPassword  from './pages/customer/ResetPassword';

// import AdminLogin     from './pages/admin/AdminLogin';
// import AdminDashboard from './pages/admin/AdminDashboard';
// import AdminProducts  from './pages/admin/AdminProducts';
// import AdminOrders    from './pages/admin/AdminOrders';
// import AdminUsers     from './pages/admin/AdminUsers';
// import AdminMessages  from './pages/admin/AdminMessages';

// import './styles/globals.css';

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <CartProvider>
//           <Routes>
//             {/* Public routes */}
//             <Route path="/"             element={<Home />} />
//             <Route path="/products"     element={<Products />} />
//             <Route path="/products/:id" element={<ProductDetail />} />
//             <Route path="/about"        element={<About />} />
//             <Route path="/contact"      element={<Contact />} />
//             <Route path="/cart"         element={<Cart />} />

//             {/* Password reset (always public) */}
//             <Route path="/forgot-password" element={<ForgotPassword />} />
//             <Route path="/reset-password"  element={<ResetPassword />} />

//             {/* Guest-only: logged-in customers are redirected to / */}
//             <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
//             <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

//             {/* Customer protected routes */}
//             <Route path="/checkout"      element={<PrivateRoute><Checkout /></PrivateRoute>} />
//             <Route path="/order-success" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
//             <Route path="/orders"        element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
//             <Route path="/profile"       element={<PrivateRoute><Profile /></PrivateRoute>} />

//             {/* Admin guest-only: logged-in admin is redirected to /admin */}
//             <Route path="/admin/login" element={<AdminGuestRoute><AdminLogin /></AdminGuestRoute>} />

//             {/* Admin protected routes */}
//             <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
//             <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
//             <Route path="/admin/orders"   element={<AdminRoute><AdminOrders /></AdminRoute>} />
//             <Route path="/admin/users"    element={<AdminRoute><AdminUsers /></AdminRoute>} />
//             <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />

//             <Route path="*" element={<Navigate to="/" />} />
//           </Routes>
//         </CartProvider>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import PrivateRoute             from './components/common/PrivateRoute';
import { GuestRoute,
         AdminGuestRoute,
         AdminRedirect,
         AdminRoute }           from './components/common/PrivateRoute';

import Home          from './pages/customer/Home';
import Login         from './pages/customer/Login';
import Register      from './pages/customer/Register';
import Products      from './pages/customer/Products';
import ProductDetail from './pages/customer/ProductDetail';
import Cart          from './pages/customer/Cart';
import Checkout      from './pages/customer/Checkout';
import OrderSuccess  from './pages/customer/OrderSuccess';
import OrderHistory  from './pages/customer/OrderHistory';
import Profile       from './pages/customer/Profile';
import About         from './pages/customer/About';
import Contact       from './pages/customer/Contact';
import ForgotPassword from './pages/customer/ForgotPassword';
import ResetPassword  from './pages/customer/ResetPassword';

import AdminLogin     from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts  from './pages/admin/AdminProducts';
import AdminOrders    from './pages/admin/AdminOrders';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminMessages  from './pages/admin/AdminMessages';

import './styles/globals.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/"             element={<AdminRedirect><Home /></AdminRedirect>} />
            <Route path="/products"     element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/about"        element={<About />} />
            <Route path="/contact"      element={<Contact />} />
            <Route path="/cart"         element={<Cart />} />

            {/* Password reset (always public) */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password"  element={<ResetPassword />} />

            {/* Guest-only: logged-in customers are redirected to / */}
            <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* Customer protected routes */}
            <Route path="/checkout"      element={<PrivateRoute><Checkout /></PrivateRoute>} />
            <Route path="/order-success" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
            <Route path="/orders"        element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
            <Route path="/profile"       element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* Admin guest-only: logged-in admin is redirected to /admin */}
            <Route path="/admin/login" element={<AdminGuestRoute><AdminLogin /></AdminGuestRoute>} />

            {/* Admin protected routes */}
            <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/orders"   element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/users"    element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;