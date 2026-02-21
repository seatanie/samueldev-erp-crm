import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';


import ForgetPassword from '@/pages/ForgetPassword';
import ResetPassword from '@/pages/ResetPassword';
// import UserStatsDashboard from '@/components/UserStatsDashboard'; // Solo para admins por URL directa

import { useDispatch } from 'react-redux';

export default function AuthRouter() {
  const dispatch = useDispatch();

  return (
    <Routes>
      <Route element={<Login />} path="/" />
      <Route element={<Login />} path="/login" />

      <Route element={<Navigate to="/login" replace />} path="/logout" />
      <Route element={<ForgetPassword />} path="/forgetpassword" />
      <Route element={<ResetPassword />} path="/reset-password/:token" />
      {/* <Route element={<UserStatsDashboard />} path="/stats" /> */} {/* Solo para admins por URL directa */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
