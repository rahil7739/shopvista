import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../shared/api/client";

const ForgotPassword = () => {
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice("");
    const email = event.currentTarget.elements.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNotice("Enter a valid email address.");
      setNoticeType("error");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/forgot-password", {
        email,
      });
      setNotice(data.message);
      setNoticeType("success");
    } catch (error) {
      setNotice(error.response?.data?.errors?.email?.[0] || error.response?.data?.message || "Unable to request a password reset right now.");
      setNoticeType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/login" className="auth-brand">
          <img className="auth-brand-logo" src="/logo.png" alt="Shopvista" />
        </Link>
        <p className="eyebrow">ACCOUNT RECOVERY</p>
        <h1>Forgot your password?</h1>
        <p className="muted-copy auth-intro">Enter the email address associated with your account.</p>
        <form className="auth-form" noValidate onSubmit={handleSubmit}>
          <label htmlFor="recovery-email">Email address</label>
          <input id="recovery-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
          {notice && <p className={`form-notice ${noticeType === "success" ? "success" : ""}`} role={noticeType === "success" ? "status" : "alert"}>{notice}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send reset instructions"}</button>
        </form>
        <Link className="back-to-login" to="/login">Back to sign in</Link>
      </section>
    </main>
  );
};

export default ForgotPassword;