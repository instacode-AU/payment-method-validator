import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
console.log("**Getting PM***");

export async function POST(req) {
	const { id, country } = await req.json();

	const paymentMethod = await stripe.paymentMethods.update(id, {
		billing_details: {
			address: {
				country: country,
			},
		},
	});
	return NextResponse.json(paymentMethod);
}
