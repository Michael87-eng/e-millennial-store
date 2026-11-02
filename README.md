# The E-Millennial Store

A responsive, single-page online gadget store built with plain HTML, CSS and JavaScript. Shoppers browse products, manage a cart, enter their details and pay through [Paystack](https://paystack.com) in Ghana Cedis (GH₵).

## Features

- Product grid rendered from data in `script.js`
- Add/remove products, change quantities, live cart badge and total
- Cart and contact details persist in `localStorage`
- Form validation for name, email and Ghana phone numbers (`0241234567` or `+233241234567`)
- Paystack inline checkout (GHS, amounts sent in pesewas)
- Order summary after successful payment
- Responsive layout for phone, tablet and desktop

## Run locally

No build step. Serve the folder with any static server, for example:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Payments

`script.js` uses a Paystack **test** public key, so checkout runs in test mode and no real money moves. Use Paystack's [test cards](https://paystack.com/docs/payments/test-payments/) to try it. To go live, replace the key in `initiatePayment()` with your live public key (public keys are safe to ship in client code; never put a secret key here).

## Deployment

The site is hosted on GitHub Pages straight from the `main` branch root.

## Project structure

```
index.html        Page markup and modals
styles.css        Styles and responsive breakpoints
script.js         State, cart logic, validation, Paystack integration
assets/images/    Product images
```
