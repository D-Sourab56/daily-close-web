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
```

Cash expenses are added back here because the money was removed from the drawer after being received from sales.

### E-Cash sales

```text
E-Cash Sales =
QR/E-Wallet Received
+ Online Banking Received
```

### Total sales received

```text
Total Sales Received =
Cash Sales
+ E-Cash Sales
```

### Total expenses

```text
Total Expenses =
Cash Expenses
+ Other Expenses
```

### Remaining after expenses

```text
Remaining After Expenses =
Total Sales Received
- Total Expenses
```

The amount remaining after expenses is not accounting profit.

Hisaab Sathi V1.1 does not include inventory costs, cost of goods sold, salaries, rent allocation, tax calculations, or complete profit-and-loss accounting.

## Cash denomination counter

Merchants can enter the total cash in the drawer directly or count individual notes and coins.

Supported denominations:

- रु 1,000
- रु 500
- रु 100
- रु 50
- रु 20
- रु 10
- रु 5
- रु 2
- रु 1

The application automatically calculates the total drawer cash from the entered quantities.

The selected cash-entry method and denomination breakdown are also saved with the closing record.

## Date support

Hisaab Sathi displays both:

- Bikram Sambat (BS) date
- English Gregorian (AD) date

Both dates are shown in Today, Closing Result, History, and downloaded PDF records.

## Dark mode

The application checks the device's preferred theme during the first visit.

Merchants can manually switch between light and dark modes. The selected theme is remembered in the browser.

Numerical input fields use high-contrast colors in both themes for easier use during evening closing.

## Closing history

Every completed closing is saved in the browser.

Merchants can:

- View previous closing summaries
- Open a closing to see its details
- Edit a previous closing
- Save the corrected closing
- Download the closing record as PDF

The latest saved closing can automatically provide the opening cash for the next closing.

## Run the project locally

Install the project dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the following address in a browser:

```text
http://localhost:3000
```

## Verify the project

Run the code-quality check:

```bash
npm run lint
```

Create an optimized production build:

```bash
npm run build
```

## Technology used

- Next.js
- React
- TypeScript
- CSS
- Browser localStorage
- Nepali Date Converter
- Vercel

## Current limitations

- Records do not synchronize between devices
- Records are not stored in a cloud account
- Clearing browser data can remove saved records
- The website does not calculate accounting profit
- The website does not manage inventory
- The website does not automatically read payment notifications
- The website does not include authentication
- The website does not process payments
- The website must first be loaded through a browser connection

## Project status

Hisaab Sathi V1.1 is ready for early testing with selected merchants.

Feedback from real daily-closing use will guide future versions.
