import NepaliDate from "nepali-date-converter";

type DateInput = Date | string;

function toLocalDate(value: DateInput) {
  if (value instanceof Date) {
    return value;
  }

  const [yearText, monthText, dayText] =
    value.split("-");

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  return new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0,
  );
}

export function formatAdDate(
  value: DateInput,
) {
  return new Intl.DateTimeFormat("en-NP", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(toLocalDate(value));
}

export function formatBsDate(
  value: DateInput,
) {
  const nepaliDate = new NepaliDate(
    toLocalDate(value),
  );

  return nepaliDate
    .format("DD MMMM YYYY", "np")
    .trim();
}