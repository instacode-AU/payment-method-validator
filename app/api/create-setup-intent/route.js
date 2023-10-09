import { NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});

export async function POST() {
	const setupIntent = await stripe.setupIntents.create({
		customer: "cus_OfGDn38VfvHWjE",
		automatic_payment_methods: { enabled: true },
	});

	return NextResponse.json(setupIntent);
}
