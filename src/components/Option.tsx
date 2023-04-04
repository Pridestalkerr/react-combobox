import { ReactNode } from "react";

interface Props {
  selected: boolean;
  id: string;
  children?: ReactNode;
  focused: boolean;
  onClick: () => void;
  label: string;
}

export const Option = (props: Props) => {
  const optionClasses = `
    mr-2
    ${props.focused ? "bg-gray-200" : ""}
  `;
  return (
    <li
      role="option"
      id={props.id}
      aria-selected={props.selected}
      className={optionClasses}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onClick();
      }}
    >
      <input
        type="checkbox"
        checked={props.selected}
        className="mr-2"
        readOnly
        tabIndex={-1}
      />
      {props.label}
      {props.children}
    </li>
  );
};
