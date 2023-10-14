import { NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});

export async function POST() {
	const setupIntent = await stripe.setupIntents.create({
		customer: "cus_OfGDn38VfvHWjE",
		payment_method_types: ["card"],
	});

	return NextResponse.json(setupIntent);
}
