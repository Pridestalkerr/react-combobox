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
