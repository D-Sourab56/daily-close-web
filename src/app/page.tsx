"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  appCopy,
  eCashFields,
  expenseFields,
  mainClosingFields,
  otherMoneyFields,
  type ClosingField,
  type ClosingFieldKey,
} from "@/content/dailyCloseCopy";

import {
  calculateClosing,
  type ClosingAmounts,
  type ClosingResult,
} from "@/lib/calculateClosing";

import {
  getLocalDateKey,
  loadClosings,
  saveClosing,
  type CashHandoff,
  type SavedClosing,
} from "@/lib/closingStorage";

type FormValues = Record<ClosingFieldKey, string>;
type ActiveTab = "today" | "history";

type DetailRow = {
  labelEn: string;
  labelNe: string;
  amount: number;
  tone: "incoming" | "outgoing" | "neutral";
};

const initialValues: FormValues = {
  openingCash: "",
  cashNow: "",
  qrWalletReceived: "",
  onlineBankingReceived: "",
  cashExpenses: "",
  otherExpenses: "",
  otherMoneyIn: "",
};

const moneyFormatter = new Intl.NumberFormat("en-NP", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatMoney(amount: number) {
  return moneyFormatter.format(amount);
}

function formatSavedDate(date: string) {
  return new Intl.DateTimeFormat("en-NP", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function isValidMoneyInput(value: string) {
  return /^\d*(\.\d{0,2})?$/.test(value);
}

function amountToInputValue(amount: number) {
  return amount === 0 ? "" : amount.toString();
}

function closingToFormValues(
  closing: SavedClosing,
): FormValues {
  return {
    openingCash: amountToInputValue(
      closing.amounts.openingCash,
    ),
    cashNow: amountToInputValue(
      closing.amounts.cashNow,
    ),
    qrWalletReceived: amountToInputValue(
      closing.amounts.qrWalletReceived,
    ),
    onlineBankingReceived: amountToInputValue(
      closing.amounts.onlineBankingReceived,
    ),
    cashExpenses: amountToInputValue(
      closing.amounts.cashExpenses,
    ),
    otherExpenses: amountToInputValue(
      closing.amounts.otherExpenses,
    ),
    otherMoneyIn: amountToInputValue(
      closing.amounts.otherMoneyIn,
    ),
  };
}

function getDetailRows(
  closing: SavedClosing,
): DetailRow[] {
  return [
    {
      ...appCopy.result.salesReceived,
      amount: closing.result.salesReceived,
      tone: "incoming",
    },
    {
      ...appCopy.result.remainingAfterExpenses,
      amount: closing.result.remainingAfterExpenses,
      tone:
        closing.result.remainingAfterExpenses >= 0
          ? "incoming"
          : "outgoing",
    },
    {
      ...appCopy.result.cashSales,
      amount: closing.result.cashSales,
      tone: "incoming",
    },
    {
      ...appCopy.result.eCashSales,
      amount: closing.result.eCashSales,
      tone: "incoming",
    },
    {
      ...appCopy.result.totalExpenses,
      amount: closing.result.totalExpenses,
      tone: "outgoing",
    },
    {
      ...appCopy.result.otherMoneyIn,
      amount: closing.result.otherMoneyIn,
      tone: "incoming",
    },
    {
      ...appCopy.result.openingCash,
      amount: closing.result.openingCash,
      tone: "neutral",
    },
    {
      ...appCopy.result.closingCash,
      amount: closing.result.closingCash,
      tone: "neutral",
    },
    {
      ...appCopy.result.cashKeptForTomorrow,
      amount:
        closing.cashHandoff.cashKeptForTomorrow,
      tone: "neutral",
    },
    {
      ...appCopy.result.ownerWithdrawal,
      amount: closing.cashHandoff.ownerWithdrawal,
      tone: "neutral",
    },
  ];
}

function openPdfPrintDialog(closing: SavedClosing) {
  const printWindow = window.open(
    "",
    "_blank",
    "width=900,height=900",
  );

  if (!printWindow) {
    window.alert(appCopy.history.popupBlocked);
    return;
  }

  const detailHtml = getDetailRows(closing)
    .map(
      (row) => `
        <tr>
          <td>
            <strong>${row.labelEn}</strong>
            <small>${row.labelNe}</small>
          </td>
          <td>रु ${formatMoney(row.amount)}</td>
        </tr>
      `,
    )
    .join("");

  printWindow.document.open();

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />

        <title>
          Daily Close - ${formatSavedDate(
            closing.date,
          )}
        </title>

        <style>
          @page {
            size: A4;
            margin: 18mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            color: #24302d;
            font-family:
              Arial,
              "Noto Sans Devanagari",
              sans-serif;
          }

          header {
            padding-bottom: 22px;
            border-bottom: 3px solid #365f58;
          }

          .brand {
            color: #8d3f50;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.14em;
          }

          h1 {
            margin: 0;
            font-size: 30px;
          }

          .date {
            color: #69736f;
          }

          .summary {
            margin: 24px 0;
            padding: 22px;
            border-radius: 14px;
            background: #e3ebe7;
          }

          .summary span {
            color: #69736f;
            font-size: 12px;
            font-weight: 700;
          }

          .summary strong {
            display: block;
            margin-top: 8px;
            color: #294a45;
            font-size: 34px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          td {
            padding: 11px 8px;
            border-bottom: 1px solid #d8d3c7;
          }

          td:last-child {
            text-align: right;
            font-weight: 700;
          }

          td strong,
          td small {
            display: block;
          }

          td small {
            margin-top: 3px;
            color: #69736f;
          }

          footer {
            margin-top: 28px;
            color: #69736f;
            font-size: 11px;
          }
        </style>
      </head>

      <body>
        <header>
          <p class="brand">DAILY CLOSE</p>
          <h1>Closing Record / दैनिक हिसाब</h1>

          <p class="date">
            ${formatSavedDate(closing.date)}
          </p>
        </header>

        <section class="summary">
          <span>
            TOTAL SALES RECEIVED /
            कुल बिक्री रकम
          </span>

          <strong>
            रु ${formatMoney(
              closing.result.salesReceived,
            )}
          </strong>
        </section>

        <h2>Complete details / पूर्ण विवरण</h2>

        <table>
          <tbody>${detailHtml}</tbody>
        </table>

        <footer>
          Remaining after recorded expenses is not
          accounting profit.
        </footer>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  window.setTimeout(() => {
    printWindow.print();
  }, 250);
}

export default function Home() {
  const [activeTab, setActiveTab] =
    useState<ActiveTab>("today");

  const [values, setValues] =
    useState<FormValues>(initialValues);

  const [submittedAmounts, setSubmittedAmounts] =
    useState<ClosingAmounts | null>(null);

  const [result, setResult] =
    useState<ClosingResult | null>(null);

  const [history, setHistory] = useState<
    SavedClosing[]
  >([]);

  const [editingClosing, setEditingClosing] =
    useState<SavedClosing | null>(null);

  const [lastSavedClosing, setLastSavedClosing] =
    useState<SavedClosing | null>(null);

  const [cashToKeep, setCashToKeep] = useState("");

  const [openingAutoFilled, setOpeningAutoFilled] =
    useState(false);

  const [handoffError, setHandoffError] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const storedClosings = loadClosings();
      const todayKey = getLocalDateKey();

      setHistory(storedClosings);

      const latestPreviousClosing =
        storedClosings.find(
          (closing) => closing.date < todayKey,
        );

      if (latestPreviousClosing) {
        setValues((current) => ({
          ...current,

          openingCash: amountToInputValue(
            latestPreviousClosing.cashHandoff
              .cashKeptForTomorrow,
          ),
        }));

        setOpeningAutoFilled(true);
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const today = new Intl.DateTimeFormat("en-NP", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const cashToKeepAmount = Number(cashToKeep || 0);

  const ownerWithdrawal = result
    ? result.closingCash - cashToKeepAmount
    : 0;

  function updateValue(
    field: ClosingFieldKey,
    value: string,
  ) {
    if (!isValidMoneyInput(value)) {
      return;
    }

    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === "openingCash") {
      setOpeningAutoFilled(false);
    }

    setSaved(false);
    setLastSavedClosing(null);
    setError("");
  }

  function updateCashToKeep(value: string) {
    if (!isValidMoneyInput(value)) {
      return;
    }

    setCashToKeep(value);
    setHandoffError("");
    setSaved(false);
    setLastSavedClosing(null);
  }

  function renderField(field: ClosingField) {
    return (
      <label className="field" key={field.key}>
        <span>{field.labelEn}</span>
        <small>{field.labelNe}</small>

        <div className="moneyInput">
          <span>रु</span>

          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            name={field.key}
            value={values[field.key]}
            placeholder={field.placeholder}
            onChange={(event) =>
              updateValue(field.key, event.target.value)
            }
          />
        </div>
      </label>
    );
  }

  function submitClosing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amounts: ClosingAmounts = {
      openingCash: Number(values.openingCash || 0),
      cashNow: Number(values.cashNow || 0),

      qrWalletReceived: Number(
        values.qrWalletReceived || 0,
      ),

      onlineBankingReceived: Number(
        values.onlineBankingReceived || 0,
      ),

      cashExpenses: Number(values.cashExpenses || 0),
      otherExpenses: Number(values.otherExpenses || 0),
      otherMoneyIn: Number(values.otherMoneyIn || 0),
    };

    const outcome = calculateClosing(amounts);

    if (!outcome.ok) {
      setError(appCopy.validation[outcome.error]);
      return;
    }

    const suggestedCash =
      editingClosing?.cashHandoff
        .cashKeptForTomorrow ??
      outcome.result.closingCash;

    setSubmittedAmounts(amounts);
    setResult(outcome.result);

    setCashToKeep(
      amountToInputValue(suggestedCash),
    );

    setSaved(false);
    setLastSavedClosing(null);
    setHandoffError("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function saveCurrentClosing() {
    if (!submittedAmounts || !result) {
      return;
    }

    if (
      !Number.isFinite(cashToKeepAmount) ||
      cashToKeepAmount < 0
    ) {
      setHandoffError(
        appCopy.validation.invalidTomorrowCash,
      );
      return;
    }

    if (cashToKeepAmount > result.closingCash) {
      setHandoffError(
        appCopy.validation.tomorrowCashTooHigh,
      );
      return;
    }

    const cashHandoff: CashHandoff = {
      cashKeptForTomorrow: cashToKeepAmount,
      ownerWithdrawal,
    };

    const response = saveClosing(
      submittedAmounts,
      result,
      cashHandoff,
      editingClosing ?? undefined,
    );

    setHistory(response.closings);
    setLastSavedClosing(response.savedClosing);
    setSaved(true);
  }

  function editCurrentAmounts() {
    setResult(null);
    setSubmittedAmounts(null);
    setSaved(false);
    setLastSavedClosing(null);
    setHandoffError("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function editSavedClosing(closing: SavedClosing) {
    setValues(closingToFormValues(closing));

    setCashToKeep(
      amountToInputValue(
        closing.cashHandoff.cashKeptForTomorrow,
      ),
    );

    setEditingClosing(closing);
    setOpeningAutoFilled(false);
    setSubmittedAmounts(null);
    setResult(null);
    setSaved(false);
    setLastSavedClosing(null);
    setHandoffError("");
    setError("");
    setActiveTab("today");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const headerTitle =
    activeTab === "history"
      ? appCopy.history.titleNe
      : result
        ? appCopy.result.titleNe
        : appCopy.today.titleNe;

  const headerSubtitle =
    activeTab === "history"
      ? appCopy.history.titleEn
      : result
        ? appCopy.result.titleEn
        : appCopy.today.titleEn;

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">{appCopy.brand}</p>
          <h1>{headerTitle}</h1>
          <p className="subtitle">{headerSubtitle}</p>
        </div>

        <div className="date">
          <span>आज / Today</span>
          <strong>{today}</strong>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={
            activeTab === "today"
              ? "tab active"
              : "tab"
          }
          type="button"
          onClick={() => setActiveTab("today")}
        >
          {appCopy.navigation.today}
        </button>

        <button
          className={
            activeTab === "history"
              ? "tab active"
              : "tab"
          }
          type="button"
          onClick={() => setActiveTab("history")}
        >
          {appCopy.navigation.history}
        </button>
      </nav>

      {activeTab === "history" ? (
        <section className="card">
          <div className="cardHeading">
            <div>
              <h2>{appCopy.history.heading}</h2>
              <p>{appCopy.history.description}</p>
            </div>

            <span className="step">
              {history.length} saved
            </span>
          </div>

          {history.length === 0 ? (
            <div className="resultList">
              <p className="emptyMovement">
                {appCopy.history.emptyEn}
                <br />
                {appCopy.history.emptyNe}
              </p>
            </div>
          ) : (
            <div className="optionalSections">
              {history.map((closing) => (
                <details
                  className="optionalSection"
                  key={closing.id}
                >
                  <summary className="optionalSummary">
                    <div>
                      <strong>
                        {formatSavedDate(closing.date)}
                      </strong>

                      <small>
                        {appCopy.history.sales}: रु{" "}
                        {formatMoney(
                          closing.result.salesReceived,
                        )}
                        {" · "}
                        {appCopy.history.expenses}: रु{" "}
                        {formatMoney(
                          closing.result.totalExpenses,
                        )}
                      </small>
                    </div>

                    <span className="optionalBadge">
                      {appCopy.history.viewDetails}
                    </span>
                  </summary>

                  <div className="optionalBody">
                    <div className="resultList">
                      {getDetailRows(closing).map(
                        (row) => (
                          <div
                            className="resultRow"
                            key={row.labelEn}
                          >
                            <div>
                              <strong>{row.labelEn}</strong>
                              <small>{row.labelNe}</small>
                            </div>

                            <span
                              className={
                                row.tone === "incoming"
                                  ? "incomingAmount"
                                  : row.tone === "outgoing"
                                    ? "outgoingAmount"
                                    : undefined
                              }
                            >
                              रु {formatMoney(row.amount)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>

                    <div className="optionalSections">
                      <button
                        className="primaryButton"
                        type="button"
                        onClick={() =>
                          openPdfPrintDialog(closing)
                        }
                      >
                        {appCopy.actions.pdfNe}
                        <span>
                          {appCopy.actions.pdfEn} ↓
                        </span>
                      </button>

                      <button
                        className="secondaryButton"
                        type="button"
                        onClick={() =>
                          editSavedClosing(closing)
                        }
                      >
                        <span>
                          ← {appCopy.actions.editSavedEn}
                        </span>

                        <strong>
                          {appCopy.actions.editSavedNe}
                        </strong>
                      </button>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      ) : !result ? (
        <form className="card" onSubmit={submitClosing}>
          <div className="cardHeading">
            <div>
              <h2>
                {editingClosing
                  ? appCopy.history.editHeading
                  : appCopy.today.heading}
              </h2>

              <p>
                {editingClosing
                  ? `${formatSavedDate(
                      editingClosing.date,
                    )} · ${
                      appCopy.history.editDescription
                    }`
                  : appCopy.today.description}
              </p>
            </div>

            <span className="step">
              {appCopy.today.required}
            </span>
          </div>

          <div className="formGrid">
            {mainClosingFields.map(renderField)}
          </div>

          {openingAutoFilled && (
            <p className="privacy">
              ✓ {appCopy.today.autoOpeningEn}

              <span>
                {appCopy.today.autoOpeningNe}
              </span>
            </p>
          )}

          <div className="optionalSections">
            <details className="optionalSection">
              <summary className="optionalSummary">
                <div>
                  <strong>
                    {appCopy.sections.eCash.titleEn}
                  </strong>

                  <small>
                    {appCopy.sections.eCash.titleNe}
                  </small>
                </div>

                <span className="optionalBadge">
                  {appCopy.sections.optional}
                </span>
              </summary>

              <div className="optionalBody">
                <div className="formGrid">
                  {eCashFields.map(renderField)}
                </div>
              </div>
            </details>

            <details className="optionalSection">
              <summary className="optionalSummary">
                <div>
                  <strong>
                    {appCopy.sections.expenses.titleEn}
                  </strong>

                  <small>
                    {appCopy.sections.expenses.titleNe}
                  </small>
                </div>

                <span className="optionalBadge">
                  {appCopy.sections.optional}
                </span>
              </summary>

              <div className="optionalBody">
                <div className="formGrid">
                  {expenseFields.map(renderField)}
                </div>
              </div>
            </details>

            <details className="optionalSection">
              <summary className="optionalSummary">
                <div>
                  <strong>
                    {appCopy.sections.otherMoney.titleEn}
                  </strong>

                  <small>
                    {appCopy.sections.otherMoney.titleNe}
                  </small>
                </div>

                <span className="optionalBadge">
                  {appCopy.sections.optional}
                </span>
              </summary>

              <div className="optionalBody">
                <div className="formGrid">
                  {otherMoneyFields.map(renderField)}
                </div>
              </div>
            </details>
          </div>

          {error && (
            <p className="privacy" role="alert">
              ⚠️ {error}
            </p>
          )}

          <button className="primaryButton" type="submit">
            {appCopy.actions.closeNe}

            <span>{appCopy.actions.closeEn} →</span>
          </button>
        </form>
      ) : (
        <section className="resultShell">
          <div className="resultHero">
            <div className="completeBadge">
              <span>✓</span>

              <div>
                <strong>
                  {appCopy.result.completeEn}
                </strong>

                <small>
                  {appCopy.result.completeNe}
                </small>
              </div>
            </div>

            <p className="resultHeroLabel">
              {appCopy.result.salesReceived.labelEn}
            </p>

            <div className="resultAmount">
              <span>रु</span>

              <strong>
                {formatMoney(result.salesReceived)}
              </strong>
            </div>

            <p className="resultHeroNepali">
              {appCopy.result.salesReceived.labelNe}
            </p>

            <p className="resultDate">
              {editingClosing
                ? formatSavedDate(editingClosing.date)
                : today}
            </p>
          </div>

          <div className="resultSection">
            <div className="resultSectionHeading">
              <h2>
                {appCopy.result.afterExpensesEn}
              </h2>

              <p>
                {appCopy.result.afterExpensesNe}
              </p>
            </div>

            <div className="resultList">
              <div className="resultRow">
                <div>
                  <strong>
                    {appCopy.result.salesReceived.labelEn}
                  </strong>

                  <small>
                    {appCopy.result.salesReceived.labelNe}
                  </small>
                </div>

                <span className="incomingAmount">
                  रु {formatMoney(result.salesReceived)}
                </span>
              </div>

              <div className="resultRow">
                <div>
                  <strong>
                    {appCopy.result.totalExpenses.labelEn}
                  </strong>

                  <small>
                    {appCopy.result.totalExpenses.labelNe}
                  </small>
                </div>

                <span className="outgoingAmount">
                  − रु {formatMoney(result.totalExpenses)}
                </span>
              </div>

              <div className="resultRow">
                <div>
                  <strong>
                    {
                      appCopy.result.remainingAfterExpenses
                        .labelEn
                    }
                  </strong>

                  <small>
                    {
                      appCopy.result.remainingAfterExpenses
                        .labelNe
                    }
                  </small>
                </div>

                <span
                  className={
                    result.remainingAfterExpenses >= 0
                      ? "incomingAmount"
                      : "outgoingAmount"
                  }
                >
                  = रु{" "}
                  {formatMoney(
                    result.remainingAfterExpenses,
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="resultSection">
            <div className="resultSectionHeading">
              <h2>
                {appCopy.result.prepareTomorrowEn}
              </h2>

              <p>
                {appCopy.result.prepareTomorrowNe}
                {" · "}
                {
                  appCopy.result
                    .prepareTomorrowDescription
                }
              </p>
            </div>

            <label className="field">
              <span>
                {
                  appCopy.result.cashKeptForTomorrow
                    .labelEn
                }
              </span>

              <small>
                {
                  appCopy.result.cashKeptForTomorrow
                    .labelNe
                }
              </small>

              <div className="moneyInput">
                <span>रु</span>

                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={cashToKeep}
                  placeholder="0"
                  onChange={(event) =>
                    updateCashToKeep(
                      event.target.value,
                    )
                  }
                />
              </div>
            </label>

            <div className="resultList">
              <div className="resultRow">
                <div>
                  <strong>
                    {
                      appCopy.result.ownerWithdrawal
                        .labelEn
                    }
                  </strong>

                  <small>
                    {
                      appCopy.result.ownerWithdrawal
                        .labelNe
                    }
                  </small>
                </div>

                <span
                  className={
                    ownerWithdrawal < 0
                      ? "outgoingAmount"
                      : "incomingAmount"
                  }
                >
                  रु {formatMoney(ownerWithdrawal)}
                </span>
              </div>
            </div>

            {handoffError && (
              <p className="privacy" role="alert">
                ⚠️ {handoffError}
              </p>
            )}
          </div>

          <div className="optionalSections">
            <button
              className="primaryButton"
              type="button"
              onClick={saveCurrentClosing}
              disabled={saved}
            >
              {saved
                ? appCopy.actions.savedNe
                : editingClosing
                  ? appCopy.actions.updateNe
                  : appCopy.actions.saveNe}

              <span>
                {saved
                  ? `${appCopy.actions.savedEn} ✓`
                  : editingClosing
                    ? `${appCopy.actions.updateEn} →`
                    : `${appCopy.actions.saveEn} →`}
              </span>
            </button>

            {saved && lastSavedClosing && (
              <button
                className="secondaryButton"
                type="button"
                onClick={() =>
                  openPdfPrintDialog(lastSavedClosing)
                }
              >
                <span>{appCopy.actions.pdfEn}</span>

                <strong>
                  {appCopy.actions.pdfNe} ↓
                </strong>
              </button>
            )}

            <button
              className="secondaryButton"
              type="button"
              onClick={editCurrentAmounts}
            >
              <span>← {appCopy.actions.editEn}</span>

              <strong>{appCopy.actions.editNe}</strong>
            </button>
          </div>
        </section>
      )}

      <p className="privacy">
        🔒 {appCopy.privacy.ne}

        <span>{appCopy.privacy.en}</span>
      </p>
    </main>
  );
}