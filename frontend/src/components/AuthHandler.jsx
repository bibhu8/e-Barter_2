import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    const userId = queryParams.get("userId");
    const fullname = queryParams.get("fullname");
    const email = queryParams.get("email");

    if (token && userId) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      if (fullname) localStorage.setItem("fullname", fullname);
      if (email) localStorage.setItem("email", email);
      // Optionally, store a full user object:
      localStorage.setItem("user", JSON.stringify({ _id: userId, fullname, email }));
      navigate("/"); // Redirect to the home page (or dashboard)
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <div>Processing login...</div>;
};

export default AuthHandler;
