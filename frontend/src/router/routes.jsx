import { lazy } from 'react';

import { Navigate } from 'react-router-dom';

const Logout = lazy(() => import('@/pages/Logout.jsx'));
const NotFound = lazy(() => import('@/pages/NotFound.jsx'));

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Customer = lazy(() => import('@/pages/Customer'));
const Invoice = lazy(() => import('@/pages/Invoice'));
const InvoiceCreate = lazy(() => import('@/pages/Invoice/InvoiceCreate'));

const InvoiceRead = lazy(() => import('@/pages/Invoice/InvoiceRead'));
const InvoiceUpdate = lazy(() => import('@/pages/Invoice/InvoiceUpdate'));
const InvoiceRecordPayment = lazy(() => import('@/pages/Invoice/InvoiceRecordPayment'));
const Quote = lazy(() => import('@/pages/Quote/index'));
const QuoteCreate = lazy(() => import('@/pages/Quote/QuoteCreate'));
const QuoteRead = lazy(() => import('@/pages/Quote/QuoteRead'));
const QuoteUpdate = lazy(() => import('@/pages/Quote/QuoteUpdate'));
const Payment = lazy(() => import('@/pages/Payment/index'));
const PaymentRead = lazy(() => import('@/pages/Payment/PaymentRead'));
const PaymentUpdate = lazy(() => import('@/pages/Payment/PaymentUpdate'));

const Settings = lazy(() => import('@/pages/Settings/Settings'));
const PaymentMode = lazy(() => import('@/pages/PaymentMode'));
const Taxes = lazy(() => import('@/pages/Taxes'));
const Admin = lazy(() => import('@/pages/Admin'));
const Reports = lazy(() => import('@/modules/ReportsModule'));

const ProductCategories = lazy(() => import('@/pages/ProductCategory'));
const Products = lazy(() => import('@/pages/Product'));
const Orders = lazy(() => import('@/pages/Order'));


const Profile = lazy(() => import('@/pages/Profile'));

const About = lazy(() => import('@/pages/About'));

// Páginas de Inventario
const Inventory = lazy(() => import('@/pages/Inventory'));
const InventoryDashboard = lazy(() => import('@/pages/Inventory/Dashboard'));
const InventoryMovements = lazy(() => import('@/pages/Inventory/Movements'));
const Warehouse = lazy(() => import('@/pages/Warehouse'));

let routes = {
  expense: [],
  default: [
    {
      path: '/login',
      element: <Navigate to="/" />,
    },
    {
      path: '/logout',
      element: <Logout />,
    },
    {
      path: '/about',
      element: <About />,
    },
    {
      path: '/',
      element: <Dashboard />,
    },
    {
      path: '/customer',
      element: <Customer />,
    },

    {
      path: '/invoice',
      element: <Invoice />,
    },
    {
      path: '/invoice/create',
      element: <InvoiceCreate />,
    },
    {
      path: '/invoice/read/:id',
      element: <InvoiceRead />,
    },
    {
      path: '/invoice/update/:id',
      element: <InvoiceUpdate />,
    },
    {
      path: '/invoice/record-payment/:id',
      element: <InvoiceRecordPayment />,
    },
    {
      path: '/quote',
      element: <Quote />,
    },
    {
      path: '/quote/create',
      element: <QuoteCreate />,
    },
    {
      path: '/quote/read/:id',
      element: <QuoteRead />,
    },
    {
      path: '/quote/update/:id',
      element: <QuoteUpdate />,
    },
    {
      path: '/payment',
      element: <Payment />,
    },
    {
      path: '/payment/read/:id',
      element: <PaymentRead />,
    },
    {
      path: '/payment/update/:id',
      element: <PaymentUpdate />,
    },
    {
      path: '/payment/mode',
      element: <PaymentMode />,
    },
    {
      path: '/taxes',
      element: <Taxes />,
    },
    {
      path: '/admin',
      element: <Admin />,
    },
    {
      path: '/reports',
      element: <Reports />,
    },
    {
      path: '/product-categories',
      element: <ProductCategories />,
    },
    {
      path: '/products',
      element: <Products />,
    },
    {
      path: '/orders',
      element: <Orders />,
    },

    {
      path: '/settings',
      element: <Settings />,
    },
    {
      path: '/profile',
      element: <Profile />,
    },
    {
      path: '/inventory',
      element: <Inventory />,
    },
    {
      path: '/inventory/dashboard',
      element: <InventoryDashboard />,
    },
    {
      path: '/inventory/movements',
      element: <InventoryMovements />,
    },
    {
      path: '/warehouses',
      element: <Warehouse />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ],
};

export { routes };
export default routes;
