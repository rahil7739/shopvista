import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";

const FlashMessages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const flash = location.state?.flash;

  useEffect(() => {
    if (!flash) return undefined;

    const timer = window.setTimeout(() => {
      navigate({
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      }, { replace: true, state: null });
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [flash, location.hash, location.pathname, location.search, navigate]);

  if (!flash) return null;

  const Icon = flash.type === "success" ? FaCheckCircle : FaExclamationCircle;

  return (
    <div className={`app-toast ${flash.type}`} role={flash.type === "success" ? "status" : "alert"}>
      <Icon aria-hidden="true" />
      <span>{flash.message}</span>
      <button
        type="button"
        aria-label="Dismiss message"
        onClick={() => navigate({
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
        }, { replace: true, state: null })}
      >
        <FaTimes aria-hidden="true" />
      </button>
    </div>
  );
};

export default FlashMessages;
