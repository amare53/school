import React, { useState, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils';
import { useClickOutside } from '../../hooks';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: Option[];
  value?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  placeholder = 'Sélectionner...',
  label,
  error,
  disabled = false,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useClickOutside(selectRef, () => setIsOpen(false));

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          className={cn(
            'relative w-full bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            disabled && 'bg-gray-50 cursor-not-allowed opacity-50',
            error && 'border-red-300 focus:ring-red-500',
            isOpen && 'ring-2 ring-blue-500 border-transparent'
          )}
          onClick={handleToggle}
          disabled={disabled}
        >
          <span className="block truncate text-sm">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                isOpen && 'transform rotate-180'
              )}
            />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center justify-between',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                  value === option.value && 'bg-blue-50 text-blue-600'
                )}
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export { Select, type Option };