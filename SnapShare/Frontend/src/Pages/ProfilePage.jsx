
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Componeents import
import FriendsComponent from '../components/FriendsComponent'; //Friend Componet
import EditableField from '../components/EditableField'; // edit fields componenets
import ProfileHeader from '../components/ProfileHeader'; // Profile Header  componets
import AccountActions from '../components/AccountActions'; //Account actions compoenets


const ACCOUNT_FIELDS = [ 
    {fieldName : "firstname" , label : "First Name"},
    {fieldName : "surname" , label : "Surname"},
    {fieldName : "username" , label: "Username"},
    {fieldName : "email" , label : "Email Address" , type: "email"},
    {fieldName : "pronouns" , label: "Pronouns"},
    { fieldName: "bio" , label: "Bio"}
];



function ProfilePage({ users = [], friendsList = [] }) {
  const navigate = useNavigate();
  const { id } = useParams(); //id from paramaters 
  
  //different states 
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [ prevId , setPrevId] = useState(id);


  //get the respective profile from the Paramaters
  const getProfileData = (userId)=>{
      const currentProfile = users.find((user) => user.id ===  (userId));
      return currentProfile? { ... currentProfile}:{
          id: "Guest",
         username: "Guest",
          firstname: "Guest",
          surname: "User",
          email: "guest@example.com",
          pronouns: "They/Them",
          bio: "You are currently browsing in Guest Mode."
      };
  };

  // set Porfile asa a state
  const [userProfile , setUserProfile] =  useState(()=> getProfileData(id));

  if(id !== prevId){ //update the id ( profile)
      setPrevId(id);
      setUserProfile(getProfileData(id));
  }
  //edit the Account details
  const handleStartEdit = (field, currentValue = "") => {
      setEditingField(field);
      setTempValue(currentValue);
  };
  const handleSaveEdit = (field) => {
      setUserProfile((prev)=>({...prev, [field]: tempValue}))
      setEditingField(null);
      setTempValue("");
  }
  
  //log out or delete account functions
  const handleLogout = () => navigate("/login");
  const handleDeleteAccount = () => alert('Account deletion triggered');

  //render display
  return(
      <div id='main_page'>
        <ProfileHeader user={userProfile}/>
        <FriendsComponent friendsList={friendsList} />

        <section>
            <h3> Account Management</h3>
            <div>
              {ACCOUNT_FIELDS.map(({ fieldName, label, type }) => (
                <EditableField
                     key={fieldName}
                    fieldName={fieldName}
                    label={label}
                    type={type}
                    value={userProfile[fieldName]}
                    editingField={editingField}
                    tempValue={tempValue}
                    onStartEdit={handleStartEdit}
                    onSaveEdit={handleSaveEdit}
                    onCancel={() => setEditingField(null)}
                    onChange={setTempValue}
            />
          ))}
          
            <EditableField
              fieldName="password"
              type="password"
              editingField={editingField}
              tempValue={tempValue}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancel={() => setEditingField(null)}
              onChange={setTempValue}
            />
          
            </div>
        </section>
      
        <AccountActions 
            onLogout={handleLogout} 
            onDeleteAccount={handleDeleteAccount} 
          />
      </div>
  )
}

export default ProfilePage;