export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const map = <T, E, U>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> => (result.ok ? ok(fn(result.value)) : (result as Result<U, E>));

export const mapError = <T, E, U>(
  result: Result<T, E>,
  fn: (error: E) => U,
): Result<T, U> => (result.ok ? result : err(fn(result.error)));

export const andThen = <T, E, U, E2>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E2>,
): Result<U, E | E2> =>
  result.ok ? fn(result.value) : (result as Result<U, E | E2>);

export const andThenAsync = async <T, E, U, E2>(
  result: Result<T, E>,
  fn: (value: T) => Promise<Result<U, E2>>,
): Promise<Result<U, E | E2>> =>
  result.ok ? fn(result.value) : (result as Result<U, E | E2>);
