// Editing Filed Componet for Profile page 

function EditableField({
    label ,
    value ,
    fieldName ,
    type = "text" ,
    editingField,
    tempValue ,
    onStartEdit ,
    onSaveEdit,
    onCancel ,
    onChange
}){
    const isEditing = ( editingField == fieldName);

    return (
        <div>
            {label && <p><strong>{label}:</strong> {value}</p>}
            {isEditing ? (
                <div>
                    <input type={type} value={tempValue}  onChange={(e) => onChange(e.target.value)}  placeholder={`Enter new ${fieldName}`}/>
                    <button type="button" onClick={() => onSaveEdit(fieldName)}>Save</button>
                    <button type="button" onClick={onCancel}>Cancel</button>
                </div>
            ):
            (
                <button type="button" onClick={() => onStartEdit(fieldName, type === "password" ? "" : value)}>
                Change {label || fieldName}
                </button>
            )}
        </div>
    );
}

export default EditableField;