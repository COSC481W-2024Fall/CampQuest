import React, { useEffect, useRef, useState } from 'react'

export default function DropdownCheckbox({ label, options, selected, setSelected }) {
    const dropdownRef = useRef(null);
    const [isOpen , setIsOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleFilterChange = (value, setter) => {
        setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
    };

    return (
        <div className="dropdown-checkbox" ref={dropdownRef}>
            <button className="dropdown-button" onClick={() => setIsOpen(!isOpen)}>
                {label} {selected.length > 0 && `(${selected.length})`}
            </button>
            {isOpen  && (
                <div className="dropdown-menu"  onBlur={() => setIsOpen(!isOpen)} tabIndex={0}>
                    {options.map(option => {
                        const id = `checkbox-${option.code}`;
                        return (
                            <div key={option.code} className="dropdown-item" onClick={() => handleFilterChange(option.code, setSelected)} >
                                <input
                                    type="checkbox"
                                    id={id}
                                    value={option.code}
                                    defaultChecked={selected.includes(option.code)}
                                />
                                <label htmlFor={id}>{option.label}</label>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
