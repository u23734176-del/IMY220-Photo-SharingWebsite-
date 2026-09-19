// Component mainly for Profile page , to handle Account 

function AccountActions ( {onLogout , onDeleteAccount}){
        return (    
            <div>
                <button type="button" onClick={onLogout}>
                    Log out
                </button>
                <button type="button" onClick={onDeleteAccount}>
                    Delete Account
                </button> 
            </div>
    )
}

export default AccountActions;