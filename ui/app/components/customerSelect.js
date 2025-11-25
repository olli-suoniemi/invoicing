// app/components/customerSelect.js
import CreatableSelect from 'react-select/creatable';

const CustomerSelect = ({
  customerOptions,
  selectedOption,
  handleCustomerChangeInSelect,
  handleInputChangeSelect,
}) => {
  const selectStyles = {
    // main input
    control: (base) => ({
      ...base,
      minHeight: 44,
      borderRadius: 8,
      borderColor: '#d4d4d8',
      boxShadow: 'none',
      fontSize: 14,              // 👈 font size for main input area
      '&:hover': {
        borderColor: '#a3a3a3',
      },
    }),

    singleValue: (base) => ({
      ...base,
      fontSize: 14,              // 👈 selected value text
    }),

    placeholder: (base) => ({
      ...base,
      fontSize: 14,              // 👈 placeholder text
    }),

    input: (base) => ({
      ...base,
      fontSize: 14,              // 👈 typed text
    }),

    // dropdown menu container
    menu: (base) => ({
      ...base,
      fontSize: 14,              // 👈 dropdown options
      backgroundColor: '#ffffff',
      borderRadius: 8,
      boxShadow:
        '0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)',
      overflow: 'hidden',
    }),

    // actual list area
    menuList: (base) => ({
      ...base,
      fontSize: 14,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: '#ffffff',
    }),

    // each option row
    option: (base, state) => ({
      ...base,
      fontSize: 14,
      cursor: 'pointer',
      backgroundColor: state.isSelected
        ? '#e5e5e5'        // selected
        : state.isFocused
        ? '#f3f3f3'        // hover
        : '#ffffff',       // default
      color: '#111827',
      userSelect: 'none',

      // 🔽 click/active flash color
      ':active': {
        ...base[':active'],
        backgroundColor: '#000000', // black flash on click
        color: '#ffffff',           // keep text readable
      },
    }),
  };
  
  return (
    <div className="w-full">
      <CreatableSelect
        styles={selectStyles}
        className="react-select-container"
        classNamePrefix="react-select"
        autoFocus
        menuPlacement="auto"
        options={customerOptions}
        onChange={handleCustomerChangeInSelect}
        onInputChange={handleInputChangeSelect}
        isClearable
        isSearchable
        placeholder="Select or type a customer..."
        value={selectedOption}
      />
    </div>
  );
};

export default CustomerSelect;
