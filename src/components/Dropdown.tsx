import {
  FC,
  useState,
  useRef,
  KeyboardEvent,
  useMemo,
  useCallback,
  useEffect,
  RefObject,
  CSSProperties,
} from "react";

export interface Option<T> {
  value: T;
  id: string;
  name: string;
  options?: Options<T>;
}

export type Options<T> = Array<Option<T>>;

export interface Props<T> {
  options: Options<T>;
  onChange: (options: Options<T>) => void;
  placeholder?: string;
  value: Option<T>;
  style?: CSSProperties;
  className?: string;
  tags?: boolean;
  search?: boolean;
  multiple?: boolean;
}

import { useOnClickOutside } from "@/components/util";

export const Dropdown = <T extends unknown>(props: Props<T>): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const listboxId = useMemo(() => `listbox-${Math.random()}`, []);
  const listboxRef = useRef<HTMLOListElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = useCallback(
    (options: Options<T>, searchTerm: string): Options<T> => {
      return options
        .map((option) => {
          if (option?.options) {
            const filteredGroupOptions = filterOptions(
              option.options,
              searchTerm
            );

            return filteredGroupOptions.length > 0
              ? { ...option, options: filteredGroupOptions }
              : null;
          } else {
            return option.name.toLowerCase().includes(searchTerm.toLowerCase())
              ? option
              : null;
          }
        })
        .filter((optionOrGroup) => optionOrGroup !== null) as Options<T>;
    },
    []
  );

  const filteredOptions = useMemo(() => {
    return filterOptions(props.options, searchTerm);
  }, [props.options, searchTerm, filterOptions]);

  useOnClickOutside(dropdownRef, () => {
    setIsOpen(false);
    setIsActive(false);
  });

  const handleSelection = (selectedOption: Option) => {
    let newSelections;
    const isSelected = value.some(
      (option) => option.value === selectedOption.value
    );
    if (isSelected) {
      newSelections = value.filter(
        (option) => option.value !== selectedOption.value
      );
    } else {
      newSelections = [...value, selectedOption];
    }
    onChange(newSelections);
  };

  const isSelected = (option: Option) => {
    return value.some(
      (selectedOption) => selectedOption.value === option.value
    );
  };

  const handleRemoveSelectedOption = (optionToRemove: Option) => {
    const newSelections = value.filter(
      (option) => option.value !== optionToRemove.value
    );
    onChange(newSelections);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      listboxRef.current?.focus();
    }
  };

  const handleGroupSelection = (groupOptions: Options, selected: boolean) => {
    let newSelections;

    const getAllOptions = (options: Options): Option[] => {
      return options.flatMap((option) =>
        "options" in option ? getAllOptions(option.options) : option
      );
    };

    const groupOptionsFlat = getAllOptions(groupOptions);

    if (selected) {
      newSelections = value.filter(
        (option) =>
          !groupOptionsFlat.some(
            (groupOption) => groupOption.value === option.value
          )
      );
    } else {
      const notSelectedGroupOptions = groupOptionsFlat.filter(
        (groupOption) =>
          !value.some((option) => option.value === groupOption.value)
      );
      newSelections = [...value, ...notSelectedGroupOptions];
    }

    onChange(newSelections);
  };

  const isGroupSelected = (groupOptions: Options): boolean => {
    const getAllOptions = (options: Options): Option[] => {
      return options.flatMap((option) =>
        "options" in option ? getAllOptions(option.options) : option
      );
    };

    const groupOptionsFlat = getAllOptions(groupOptions);

    return groupOptionsFlat.every((groupOption) =>
      value.some((option) => option.value === groupOption.value)
    );
  };

  const mapOptions = ({
    options,
    label,
  }: {
    options: Options;
    label: string;
  }) => {
    const allGroupOptionsSelected = options.every(
      (option) =>
        ("options" in option && option.options.length === 0) ||
        value.some((selectedOption) => selectedOption === option)
    );
    return (
      <li className="font-bold px-4 py-2">
        <input
          type="checkbox"
          checked={isGroupSelected(options)}
          readOnly
          className="mr-2"
          onClick={(e) => {
            e.stopPropagation();
            handleGroupSelection(options, isGroupSelected(options));
          }}
        />
        {label}
        <ol className="pl-1">
          {options.map((option) => {
            if ("options" in option) {
              return mapOptions({
                options: option.options,
                label: option.label,
              });
            }
            return (
              <li
                key={option.text}
                onClick={() => handleSelection(option)}
                className={`flex items-center px-4 py-2 hover:bg-gray-200 cursor-pointer list-style-none ${
                  isSelected(option) ? "bg-gray-300" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected(option)}
                  className="mr-2"
                  readOnly
                  onClick={() => handleSelection(option)}
                />
                {option.text}
              </li>
            );
          })}
        </ol>
      </li>
    );
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block ${className}`}
      style={style}
    >
      <div
        tabIndex={0}
        role="combobox"
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        className={`relative bg-white border border-gray-300 rounded-md w-full p-2 ${
          isOpen || isActive
            ? "border-blue-500 ring-2 ring-blue-300 ring-opacity-50"
            : ""
        }`}
      >
        <div className="flex flex-wrap items-center flex-row gap-1">
          {value.map((option) => (
            <Tag
              key={option.text}
              label={option.text}
              remove={() => handleRemoveSelectedOption(option)}
            />
          ))}
          <input
            type="text"
            value={searchTerm}
            readOnly={!search}
            placeholder={value.length === 0 ? placeholder : ""}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-gray-700 flex-grow focus:outline-none"
            onClick={(e) => {
              if (isOpen) {
                e.stopPropagation();
              }
            }}
          />
        </div>
      </div>
      <ol
        id={listboxId}
        ref={listboxRef}
        role="listbox"
        tabIndex={-1}
        className={`absolute left-0 mt-2 py-2 w-64 bg-white rounded shadow-md z-10 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        {mapOptions({ options: filteredOptions, label: "Select All" })}
      </ol>
    </div>
  );
};

export interface TagProps {
  label: string;
  remove: () => void;
}

export const Tag = ({ label, remove }: TagProps) => {
  return (
    <div
      key={label}
      className="flex items-center bg-blue-100 text-blue-600 text-sm rounded px-2 mr-2"
    >
      <span>{label}</span>
      <span
        // tabIndex={-1}
        className="ml-1 text-xs font-semibold"
        onClick={(e) => {
          e.stopPropagation();
          remove();
        }}
      >
        &times;
      </span>
    </div>
  );
};
