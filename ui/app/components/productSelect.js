// app/components/productSelect.js
'use client';

import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: state.isFocused ? '#000000' : '#d4d4d8',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#000000',
    },
    fontSize: 14,
  }),
  valueContainer: (base) => ({
    ...base,
    paddingInline: 12,
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: 14,
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: 14,
    opacity: 0.7,
  }),
  input: (base) => ({
    ...base,
    fontSize: 14,
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    boxShadow:
      '0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)',
    overflow: 'hidden',
  }),
  menuList: (base) => ({
    ...base,
    paddingTop: 0,
    paddingBottom: 0,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    cursor: 'pointer',
    backgroundColor: state.isSelected
      ? '#e5e5e5'
      : state.isFocused
      ? '#f3f3f3'
      : '#ffffff',
    color: '#111827',
    userSelect: 'none',
    ':active': {
      ...base[':active'],
      backgroundColor: '#000000',
      color: '#ffffff',
    },
  }),
  dropdownIndicator: (base) => ({
    ...base,
    paddingInline: 8,
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  // styles for the portal container
  menuPortal: (base) => ({
    ...base,
    zIndex: 50, // or higher if needed
  }),
};

// your ClearWithEdit from before (unchanged except imports)
const ClearWithEdit = (props) => {
  const { selectProps } = props;

  const handleEditMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectProps.onEdit && selectProps.value) {
      selectProps.onEdit(selectProps.value);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {selectProps.value && selectProps.onEdit && (
        <button
          type="button"
          onMouseDown={handleEditMouseDown}
          title="Edit product"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: '0 4px',
            fontSize: '0.8rem',
          }}
        >
          ✎
        </button>
      )}
      <components.ClearIndicator {...props} />
    </div>
  );
};

export default function ProductSelect({
  options,
  value,
  onChange,
  placeholder = 'Search a product...',
  onEdit,
  isDisabled = false,        // 👈 new prop
}) {
  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    // only runs in browser
    setPortalTarget(document.body);
  }, []);

  return (
    <Select
      className="react-select-container"
      classNamePrefix="react-select"
      styles={selectStyles}
      components={{ ClearIndicator: ClearWithEdit }}
      options={options}
      value={value}
      onChange={onChange}
      isClearable
      isSearchable
      placeholder={placeholder}
      menuPlacement="auto"
      menuPortalTarget={portalTarget}  // 👈 render menu in body, not inside table div
      menuPosition="fixed"             // keeps it aligned when scrolling
      onEdit={onEdit}
      isDisabled={isDisabled}
    />
  );
}
