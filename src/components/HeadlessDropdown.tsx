import {
  useCallback,
  useState,
  useMemo,
  useRef,
  Fragment,
  FC,
  useEffect,
} from "react";
import { Combobox, Transition } from "@headlessui/react";

// const filterOptions = useCallback(
//   (options: Options<T>, searchTerm: string): Options<T> => {
//     return options
//       .map((option) => {
//         if (option?.options) {
//           const filteredGroupOptions = filterOptions(
//             option.options,
//             searchTerm
//           );

//           return filteredGroupOptions.length > 0
//             ? { ...option, options: filteredGroupOptions }
//             : null;
//         } else {
//           return option.name.toLowerCase().includes(searchTerm.toLowerCase())
//             ? option
//             : null;
//         }
//       })
//       .filter((optionOrGroup) => optionOrGroup !== null) as Options<T>;
//   },
//   []
// );

function CustomComboboxOption({ value, onKeyDown, children, ...props }) {
  const optionRef = useRef(null);

  useEffect(() => {
    if (!optionRef.current) return;

    const originalKeyDown = optionRef.current.onkeydown;
    optionRef.current.onkeydown = (event) => {
      if (event.key === "Enter") {
        onKeyDown(event);
      } else {
        originalKeyDown(event);
      }
    };
  }, [optionRef, onKeyDown]);

  return (
    <Combobox.Option {...props} value={value} ref={optionRef}>
      {children}
    </Combobox.Option>
  );
}

export interface Option<T> {
  value: T;
  id: string;
  name: string;
  options?: Options<T>;
}

export type Options<T> = Array<Option<T>>;

export interface Props<T> {
  options: Options<T>;
  onChange: ({
    value,
    narrow,
  }: {
    value: Options<T>;
    narrow: Options<T>;
  }) => void;
  placeholder?: string;
  data: { value: Options<T>; narrow: Options<T> };
  // narrow: Options<T>;
  // onNarrow: (options: Options<T>) => void;
}

export const HeadlessDropdown = <T extends unknown>(
  props: Props<T>
): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState("");
  const divRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    // add an event listener for enter on labelRef
    const handleEnter = (event: KeyboardEvent) => {
      alert("daten pizda mati");
      if (event.key === "Enter") {
        labelRef.current?.click();
      }
    };
    labelRef.current?.addEventListener("keydown", handleEnter);
  }, []);

  const handleChange = (selectedOptions: Options<T>) => {
    selectedOptions = selectedOptions.filter(
      (option) => !(option === null || option === undefined)
    );
    let narrowed: Options<T> = [];

    const narrow = (options: Options<T>) => {
      options.forEach((option) => {
        if (option.options) {
          if (isGroupSelected(selectedOptions, option)) {
            narrowed.push(option);
          } else {
            narrow(option.options);
          }
        } else {
          if (
            selectedOptions.some(
              (selectedOption) => selectedOption.id === option.id
            )
          ) {
            narrowed.push(option);
          }
        }
      });
    };

    narrow(props.options);
    props.onChange({ value: selectedOptions, narrow: narrowed });

    console.log(selectedOptions);
    console.log(narrowed);
  };

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

  const isGroupSelected = (selected: Options<T>, group: Option<T>) => {
    return flattenOptions(group.options).every((option) =>
      selected.some((selectedOption) => selectedOption.id === option.id)
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
    console.log("value: ", props.data.value);

    const newOptions = isSelected
      ? props.data.value.filter(
          (option) =>
            !flattenOptions(group.options).some((e) => e.id === option.id)
        )
      : Array.from(
          addUniqueOptions(
            new Set(props.data.value),
            flattenOptions(group.options)
          )
        );

    handleChange(newOptions);
  };

  // const narrowSelected = useCallback(
  //   (selected: Options<T>, options: Options<T>) => {
  //     let narrowed = [];

  //     const narrow = (options: Options<T>) => {
  //       options.forEach((option) => {
  //         if (option.options) {
  //           if (isGroupSelected(option)) {
  //             narrowed.push(option);
  //           } else {
  //             narrow(option.options);
  //           }
  //         } else {
  //           if (
  //             selected.some((selectedOption) => selectedOption.id === option.id)
  //           ) {
  //             narrowed.push(option);
  //           }
  //         }
  //       });
  //     };

  //     narrow(options);
  //     return narrowed;
  //   },
  //   [isGroupSelected]
  // );

  // const narrowedSelected = useMemo(() => {
  //   return narrowSelected(props.data.value, props.options);
  // }, [props.data.value, props.options, narrowSelected]);

  const filteredOptions = useMemo(() => {
    return filterOptions(props.options, searchTerm);
  }, [props.options, searchTerm, filterOptions]);

  const isSelected = (selectedOption: Option<T>) => {
    return props.data.value.some((option) => option.id === selectedOption.id);
  };

  const mapOptions = (options: Options<T>) => {
    return (
      <>
        {options.map((option) => {
          if (option?.options) {
            return (
              <>
                <CustomComboboxOption
                  // as="li"
                  value={null}
                  onKeyDown={(event) => {
                    alert("muia mati de boyu");
                    // if (event.key === "Enter") {
                    //   event.preventDefault();
                    //   event.stopPropagation();
                    //   handleGroupSelection(
                    //     option,
                    //     isGroupSelected(props.data.value, option)
                    //   );
                    // }
                  }}
                  onClick={(event) => {
                    // alert("vreau sa milsugi");
                    event.stopPropagation();
                    handleGroupSelection(
                      option,
                      isGroupSelected(props.data.value, option)
                    );
                  }}
                  // tabIndex={-1}
                  // role="option"
                  // aria-selected={isGroupSelected(props.data.value, option)}
                  key={option.id}
                  className="ui-active:bg-blue-500 ui-active:text-white ui-not-active:bg-white ui-not-active:text-black"
                >
                  <input
                    // onClick={(event) => {
                    //   // alert("vreau sa milsugi");
                    //   // event.stopPropagation();
                    //   handleGroupSelection(
                    //     option,
                    //     isGroupSelected(props.data.value, option)
                    //   );
                    // }}
                    type="checkbox"
                    checked={isGroupSelected(props.data.value, option)}
                  />
                  {option.name}
                </CustomComboboxOption>
                <ol className="pl-2">{mapOptions(option.options)}</ol>
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
    <div
      className="w-full"
      onKeyDown={(event) => {
        alert("big ass div");
      }}
    >
      <Combobox
        value={props.data.value}
        onChange={handleChange}
        multiple
        by="id"
      >
        {({ open, activeOption }) => (
          <>
            {/* {activeOption && activeOption.name} */}
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
                {props.data.narrow.map((option) => (
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
                className="rounded-md overflow-y-auto absolute"
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
