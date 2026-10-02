import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Route Guards
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// User Pages
import Dashboard from '../pages/user/Dashboard';
import Documents from '../pages/user/Documents';
import UploadDocument from '../pages/user/UploadDocument';
import EditDocument from '../pages/user/EditDocument';
import ViewDocument from '../pages/user/ViewDocument';
import Categories from '../pages/user/Categories';
import SearchDocuments from '../pages/user/SearchDocuments';
import Profile from '../pages/user/Profile';
import ChangePassword from '../pages/user/ChangePassword';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminDocuments from '../pages/admin/Documents';
import AdminCategories from '../pages/admin/Categories';
import AdminReports from '../pages/admin/Reports';

// Error Pages
import NotFound from '../pages/error/NotFound';
import Forbidden from '../pages/error/Forbidden';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/403" element={<Forbidden />} />

      {/* Protected User Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/upload" element={<UploadDocument />} />
          <Route path="/documents/:id" element={<ViewDocument />} />
          <Route path="/documents/:id/edit" element={<EditDocument />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/search" element={<SearchDocuments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/documents" element={<AdminDocuments />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>
      </Route>

      {/* Catch-all Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
