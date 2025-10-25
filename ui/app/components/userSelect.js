import CreatableSelect from 'react-select/creatable';

const UserSelect = ({
  userOptions,
  handleUserChangeInSelect,
  selectedOption,
  handleInputChangeSelect
}) => { 

  return (
    <div className="w-full">

      <CreatableSelect
        className="react-select-container"
        classNamePrefix="react-select"
        autoFocus
        styles={{
          control: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: 'transparent',
            borderRadius: '100px',
          }),
        }}
        menuPlacement="auto"
        options={userOptions}
        onChange={handleUserChangeInSelect}
        onInputChange={handleInputChangeSelect}
        isClearable
        isSearchable
        placeholder="Select or type a user..."
        value={selectedOption}
      />
    </div>
  );
};

export default UserSelect;