export type ClosingAmounts = {
  openingCash: number;
  cashNow: number;
  qrWalletReceived: number;
  onlineBankingReceived: number;
  cashExpenses: number;
  otherExpenses: number;
  otherMoneyIn: number;
};

export type ClosingResult = {
  salesReceived: number;
  remainingAfterExpenses: number;
  cashSales: number;
  eCashSales: number;
  qrWalletReceived: number;
  onlineBankingReceived: number;
  totalExpenses: number;
  cashExpenses: number;
  otherExpenses: number;
  otherMoneyIn: number;
  openingCash: number;
  closingCash: number;
};

type CalculationError =
  | "invalid"
  | "negativeCashSales";

export type CalculationOutcome =
  | {
      ok: true;
      result: ClosingResult;
    }
  | {
      ok: false;
      error: CalculationError;
    };

export function calculateClosing(
  amounts: ClosingAmounts,
): CalculationOutcome {
  const allAmounts = Object.values(amounts);

  const hasInvalidAmount = allAmounts.some(
    (amount) =>
      !Number.isFinite(amount) || amount < 0,
  );

  if (hasInvalidAmount) {
    return {
      ok: false,
      error: "invalid",
    };
  }

  /*
   * Opening Cash
   * + Cash Sales
   * + Other Money In
   * - Cash Expenses
   * = Cash in Drawer Now
   */

  const cashSales =
    amounts.cashNow -
    amounts.openingCash -
    amounts.otherMoneyIn +
    amounts.cashExpenses;

  if (cashSales < 0) {
    return {
      ok: false,
      error: "negativeCashSales",
    };
  }

  const eCashSales =
    amounts.qrWalletReceived +
    amounts.onlineBankingReceived;

  const salesReceived =
    cashSales + eCashSales;

  const totalExpenses =
    amounts.cashExpenses +
    amounts.otherExpenses;

  const remainingAfterExpenses =
    salesReceived - totalExpenses;

  return {
    ok: true,
    result: {
      salesReceived,
      remainingAfterExpenses,
      cashSales,
      eCashSales,
      qrWalletReceived: amounts.qrWalletReceived,
      onlineBankingReceived:
        amounts.onlineBankingReceived,
      totalExpenses,
      cashExpenses: amounts.cashExpenses,
      otherExpenses: amounts.otherExpenses,
      otherMoneyIn: amounts.otherMoneyIn,
      openingCash: amounts.openingCash,
      closingCash: amounts.cashNow,
    },
  };
}