import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VerifyAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        alert("Invalid authentication link.");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`https://short-it.litrunner55.workers.dev/auth/${token}`);
        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("authToken", data.token); // Save token for future requests
          navigate("/shorten"); // Redirect to URL shortener page
        } else {
          alert(data.error || "Authentication failed.");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error verifying authentication:", error);
        alert("Server error. Try again.");
        navigate("/login");
      }
    };

    verifyToken();
  }, [navigate]);

  return <h2>Verifying Authentication...</h2>;
};

export default VerifyAuth;
