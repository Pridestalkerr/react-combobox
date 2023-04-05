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

  const removeOptionDefault = useCallback(
    (option: Option<T>) => {
      let next = [...value];
      const transform = (option: Option<T>) => {
        if (!isSelectedDefault(option)) {
          return;
        }
        if (option.options) {
          option.options.forEach(transform);
        }
        next = next.filter((item) => !cmp(item, option));
      };
      transform(option);
      handleChange(next);
    },
    [isSelectedDefault, handleChange, value, cmp]
  );

  //   const valueLeafs = useMemo(() => {
  //     if (!narrow) {
  //       return value;
  //     } else {
  //       return options.reduce((acc: Options<T>, option) => {
  //         if (option.options) {
  //           acc.push(...getChildren(option.options));
  //         } else {
  //           acc.push(option);
  //         }
  //         return acc;
  //       }, []);
  //     }
  //   }, [value, narrow, options]);

  const addOption = useMemo(() => {
    if (narrow) {
      return addOptionNarrow;
    } else {
      return addOptionDefault;
    }
  }, [addOptionDefault, addOptionNarrow, narrow]);

  const removeOption = useMemo(() => {
    if (narrow) {
      return removeOptionDefault;
    } else {
      return removeOptionDefault;
    }
  }, [removeOptionDefault, narrow]);

  const isSelected = useMemo(() => {
    if (narrow) {
      return isSelectedDefault;
    } else {
      return isSelectedDefault;
    }
  }, [isSelectedDefault, narrow]);

  const selectOption = useCallback(
    (option: Option<T>) => {
      if (isSelected(option)) {
        removeOption(option);
      } else {
        addOption(option);
      }
    },
    [isSelected, addOption, removeOption]
  );

  return { isSelected, selectOption };
};
