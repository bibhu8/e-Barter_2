import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // Optionally, trigger a fetch to load user data with the token here
      navigate("/"); // Redirect to the home page (or dashboard)
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <div>Processing login...</div>;
};

export default AuthHandler;
