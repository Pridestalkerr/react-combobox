import { useCallback, useState, useMemo, useRef, Fragment, FC } from "react";
import { Combobox, Transition } from "@headlessui/react";

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
  value: Options<T>;
  narrow: Options<T>;
  onNarrow: (options: Options<T>) => void;
}

export const HeadlessDropdown = <T extends unknown>(
  props: Props<T>
): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState("");
  const divRef = useRef<HTMLDivElement>(null);

  const handleChange = (selectedOptions: Options<T>) => {
    // we need to handle a few cases
    // we iterate the array,
    // if the element is a "parent" then we have to add all the children, recursively
    // if the element is not a parent, it stays there,
    // if all the elements of a parent are selected. we add the parent as well
    // if the element is a parent and it is not selected, we remove all the children
  };

  // const handleChange = (selectedOptions: Options<T>) => {
  //   const narrowArrayRecursively = (options: Options<T>): Options<T> => {
  //     const resultMap = new Map<string, Option<T>>();

  //     // Add all elements to the map, using their id as the key
  //     for (const item of selectedOptions) {
  //       resultMap.set(item.id, item);
  //     }

  //     function checkSubOptions(item: Option<T>): boolean {
  //       if (!item.options) {
  //         return false;
  //       }

  //       let allSubOptionsPresent = true;

  //       for (const subOption of item.options) {
  //         if (!resultMap.has(subOption.id) || checkSubOptions(subOption)) {
  //           allSubOptionsPresent = false;
  //           break;
  //         }
  //       }

  //       if (allSubOptionsPresent) {
  //         for (const subOption of item.options) {
  //           resultMap.delete(subOption.id);
  //         }
  //         resultMap.set(item.id, { ...item, options: undefined });
  //       }

  //       return allSubOptionsPresent;
  //     }

  //     // Recursively check if an item has sub-options and if all of them are in the map
  //     for (const item of options) {
  //       checkSubOptions(item);
  //     }

  //     // Check for missing main elements with all sub-options present
  //     for (const item of options) {
  //       if (item.options && !resultMap.has(item.id)) {
  //         if (checkSubOptions(item)) {
  //           resultMap.set(item.id, { ...item, options: undefined });
  //         }
  //       }
  //     }

  //     // Convert the map back to an array
  //     return Array.from(resultMap.values());
  //   };
  //   console.log(narrowArrayRecursively(props.options));
  //   props.onChange(narrowArrayRecursively(props.options));
  // };

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

  const flattenOptions = (options: Options<T>): Option<T>[] => {
    const flattened = options.flatMap((item) => {
      const { options: subOptions, ...itemWithoutOptions } = item;
      const flattenedSubOptions = subOptions ? flattenOptions(subOptions) : [];
      return subOptions
        ? flattenedSubOptions
        : [itemWithoutOptions, ...flattenedSubOptions];
    });

    return flattened;
  };

  const isGroupSelected = (group: Option<T>) => {
    return flattenOptions(group.options).every((option) =>
      props.value.some((selectedOption) => selectedOption.id === option.id)
    );
  };

  const handleGroupSelection = (group: Option<T>, isSelected: boolean) => {
    const addUniqueOptions = (
      set: Set<Option<T>>,
      options: Option<T>[]
    ): Set<Option<T>> => {
      for (const option of options) {
        if (
          !Array.from(set).some(
            (existingOption) => existingOption.id === option.id
          )
        ) {
          set.add(option);
        }
      }
      return set;
    };

    console.log("flatten: ", flattenOptions(group.options));
    console.log("value: ", props.value);

    const newOptions = isSelected
      ? props.value.filter(
          (option) =>
            !flattenOptions(group.options).some((e) => e.id === option.id)
        )
      : Array.from(
          addUniqueOptions(new Set(props.value), flattenOptions(group.options))
        );

    props.onChange(newOptions);
  };

  const narrowSelected = useCallback(
    (selected: Options<T>, options: Options<T>) => {
      let narrowed = [];

      const narrow = (options: Options<T>) => {
        options.forEach((option) => {
          if (option.options) {
            if (isGroupSelected(option)) {
              narrowed.push(option);
            } else {
              narrow(option.options);
            }
          } else {
            if (
              selected.some((selectedOption) => selectedOption.id === option.id)
            ) {
              narrowed.push(option);
            }
          }
        });
      };

      narrow(options);
      return narrowed;
    },
    [isGroupSelected]
  );

  const narrowedSelected = useMemo(() => {
    return narrowSelected(props.value, props.options);
  }, [props.value, props.options, narrowSelected]);

  const filteredOptions = useMemo(() => {
    return filterOptions(props.options, searchTerm);
  }, [props.options, searchTerm, filterOptions]);

  const isSelected = (selectedOption: Option<T>) => {
    return props.value.some((option) => option.id === selectedOption.id);
  };

  const mapOptions = (options: Options<T>) => {
    return (
      <>
        {options.map((option) => {
          if (option?.options) {
            return (
              <>
                <li
                  key={option.id}
                  // value={option}
                  className="ui-active:bg-blue-500 ui-active:text-white ui-not-active:bg-white ui-not-active:text-black"
                >
                  <input
                    type="checkbox"
                    checked={isGroupSelected(option)}
                    readOnly
                    onClick={(event) => {
                      event.stopPropagation();
                      handleGroupSelection(option, isGroupSelected(option));
                    }}
                  />
                  {option.name}
                  <ol className="pl-2">{mapOptions(option.options)}</ol>
                </li>
              </>
            );
          } else {
            return (
              <Combobox.Option
                key={option.id}
                value={option}
                className="ui-active:bg-blue-500 ui-active:text-white ui-not-active:bg-white ui-not-active:text-black"
              >
                <input type="checkbox" checked={isSelected(option)} />
                {option.name}
              </Combobox.Option>
            );
          }
        })}
      </>
    );
  };

  return (
    <div className="w-full">
      <Combobox value={props.value} onChange={props.onChange} multiple by="id">
        {({ open }) => (
          <>
            <Combobox.Button className="w-full cursor-default">
              <div
                className="flex flex-wrap items-center flex-row gap-1 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-300"
                onClick={(event) => {
                  if (open) {
                    event.stopPropagation();
                    event.preventDefault();
                  }
                }}
                ref={divRef}
                onFocus={() => {
                  divRef.current?.click();
                }}
              >
                {narrowedSelected.map((option) => (
                  <Tag
                    key={option.id}
                    label={option.name}
                    remove={() => {
                      //   handleRemoveSelectedOption(option);
                    }}
                  />
                ))}
                <Combobox.Input
                  className="focus:outline-none flex-grow"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={props.placeholder}
                  autoComplete="off"
                />
              </div>
            </Combobox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setSearchTerm("")}
            >
              <Combobox.Options
                as="ol"
                className="rounded-md overflow-y-auto"
                // max-h-60
              >
                {mapOptions(filteredOptions)}
              </Combobox.Options>
            </Transition>
          </>
        )}
      </Combobox>
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
