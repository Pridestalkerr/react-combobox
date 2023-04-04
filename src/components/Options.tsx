import { Option as Option_T, Options } from "@/components/Combobox.d";
import { Option } from "@/components/Option";
import { useCallback, useMemo, RefObject, useEffect } from "react";

interface Props<T> {
  id: string;
  options: Options<T>;
  open: boolean;
  by?: (a: Option_T<T>, z: Option_T<T>) => boolean;
  ref: RefObject<HTMLUListElement>;
  focusIndex: number;
  isSelected: (option: Option_T<T>) => boolean;
  selectOption: (option: Option_T<T>) => void;
}

export const Dropdown = <T extends unknown>({
  id,
  options,
  open,
  by,
  ref,
  focusIndex,
  isSelected,
  selectOption,
}: Props<T>) => {
  const mapOptions = useCallback(
    (options: Options<T>) => {
      let counter = 0;

      const mapper = (options: Options<T>) => {
        return options.map((option) => {
          return (
            <Option
              key={`option-${id}-${counter}`}
              id={`option-${id}-${counter}`}
              selected={isSelected(option)}
              focused={focusIndex === counter++}
              onClick={() => selectOption(option)}
              label={option.name}
            >
              {option.options && (
                <ul className="pl-2">{mapper(option.options)}</ul>
              )}
            </Option>
          );
        });
      };

      return mapper(options);
    },
    [focusIndex, id, isSelected, selectOption]
  );

  const Options = useMemo(() => {
    return mapOptions(options);
  }, [options, mapOptions]);

  return (
    <ul
      id={id}
      ref={ref}
      role="listbox"
      tabIndex={-1}
      className={`absolute left-0 mt-2 py-2 w-64 bg-white rounded shadow-md z-10 ${
        open ? "block" : "hidden"
      }`}
    >
      {Options}
    </ul>
  );
};
