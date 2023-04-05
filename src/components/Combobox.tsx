import {
  CSSProperties,
  useRef,
  useState,
  useId,
  useCallback,
  useMemo,
  KeyboardEvent,
  useEffect,
} from "react";
import { Input } from "@/components/Input";
import { Option, Options } from "@/components/Combobox.d";
import { Dropdown } from "./Options";

import { Tag } from "./Tag";

import { useStrategy } from "./strategy";

export interface Props<T> {
  options: Options<T>;
  onChange: (options: Options<T>) => void;
  placeholder?: string;
  value: Options<T>;
  by?: keyof T | ((a: T, z: T) => boolean);
  sort?: true | ((a: T, z: T) => number);
  style?: CSSProperties;
  className?: string;
  tags?: boolean;
  search?: boolean;
  multiple?: boolean;
  narrow?: boolean;
}

export const Combobox = <T extends unknown>({
  options,
  onChange,
  placeholder,
  value,
  by,
  style,
  className,
  tags,
  search,
  multiple,
  sort,
  narrow,
}: Props<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusIndex, setFocusIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const id = useId();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((prev) => {
        const next = prev + 1;
        return next >= flattenedOptions.length ? 0 : next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? flattenedOptions.length - 1 : next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusIndex >= 0) {
        selectOption(flattenedOptions[focusIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const filterOptions = useCallback(
    (options: Options<T>, searchTerm: string): Options<T> => {
      return options.reduce((acc, option) => {
        const matchesSearch = option.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        if (matchesSearch) {
          acc.push(option);
        } else if (option.options) {
          const filteredGroupOptions = filterOptions(
            option.options,
            searchTerm
          );
          if (filteredGroupOptions.length > 0) {
            acc.push({ ...option, options: filteredGroupOptions });
          }
        }

        return acc;
      }, [] as Options<T>);
    },
    []
  );
  const filteredOptions = useMemo(() => {
    return filterOptions(options, searchTerm);
  }, [options, searchTerm, filterOptions]);

  const sortFn = useMemo(() => {
    if (!sort) {
      return undefined;
    } else if (typeof sort === "function") {
      return (a: Option<T>, z: Option<T>) => sort(a.value, z.value);
    } else {
      return (a: Option<T>, z: Option<T>) => a.name.localeCompare(z.name);
    }
  }, [sort]);

  const sortOptions = useCallback(
    (options: Options<T>): Options<T> => {
      const sortedOptions = [...options].sort(sortFn);

      return sortedOptions.map((option) => {
        if (option.options) {
          return {
            ...option,
            options: sortOptions(option.options),
          };
        }
        return option;
      });
    },
    [sortFn]
  );

  const sortedOptions = useMemo(() => {
    if (!sort) {
      return filteredOptions;
    } else {
      return sortOptions(filteredOptions);
    }
  }, [filteredOptions, sort, sortOptions]);

  const flattenOptions = useCallback((options: Options<T>) => {
    const x = options.reduce((acc: Options<T>, option) => {
      acc.push(option);
      if (option.options) {
        acc.push(...flattenOptions(option.options));
      }
      return acc;
    }, []);
    return x;
  }, []);

  const flattenedOptions = useMemo(() => {
    return flattenOptions(sortedOptions);
  }, [sortedOptions, flattenOptions]);

  const cmp = useMemo(() => {
    if (!by) {
      return (a: Option<T>, z: Option<T>) => a.name === z.name;
    } else if (typeof by === "function") {
      return (a: Option<T>, z: Option<T>) => by(a.value, z.value);
    } else {
      return (a: Option<T>, z: Option<T>) => a.value[by] === z.value[by];
    }
  }, [by]);

  const handleChange = useCallback(
    (options: Options<T>) => {
      onChange(options);
    },
    [onChange]
  );

  const { isSelected, selectOption } = useStrategy({
    value,
    narrow,
    cmp,
    handleChange,
  });

  return (
    <div
      tabIndex={0}
      role="combobox"
      aria-haspopup="listbox"
      // aria-owns="combo-listbox"
      aria-controls={`combo-listbox-${id}`}
      aria-expanded={isOpen}
      // aria-controls={id}
      onClick={() => setIsOpen(true)}
      ref={dropdownRef}
      className={`relative inline-block ${className}`}
      style={style}
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-wrap">
        {value.map((option, index) => (
          <Tag key={index} label={option.name} remove={() => {}}></Tag>
        ))}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          ref={inputRef}
          autoComplete="off"
          aria-autocomplete="list"
          aria-activedescendant={
            focusIndex >= 0 ? `option-${id}-${focusIndex}` : undefined
          }
          className="text-gray-700 flex-grow focus:outline-none"
        />
      </div>
      <Dropdown
        id={id}
        options={sortedOptions}
        open={isOpen}
        // by={cmp}
        ref={listRef}
        focusIndex={focusIndex}
        isSelected={isSelected}
        selectOption={selectOption}
      ></Dropdown>
    </div>
  );
};
