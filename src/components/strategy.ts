import { BlobOptions } from "buffer";
import { useCallback, useMemo } from "react";
import { Option, Options } from "./Combobox.d";

interface Props<T> {
  value: Options<T>;
  options: Options<T>;
  narrow?: boolean;
  cmp: (a: Option<T>, b: Option<T>) => boolean;
  handleChange: (value: Options<T>) => void;
}

export const useStrategy = <T extends unknown>({
  value,
  options,
  narrow,
  cmp,
  handleChange,
}: Props<T>) => {
  const getLeafs = useCallback((options: Options<T>) => {
    return options.reduce((acc: Options<T>, option) => {
      if (option.options) {
        acc.push(...getLeafs(option.options));
      } else {
        acc.push(option);
      }
      return acc;
    }, []);
  }, []);

  const isSelected_ = useCallback(
    (option: Option<T>, selected: Options<T> = value): boolean => {
      if (option.options) {
        return option.options.every((option) => isSelected_(option, selected));
      }
      return selected.some((item) => cmp(item, option));
    },
    [value, cmp]
  );

  const isSelected = useMemo(() => {
    if (narrow) {
      return (option: Option<T>) => {
        const leafs = getLeafs(value);
        return isSelected_(option, leafs);
      };
    } else {
      return isSelected_;
    }
  }, [isSelected_, getLeafs, narrow, value]);

  const addOption_ = useCallback(
    (option: Option<T>, selected: Options<T> = value) => {
      let next = [...selected];
      const transform = (option: Option<T>) => {
        if (isSelected(option, selected)) {
          return;
        }
        if (option.options) {
          option.options.forEach(transform);
        } else {
          next.push(option);
        }
      };
      transform(option);
      return next;
    },
    [isSelected, value]
  );

  const removeOption_ = useCallback(
    (option: Option<T>, selected: Options<T> = value) => {
      let next = [...selected];
      const transform = (option: Option<T>) => {
        if (!isSelected(option)) {
          return;
        }
        if (option.options) {
          option.options.forEach(transform);
        }
        next = next.filter((item) => !cmp(item, option));
      };
      transform(option);
      return next;
    },
    [isSelected, cmp, value]
  );

  const narrowSelected = useCallback(
    (selected: Options<T>) => {
      const transform = (options: Options<T>): Options<T> => {
        return options.flatMap((option) => {
          if (isSelected_(option, selected)) {
            return [option];
          }
          if (option.options) {
            return transform(option.options);
          }
          return [];
        });
      };
      return transform(options);
    },
    [options, isSelected_]
  );

  const addOption = useMemo(() => {
    if (narrow) {
      return (option: Option<T>) => {
        const leafs = getLeafs(value);
        const next = addOption_(option, leafs);
        const narrowed = narrowSelected(next);
        handleChange(narrowed);
      };
    } else {
      return addOption_;
    }
  }, [addOption_, handleChange, narrowSelected, getLeafs, narrow, value]);

  const removeOption = useMemo(() => {
    if (narrow) {
      return (option: Option<T>) => {
        const leafs = getLeafs(value);
        const next = removeOption_(option, leafs);
        const narrowed = narrowSelected(next);
        handleChange(narrowed);
      };
    } else {
      return removeOption_;
    }
  }, [removeOption_, handleChange, narrowSelected, getLeafs, narrow, value]);

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
