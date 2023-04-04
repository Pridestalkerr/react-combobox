import { useCallback, useMemo } from "react";
import { Option, Options } from "./Combobox.d";

interface Props<T> {
  value: Option<T>[];
  narrow?: boolean;
  cmp: (a: Option<T>, b: Option<T>) => boolean;
  handleChange: (value: Options<T>) => void;
}

export const useStrategy = <T extends unknown>({
  value,
  narrow,
  cmp,
  handleChange,
}: Props<T>) => {
  const isSelectedDefault = useCallback(
    (option: Option<T>): boolean => {
      if (option.options) {
        return option.options.every((option) => isSelectedDefault(option));
      }
      return value.some((item) => cmp(item, option));
    },
    [value, cmp]
  );

  const addOptionDefault = useCallback(
    (option: Option<T>) => {
      let next = [...value];
      const transform = (option: Option<T>) => {
        if (isSelectedDefault(option)) {
          return;
        }
        if (option.options) {
          option.options.forEach(transform);
        } else {
          next.push(option);
        }
      };
      transform(option);
      handleChange(next);
    },
    [isSelectedDefault, handleChange, value]
  );

  const isSelected = useMemo(() => {
    if (narrow) {
      return isSelectedDefault;
    } else {
      return isSelectedDefault;
    }
  }, [isSelectedDefault, narrow]);

  return { isSelected };
};
