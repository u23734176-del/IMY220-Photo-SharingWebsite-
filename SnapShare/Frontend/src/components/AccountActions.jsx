// Component mainly for Profile page , to handle Account 

function AccountActions ( {onLogout , onDeleteAccount}){
        return (    
            <div className="account-actions">
                <button type="button" onClick={onLogout}>
                    Log out
                </button>
                <button type="button" 
                onClick={onDeleteAccount}
                style={{ backgroundColor: "#dc3545", color: "#fff", marginLeft: "10px" }}
                >
                    Delete Account
                </button> 
            </div>
    )
}

export default AccountActions;