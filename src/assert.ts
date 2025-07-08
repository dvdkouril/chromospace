/**
 * Make an assertion.
 *
 * @param expr - The expression to test.
 * @param msg - The optional message to display if the assertion fails.
 * @throws an {@link Error} if `expression` is not truthy.
 */
export function assert(expr: unknown, msg?: string): asserts expr {
  if (!expr) {
    throw new Error(msg ?? "");
  }
}
