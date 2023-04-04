export interface Option<T> {
  value: T;
  name: string;
  options?: Options<T>;
}

export type Options<T> = Array<Option<T>>;
