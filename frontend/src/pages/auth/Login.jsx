import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../shared/api/client";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, setNotice] = useState(location.state?.notice || "");
  const [noticeType, setNoticeType] = useState("error");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice("");
    const form = event.currentTarget;
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
      setNotice("Enter a valid email address and your password.");
      setNoticeType("error");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("shopvista-token", data.token);
      navigate(["admin", "super-admin"].includes(data.user.role) ? "/admin/dashboard" : "/", {
        state: { flash: { type: "success", message: "Signed in successfully. Welcome back." } },
      });
    } catch (error) {
      setNotice(error.response?.data?.errors?.email?.[0] || error.response?.data?.message || "Unable to sign in. Please check the server connection.");
      setNoticeType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          <img className="auth-brand-logo" src="/logo.png" alt="Shopvista" />
        </Link>
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Sign in to your account</h1>
        <p className="muted-copy auth-intro">Enter your details to access the store dashboard.</p>
        <form className="auth-form" noValidate onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>
          <input id="login-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
          <label htmlFor="login-password">Password</label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" />
          <div className="auth-options"><label className="remember-option"><input type="checkbox" /> Remember me</label><Link to="/forgot-password">Forgot password?</Link></div>
          {notice && <p className={`form-notice ${noticeType === "success" ? "success" : ""}`} role={noticeType === "success" ? "status" : "alert"}>{notice}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}</button>
        </form>
        <p className="register-prompt">New here? <Link to="/register">Create a customer account</Link></p>
        <p className="auth-footnote">Store administration portal</p>
      </section>
    </main>
  );
};

export default Login;