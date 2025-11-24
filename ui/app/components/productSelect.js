// app/components/ProductSelect.js
import CreatableSelect from 'react-select/creatable';


const ProductSelect = ({
  productOptions,
  selectedOption,
  handleProductChangeInSelect,
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
        options={productOptions}
        onChange={handleProductChangeInSelect}
        onInputChange={handleInputChangeSelect}
        isClearable
        isSearchable
        placeholder="Select or type a product..."
        value={selectedOption}
      />
    </div>
  );
};

export default ProductSelect;
