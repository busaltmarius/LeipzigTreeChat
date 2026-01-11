const uniqueSymbol: unique symbol = Symbol("UNIT_SYMBOL");
export type Unit = { [uniqueSymbol]?: never };
