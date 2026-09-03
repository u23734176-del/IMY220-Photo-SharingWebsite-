// Login in page
//Tadiwanashe Chigeza u23734276

import { useState } from "react";
import {useNavigate} from "react-router-dom" // use to navigate to HomePage

function Login({ username , setUsername}) {

    const [ password , setPassword ] = useState(""); //password for the Login page 
    const [errorMessage, setErrorMessage] = useState(""); //error messae 
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!username.trim()) {//if username is empty
            setErrorMessage("Please enter the username");
            return;

        }if (username.trim().length < 3) {
            setErrorMessage("Username must be at least 3 characters long.");
            return;
        }else if( !password.trim()){
            setErrorMessage("Please enter the password");
            return;
            
        } else if( password.length < 6){
            setErrorMessage("Password must be 6 characters long");
            return;
        }
        console.log("Username:"+ username);
        console.log("Passwrod:" + password);
        
        navigate("/home"); //go to home page if successful login in  
    }
    return(
            <div>
                <h1>Login into </h1>
                <img src="../assets/logo.png" alt="SnapShare"/>
                <div id="Login-in containter">
                        <form onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor ="username">Username:</label>
                                    <br/>
                                <input type="text" 
                                        id="username" 
                                        value ={username} 
                                        onChange={(event => setUsername(event.target.value))}
                                        placeholder="Please enter the UsernameID"
                                        />
                                </div>

                                <div>
                                    <label htmlFor ="password">Password:</label>
                                    <br/>
                                    <input type={showPassword ? "text" : "password"}
                                            id="password" 
                                            value={password} 
                                            onChange={(event => setPassword(event.target.value))}
                                            placeholder="Please eater your passwword"
                                            />
                                    <br/>
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}>Show Password</button>
                                        {
                                            showPassword ? "Hide password": "Show Password"
                                        }
                                </div>
                                <div>
                                    {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
                                    
                                </div>
                                <button type="submit">Log In</button>
                        </form>
                </div>
            </div>
    )  
}
export default Login;

//Dummy data


