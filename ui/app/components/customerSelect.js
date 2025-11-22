// app/components/customerSelect.js
import CreatableSelect from 'react-select/creatable';


const CustomerSelect = ({
  customerOptions,
  selectedOption,
  handleCustomerChangeInSelect,
  handleInputChangeSelect,
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
