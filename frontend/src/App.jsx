import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import AdminRoute from "./components/layout/AdminRoute";
import { sidebarMenu } from "./config/sidebarMenu";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import CategoryList from "./pages/categories/CategoryList";
import Dashboard from "./pages/dashboard/Dashboard";
import Storefront from "./website/pages/Storefront";
import ProductList from "./pages/products/ProductList";
import UserList from "./pages/users/UserList";
import SectionPage from "./pages/SectionPage";
import ProductProvider from "./shared/products/ProductProvider";
import FlashMessages from "./shared/ui/FlashMessages";

function App() {
  const otherSections = sidebarMenu
    .flatMap((group) => group.items)
    .filter((item) => !["/admin/dashboard", "/admin/users", "/admin/products", "/admin/categories"].includes(item.path));

  return (
    <BrowserRouter>
      <ProductProvider>
        <Routes>
          <Route path="/" element={<Storefront />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminRoute><MainLayout /></AdminRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserList />} />
            <Route path="products" element={<ProductList />} />
            <Route path="categories" element={<CategoryList />} />
            {otherSections.map((item) => (
              <Route
                key={item.path}
                path={item.path.slice("/admin/".length)}
                element={<SectionPage title={item.name} />}
              />
            ))}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <FlashMessages />
      </ProductProvider>
    </BrowserRouter>
  );
}

export default App;