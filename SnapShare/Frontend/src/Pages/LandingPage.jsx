//componenents
import Login from "../components/Login";
import SignIn from "../components/SignIn";

import { useState } from "react";

// How it works componetnt/button
function HowitWorks(){
    const [showImage , setShowImage] = useState(false);
    return(
        <div>
            <button onClick={()=> setShowImage(true)}>How it works?</button>
        
        { showImage && (
            <img
                    
            />
        )}
        </div>
    )
}

function LandingPage() {
    return (
        <div>
            {/* Login Butoons/Sign buttons */}
            <Login/>
            <SignIn/>
            <h1>Store your memories. Share your World</h1>
            <p>Collect every photo & video into secure digital albums, ready to share with friends and family
                -no apps, no hussls, so simple even grandma will use it.
            </p>
        {/* How it works button*/}
            <HowitWorks/>

            <p>Start free . Setup in under 1 minute</p>
        </div>
    );
}

export default LandingPage;