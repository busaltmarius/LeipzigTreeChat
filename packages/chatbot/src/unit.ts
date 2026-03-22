const uniqueSymbol: unique symbol = Symbol("UNIT_SYMBOL");

/**
 * Phantom type used when an Effect succeeds without returning a meaningful value.
 */
export type Unit = { [uniqueSymbol]?: never };
