export const cashDenominations = [
  {
    key: "rs1000",
    value: 1000,
    label: "1,000",
  },
  {
    key: "rs500",
    value: 500,
    label: "500",
  },
  {
    key: "rs100",
    value: 100,
    label: "100",
  },
  {
    key: "rs50",
    value: 50,
    label: "50",
  },
  {
    key: "rs20",
    value: 20,
    label: "20",
  },
  {
    key: "rs10",
    value: 10,
    label: "10",
  },
  {
    key: "rs5",
    value: 5,
    label: "5",
  },
  {
    key: "rs2",
    value: 2,
    label: "2",
  },
  {
    key: "rs1",
    value: 1,
    label: "1",
  },
] as const;

export type CashDenominationKey =
  (typeof cashDenominations)[number]["key"];

export type CashEntryMode =
  | "total"
  | "denominations";

export type CashCountValues = Record<
  CashDenominationKey,
  string
>;

export type StoredCashCounts = Partial<
  Record<CashDenominationKey, number>
>;

export type CashCountDetails = {
  mode: CashEntryMode;
  counts: StoredCashCounts;
};

export function createEmptyCashCounts(): CashCountValues {
  return {
    rs1000: "",
    rs500: "",
    rs100: "",
    rs50: "",
    rs20: "",
    rs10: "",
    rs5: "",
    rs2: "",
    rs1: "",
  };
}

export function isValidCashQuantity(value: string) {
  return /^\d*$/.test(value);
}

export function calculateCashCount(
  counts: CashCountValues,
) {
  return cashDenominations.reduce(
    (total, denomination) => {
      const quantity = Number(
        counts[denomination.key] || 0,
      );

      return total + denomination.value * quantity;
    },
    0,
  );
}

export function toStoredCashCounts(
  counts: CashCountValues,
): StoredCashCounts {
  const storedCounts: StoredCashCounts = {};

  cashDenominations.forEach((denomination) => {
    const quantity = Number(
      counts[denomination.key] || 0,
    );

    if (
      Number.isSafeInteger(quantity) &&
      quantity > 0
    ) {
      storedCounts[denomination.key] = quantity;
    }
  });

  return storedCounts;
}

export function toCashCountValues(
  counts?: StoredCashCounts,
): CashCountValues {
  const values = createEmptyCashCounts();

  cashDenominations.forEach((denomination) => {
    const quantity = counts?.[denomination.key];

    if (
      typeof quantity === "number" &&
      Number.isSafeInteger(quantity) &&
      quantity > 0
    ) {
      values[denomination.key] =
        quantity.toString();
    }
  });

  return values;
}

export function calculateStoredCashCount(
  counts: StoredCashCounts,
) {
  return cashDenominations.reduce(
    (total, denomination) => {
      const quantity =
        counts[denomination.key] ?? 0;

      return total + denomination.value * quantity;
    },
    0,
  );
}