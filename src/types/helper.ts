export type Required_v2<T extends object, K extends keyof T = keyof T> = Required<Pick<T, K>> &
  Omit<T, K>;
