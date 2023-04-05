import { Ref, forwardRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  activeDescendant: string | undefined;
}

export const Input = forwardRef(function Input(
  { value, onChange, placeholder, activeDescendant }: Props,
  inputRef: Ref<HTMLInputElement>
) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      ref={inputRef}
      autoComplete="off"
      aria-autocomplete="list"
      aria-activedescendant={activeDescendant}
      className="text-gray-700 flex-grow focus:outline-none"
    />
  );
});
