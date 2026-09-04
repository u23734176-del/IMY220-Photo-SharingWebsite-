// Login in page
//Tadiwanashe Chigeza u23734276

// Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login({ username = "", setUsername }) {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const validateForm = (userVal, passVal) => {
    if (!userVal || !userVal.trim()) {
      return "Please enter your username.";
    }
    if (userVal.trim().length < 3) {
      return "Username must be at least 3 characters long.";
    }
    if (!passVal || !passVal.trim()) {
      return "Please enter your password.";
    }
    if (passVal.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    // Run client-side format checks
    const validationError = validateForm(username, password);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      // Handles 400 & 401 errors from server ("Username does not exist" or "Incorrect password")
      if (!response.ok) {
        setErrorMessage(data.error || "Login failed.");
        return;
      }

      // Update global username state on successful authentication
      if (data.user && data.user.username) {
        setUsername(data.user.username);
      }

      setPassword("");
      navigate("/home");
    } catch (error) {
      console.error("Fetch Error:", error);
      setErrorMessage("Server connection error.");
    }
  };

  return (
    <div>
      <h1>Login into SnapShare</h1>
      <img src="../assets/logo.png" alt="SnapShare" />
      <div id="Login-container">
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username:</label>
            <br />
            <input
              type="text"
              id="username"
              value={username || ""}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your Username"
            />
          </div>

          <div>
            <label htmlFor="password">Password:</label>
            <br />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password || ""}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
            <br />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide Password" : "Show Password"}
            </button>
          </div>

          {errorMessage && (
            <div>
              <p style={{ color: "red" }}>{errorMessage}</p>
            </div>
          )}

          <br />
          <button type="submit">Log In</button>
        </form>
      </div>

      <div id="SignUpInstead">
        <p>Don't have an account?</p>
        <Link to="/signUp">
          <button type="button">Get Started</button>
        </Link>
      </div>
    </div>
  );
}

export default Login;