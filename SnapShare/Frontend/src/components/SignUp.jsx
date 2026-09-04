// Sign Up page 
// Tadiwanashe Chigeza
import { useState } from "react";
// import {useNavigate} from "react-router-dom" // use to navigate to HomePage

//validation logic
const validateForm = (firstname ,surname ,username , email , password , confirmPassword , pronouns) =>{
    
    const nameRegex = /^[A-Za-z\s-]+$/; //Regex allowing uppercase, lowercase, spaces, and hyphens

    if(!firstname.trim()){//validate firstname
            return "First name is required.";
    }
    if(!nameRegex.test(firstname.trim())){
            return "First name can only contain letters, spaces, or hyphens.";
    }
    if (!surname.trim()) {//validate surname
        return "Surname is required.";
    }
    if (!nameRegex.test(surname.trim())) {
        return "Surname can only contain letters, spaces, or hyphens.";
    }

    if (!username.trim()) { //validate username
        return "Username is required.";
    }
    if (username.trim().length < 3) {
        return "Username must be at least 3 characters long.";

    }if (!email.trim()) { //validate email
        return "Email is required.";
    }
    if (!email.includes("@") || !email.includes(".")) {
        return "Please enter a valid email address.";
    }

    if (!password) { //validate password
        return "Password is required.";
    }
    if (password.length < 6) {
        return "Password must be at least 6 characters long.";
    }
    if (password !== confirmPassword) {
        return "Passwords do not match.";
    }
    if (!pronouns) {
        return "Please select your pronouns.";
    }
    return null;
}

function SignUp({setUsername}){
        const [ firstname , setFirstname] = useState("");
        const [ surname , setSurname] = useState("");
        const [usernameID, setUsernameID] = useState("");
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");
        const [pronouns, setPronouns] = useState("");
        const [showPassword, setShowPassword] = useState(false);
        const [errorMessage, setErrorMessage] = useState("");

        const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage("");

        // validation check
        const validationError = validateForm(
            firstname, 
            surname, 
            usernameID, 
            email, 
            password, 
            confirmPassword
        );
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        // 2. Send user-entered username state to App.jsx
        setUsername(usernameID);
        
        console.log("Username:"+ usernameID);
        console.log("Passwrod:" + password);
    };

    return (
        <div>
            <img src="../assets/logo.png" alt="SnapShare" />
            <h1>Sign Up Account</h1>
            <div id="Sign-up-container">
                <form onSubmit={handleSubmit} noValidate>
                    {/* First Name */}
                    <div id="firstNameInput">
                        <label htmlFor="firstname">First Name:</label>
                        <br />
                        <input
                            type="text"
                            id="firstname"
                            value={firstname}
                            onChange={(event) => setFirstname(event.target.value)}
                            placeholder="Please enter your first name"
                        />
                    </div>

                    {/* Surname */}
                    <div id="surNameInput">
                        <label htmlFor="surname">Surname:</label>
                        <br />
                        <input
                            type="text"
                            id="surname"
                            value={surname}
                            onChange={(event) => setSurname(event.target.value)}
                            placeholder="Please enter your surname"
                        />
                    </div>

                     {/* Pronouns */}
                    <div id="pronounsInput">
                        <label htmlFor="pronouns">Pronouns:</label>
                        <br />

                        <select
                            id="pronouns"
                            value={pronouns}
                            onChange={(event) => setPronouns(event.target.value)}
                        >
                            <option value="">Select your pronouns</option>
                            <option value="he/him">He/Him</option>
                            <option value="she/her">She/Her</option>
                            <option value="they/them">They/Them</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                    </div>
                    

                    {/* Username*/}
                    <div id="usernameInput">
                        <label htmlFor="usernameID">Username:</label>
                        <br />
                        <input
                            type="text"
                            id="usernameID"
                            value={usernameID}
                            onChange={(event) => setUsernameID(event.target.value)}
                            placeholder="Choose a username"
                        />
                    </div>

                    {/* Email */}
                    <div id="emailInput">
                        <label htmlFor="email">Email Address:</label>
                        <br />
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Please enter your email"
                        />
                    </div>

                    {/* Password */}
                    <div id="passwordInput">
                        <label htmlFor="password">Password:</label>
                        <br />
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter password"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div id="confirmPasswordInput">
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <br />
                        <input
                            type={showPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Repeat password"
                        />
                        <br />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "Hide Passwords" : "Show Passwords"}
                        </button>
                    </div>

                    {/* Error display */}
                    {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

                    <br />
                    <button type="submit">Sign Up</button>
                </form>
            </div>
        </div>
    );
}
export default SignUp;


