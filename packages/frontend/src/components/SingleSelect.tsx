import { useState, useRef, useEffect, ReactElement } from 'react';
import styled from 'styled-components';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const SelectButton = styled.button<{ $isOpen: boolean; $compact?: boolean }>`
  width: 100%;
  padding: 8px 12px;
  background: white;
  border: 1px solid ${props => props.$isOpen ? '#4361ee' : '#e2e8f0'};
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: #1a202c;
  font-size: 14px;
  min-height: ${props => props.$compact ? '32px' : '45px'};

  &:hover {
    border-color: #4361ee;
  }
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

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
`;

const SelectedContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface OptionType {
  value: string;
  label: string;
  icon?: ReactElement;
}

interface SingleSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: OptionType[];
  placeholder?: string;
  compact?: boolean;
}

export function SingleSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  compact = false
}: SingleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Container ref={containerRef}>
      <SelectButton
        type="button"
        $isOpen={isOpen}
        $compact={compact}
        onClick={() => setIsOpen(!isOpen)}
      >
        <SelectedContent>
          {selectedOption?.icon && (
            <IconWrapper>
              {selectedOption.icon}
            </IconWrapper>
          )}
          <span>{selectedOption?.label || placeholder}</span>
        </SelectedContent>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </SelectButton>

      <Dropdown $isOpen={isOpen}>
        {options.map((option) => (
          <Option
            key={option.value}
            $isSelected={value === option.value}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
          >
            {option.icon && (
              <IconWrapper>
                {option.icon}
              </IconWrapper>
            )}
            <span>{option.label}</span>
            {value === option.value && <Check size={16} color="#4361ee" style={{ marginLeft: 'auto' }} />}
          </Option>
        ))}
      </Dropdown>
    </Container>
  );
}
