import { FC, HTMLAttributes } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const Input: FC<Props & HTMLAttributes<HTMLInputElement>> = ({
  value,
  onChange,
  placeholder,
  ...rest
}) => {
  return (
    <input
      type="text"
      value={value}
      // autoComplete="off"
      // aria-autocomplete="list"
      // aria-controls={listboxId}
      // aria-activedescendant={
      //   focusIndex >= 0 ? `option-${id}-${focusIndex}` : undefined
      // }
      //   readOnly={!search}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="text-gray-700 flex-grow focus:outline-none"
      {...rest}
      //   onClick={(e) => {
      //     if (isOpen) {
      //       e.stopPropagation();
      //     }
      //   }}
    />
  );
};
