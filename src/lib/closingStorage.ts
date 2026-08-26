import type {
  ClosingAmounts,
  ClosingResult,
} from "@/lib/calculateClosing";

const STORAGE_KEY = "daily-close-v0-closings";

export type CashHandoff = {
  cashKeptForTomorrow: number;
  ownerWithdrawal: number;
};

export type SavedClosing = {
  id: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  amounts: ClosingAmounts;
  result: ClosingResult;
  cashHandoff: CashHandoff;
};

export type SaveClosingResponse = {
  closings: SavedClosing[];
  savedClosing: SavedClosing;
};

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0",
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function loadClosings(): SavedClosing[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(
      STORAGE_KEY,
    );

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return (parsedValue as SavedClosing[])
      .map((closing) => {
        const cashKeptForTomorrow =
          closing.cashHandoff
            ?.cashKeptForTomorrow ??
          closing.result.closingCash;

        const ownerWithdrawal =
          closing.cashHandoff?.ownerWithdrawal ??
          closing.result.closingCash -
            cashKeptForTomorrow;

        return {
          ...closing,
          updatedAt:
            closing.updatedAt ?? closing.createdAt,

          cashHandoff: {
            cashKeptForTomorrow,
            ownerWithdrawal,
          },
        };
      })
      .sort((first, second) =>
        second.date.localeCompare(first.date),
      );
  } catch {
    return [];
  }
}

export function saveClosing(
  amounts: ClosingAmounts,
  result: ClosingResult,
  cashHandoff: CashHandoff,
  closingToUpdate?: SavedClosing,
): SaveClosingResponse {
  const currentClosings = loadClosings();
  const today = getLocalDateKey();

  const existingClosing =
    closingToUpdate ??
    currentClosings.find(
      (closing) => closing.date === today,
    );

  const now = new Date().toISOString();

  const savedClosing: SavedClosing = {
    id:
      existingClosing?.id ??
      `${today}-${Date.now().toString()}`,

    date: existingClosing?.date ?? today,

    createdAt: existingClosing?.createdAt ?? now,
    updatedAt: now,
    amounts,
    result,
    cashHandoff,
  };

  const closings = [
    savedClosing,
    ...currentClosings.filter(
      (closing) => closing.id !== savedClosing.id,
    ),
  ].sort((first, second) =>
    second.date.localeCompare(first.date),
  );

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(closings),
  );

  return {
    closings,
    savedClosing,
  };
}