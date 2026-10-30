import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../shared/api/client";

const Register = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const payload = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      password: form.elements.password.value,
      password_confirmation: form.elements.password_confirmation.value,
    };

    if (!payload.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setErrorMessage("Enter your name and a valid email address.");
      setIsSubmitting(false);
      return;
    }
    if (payload.password.length < 8) {
      setErrorMessage("Your password must be at least 8 characters.");
      setIsSubmitting(false);
      return;
    }
    if (payload.password !== payload.password_confirmation) {
      setErrorMessage("The password confirmation does not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post("/auth/register", payload);
      navigate("/login", {
        state: { flash: { type: "success", message: "Account created successfully. You can now sign in." } },
      });
    } catch (error) {
      setErrorMessage(
        Object.values(error.response?.data?.errors || {})[0]?.[0]
          || error.response?.data?.message
          || "Unable to create your account right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand"><img className="auth-brand-logo" src="/logo.png" alt="Shopvista" /></Link>
        <p className="eyebrow">JOIN SHOPVISTA</p>
        <h1>Create your account</h1>
        <p className="muted-copy auth-intro">Make a little room for good things.</p>
        <form className="auth-form" noValidate onSubmit={handleSubmit}>
          <label htmlFor="register-name">Full name</label>
          <input id="register-name" name="name" autoComplete="name" />
          <label htmlFor="register-email">Email address</label>
          <input id="register-email" name="email" type="email" autoComplete="email" />
          <label htmlFor="register-password">Password</label>
          <input id="register-password" name="password" type="password" autoComplete="new-password" />
          <label htmlFor="register-password-confirmation">Confirm password</label>
          <input id="register-password-confirmation" name="password_confirmation" type="password" autoComplete="new-password" />
          {errorMessage && <p className="form-notice" role="alert">{errorMessage}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create account"}</button>
        </form>
        <p className="register-prompt">Already have an account? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
};

export default Register;
