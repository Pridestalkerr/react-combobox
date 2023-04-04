import { FC } from "react";

interface Props<T> {
  opt: T;
}

export const Component: <T>() => FC<Props<T>> = ({ opt, children }) => {
  return <></>;
};
