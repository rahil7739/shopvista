import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../shared/api/client";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    const form = event.currentTarget;
    const password = form.elements.password.value;
    if (password.length < 8) {
      setMessage("Your password must be at least 8 characters.");
      setMessageType("error");
      return;
    }
    if (password !== form.elements.password_confirmation.value) {
      setMessage("The password confirmation does not match.");
      setMessageType("error");
      return;
    }
    setIsSubmitting(true);

    try {
      const { data } = await api.post("/auth/reset-password", {
        token: searchParams.get("token"),
        email: searchParams.get("email"),
        password: form.elements.password.value,
        password_confirmation: form.elements.password_confirmation.value,
      });
      setMessage(data.message);
      setMessageType("success");
    } catch (error) {
      setMessage(
        Object.values(error.response?.data?.errors || {})[0]?.[0]
          || error.response?.data?.message
          || "Unable to reset your password.",
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand"><img className="auth-brand-logo" src="/logo.png" alt="Shopvista" /></Link>
        <p className="eyebrow">ACCOUNT RECOVERY</p>
        <h1>Choose a new password</h1>
        <p className="muted-copy auth-intro">Create a new password for your Shopvista account.</p>
        <form className="auth-form" noValidate onSubmit={handleSubmit}>
          <label htmlFor="reset-password">New password</label>
          <input id="reset-password" name="password" type="password" autoComplete="new-password" />
          <label htmlFor="reset-password-confirmation">Confirm new password</label>
          <input id="reset-password-confirmation" name="password_confirmation" type="password" autoComplete="new-password" />
          {message && <p className={`form-notice ${messageType === "success" ? "success" : ""}`} role={messageType === "success" ? "status" : "alert"}>{message}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting || !searchParams.get("token") || !searchParams.get("email")}>{isSubmitting ? "Updating..." : "Update password"}</button>
        </form>
        <Link className="back-to-login" to="/login">Back to sign in</Link>
      </section>
    </main>
  );
};

export default ResetPassword;
