"use client";
import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./components/CheckoutForm";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  {}
);
export default function Home() {
  const appearance = {
    theme: "stripe",
  };
  const options = {
    /* Within options params we are going to set mode, currency and paymentMethodCreation, this will allow us to mount the
		payment element without a corresponding client secret.*/

    mode: "payment",
    amount: 100,
    currency: "aud",
    paymentMethodCreation: "manual",

    appearance,
  };

  return (
    <div className="App">
      <Elements options={options} stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
