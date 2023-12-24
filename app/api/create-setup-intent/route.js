import { NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});

export async function POST() {
  const setupIntent = await stripe.paymentIntents.create({
    payment_method_types: ["card"],
    amount: 1000,
    currency: "aud",
  });

  return NextResponse.json(setupIntent);
}
