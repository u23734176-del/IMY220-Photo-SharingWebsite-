// Login in page
//Tadiwanashe Chigeza u23734276

import { useState } from "react";

function Login({ username , setUsername}) {

    const [ password , setPassword ] = useState(""); //password for the Login page 
    const [errorMessage, setErrorMessage] = useState(""); //error messae 
    const [showPassword, setShowPassword] = useState(false);
    
    const handleSubmit = (event) => {
        event.preventDefault();

        if (!username.trim()) {//if username is empty
            setErrorMessage("Please enter both a username");
            return;
        }if( !password.trim()){
            setErrorMessage("Please enter the password");
        }
        console.log("Username:"+ username);
        console.log("Passwrod:" + password);
        
    }
    return(
            <div>
                <h1>Login into </h1>
                <img src="../assets/logo.png"></img>
                <div id="Login-in containter">
                        <form onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor ="username">Username:</label>
                                    <br/>
                                <input type="text" 
                                        id="username" 
                                        value ={username} 
                                        onChange={(event => setUsername(event.target.value))}
                                        placeholder="Please enter the Username"
                                        required = "required"/>
                                </div>

                                <div>
                                    <label htmlFor ="password">Password:</label>
                                    <br/>
                                    <input type={showPassword ? "text" : "password"}
                                            id="password" 
                                            value={password} 
                                            onChange={(event => setPassword(event.target.value))}
                                            placeholder="Please eater your passwword"
                                            required = "required"/>
                                    <br/>
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}>Show Password</button>
                                        {
                                            showPassword ? "Hide password": "Show Password"
                                        }
                                </div>
                                <div>
                                    {errorMessage && <p>{errorMessage}</p>}
                                </div>
                                <button type="submit">Log In</button>
                        </form>
                </div>
            </div>
    )  
}
export default Login;


// Helper functions/componets

