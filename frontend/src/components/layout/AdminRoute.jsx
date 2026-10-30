import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../../shared/api/client";

const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState(() => (
    localStorage.getItem("shopvista-token") ? "loading" : "unauthenticated"
  ));

  useEffect(() => {
    const token = localStorage.getItem("shopvista-token");
    if (!token) return;

    const controller = new AbortController();
    api.get("/auth/user", { signal: controller.signal })
      .then(({ data }) => {
        setStatus(["admin", "super-admin"].includes(data.data.role) ? "authorized" : "forbidden");
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return;
        if (error.response?.status === 401) {
          localStorage.removeItem("shopvista-token");
          setStatus("unauthenticated");
          return;
        }
        setStatus("error");
      });

    return () => controller.abort();
  }, []);

  if (status === "loading") {
    return <div className="admin-route-loading" role="status">Checking your account…</div>;
  }
  if (status === "unauthenticated") return <Navigate to="/login" replace />;
  if (status === "forbidden") return <Navigate to="/" replace />;
  if (status === "error") {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Could not verify your account</h1>
          <p className="muted-copy auth-intro">The server could not be reached. Check the API connection and try again.</p>
          <button className="primary-button" type="button" onClick={() => window.location.reload()}>Try again</button>
        </section>
      </main>
    );
  }

  return children;
};

export default AdminRoute;
