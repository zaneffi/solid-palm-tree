import React, { useState, useRef, useEffect, ReactElement } from 'react';
import styled from 'styled-components';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const SelectButton = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  min-height: 45px;
  padding: 8px 16px;
  background: white;
  border: 1px solid ${props => props.$isOpen ? '#4361ee' : '#e2e8f0'};
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: #1a202c;
  font-size: 14px;

  &:hover {
    border-color: #4361ee;
  }
`;

const SelectedTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  margin-right: 8px;
`;

const Tag = styled.span`
  background: #f0f4ff;
  color: #4361ee;
  padding: 2px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
`;

const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
`;

const Option = styled.div<{ $isSelected: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$isSelected ? '#f0f4ff' : 'white'};

  &:hover {
    background: #f0f4ff;
  }
`;

const Checkbox = styled.div<{ $isSelected: boolean }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.$isSelected ? '#4361ee' : '#e2e8f0'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$isSelected ? '#4361ee' : 'white'};
  flex-shrink: 0;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

interface OptionType {
  value: string;
  label: string;
  icon?: ReactElement;
}

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: OptionType[];
  placeholder?: string;
}

export function MultiSelect({ value, onChange, options, placeholder = 'Select options' }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemoveTag = (optionToRemove: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(value.filter(v => v !== optionToRemove));
  };

  return (
    <Container ref={containerRef}>
      <SelectButton
        type="button"
        $isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <SelectedTags>
          {value.length === 0 && <span>{placeholder}</span>}
          {value.map((optionValue) => {
            const option = options.find(opt => opt.value === optionValue);
            return (
              <Tag key={optionValue}>
                {option?.icon && (
                  <IconWrapper>
                    {option.icon}
                  </IconWrapper>
                )}
                {option?.label || optionValue}
                <X
                  size={14}
                  onClick={(e) => handleRemoveTag(optionValue, e)}
                  style={{ cursor: 'pointer' }}
                />
              </Tag>
            );
          })}
        </SelectedTags>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </SelectButton>

      <Dropdown $isOpen={isOpen}>
        {options.map((option) => (
          <Option
            key={option.value}
            $isSelected={value.includes(option.value)}
            onClick={() => handleToggleOption(option.value)}
          >
            <Checkbox $isSelected={value.includes(option.value)}>
              {value.includes(option.value) && <Check size={14} color="white" />}
            </Checkbox>
            {option.icon && (
              <IconWrapper>
                {option.icon}
              </IconWrapper>
            )}
            {option.label}
          </Option>
        ))}
      </Dropdown>
    </Container>
  );
}
