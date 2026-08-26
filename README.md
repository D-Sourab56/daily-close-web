# Hisaab Sathi

Hisaab Sathi is a simple daily-closing web application designed for small merchants in Nepal.

## Live website

https://hisaab-sathi-nepal.vercel.app/

## Current version

**V1.1**

## Features

- Simple daily shop-closing form
- Opening cash and current drawer cash
- Enter drawer cash as a total amount
- Count drawer cash using Nepali currency denominations
- QR/e-wallet and online banking entries
- Cash and other expense entries
- Other non-sales money entries
- Automatic sales and expense calculations
- Select cash kept for the next business day
- Calculate owner withdrawal
- Save closing history locally
- View previous closing details
- Edit previous closing records
- Download closing records as PDF
- Bikram Sambat (BS) and English (AD) dates
- Light and dark modes
- High-contrast money input fields
- Nepali and English labels
- Responsive design for phones and computers

## How data is stored

Hisaab Sathi V1.1 has:

- No account
- No login
- No backend
- No cloud database
- No payment integration

All closing records are stored inside the merchant's browser using `localStorage`.

Each browser and device has separate records. Clearing browser data, changing browsers, or changing devices may remove or hide saved records.

Merchants should download important closing records as PDF for safekeeping.

## How calculations work

### Cash sales

```text
Cash Sales =
Cash in Drawer Now
- Opening Cash
- Other Money In
+ Cash Expenses
