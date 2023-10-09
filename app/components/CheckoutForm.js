import React from "react";
import {
	PaymentElement,
	useStripe,
	useElements,
} from "@stripe/react-stripe-js";

export default function CheckoutForm() {
	const stripe = useStripe();
	const elements = useElements();
	const [message, setMessage] = React.useState(null);
	const [isLoading, setIsLoading] = React.useState(false);
	const [showCountryInfo, setShowCountryInfo] = React.useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		elements.submit();

		if (!stripe || !elements) {
			// Stripe.js hasn't yet loaded.
			// Make sure to disable form submission until Stripe.js has loaded.
			return;
		}

		setIsLoading(true);

		//Set the default country to AU for PM
		const params = {
			billing_details: {
				address: {
					country: "AU",
				},
			},
		};

		//We collect and tokenise the PM
		const pm = await stripe.createPaymentMethod({
			elements,
			params: params,
		});
		//Retrieve the card country
		console.log(JSON.stringify(pm.paymentMethod.card.country));

		if (pm.paymentMethod.card.country !== "AU") {
			const id = pm.paymentMethod.id.toString();
			const country = pm.paymentMethod.card.country.toString();

			//Create setup intent and obtain client secret
			const res = await fetch("/api/create-setup-intent", {
				method: "POST",
			});

			//Set the billing country to card country on confirmation step
			const { client_secret: clientSecret } = await res.json();
			elements.submit();
			const si = await stripe
				.confirmSetup({
					elements,
					clientSecret,
					confirmParams: {
						return_url: "http://localhost:3000",
						payment_method_data: {
							billing_details: {
								address: {
									country: country,
								},
							},
						},
					},
				})
				.then(
					//Update underling PM billing country
					await fetch("/api/update-payment-method", {
						headers: {
							"Content-Type": "application/json",
						},
						method: "POST",
						body: JSON.stringify({
							id: id,
							country: country,
						}),
					})
				);
		}

		// If card country === AU create setup intent and obtain client secret
		const res = await fetch("/api/create-setup-intent", {
			method: "POST",
		});

		const { client_secret: clientSecret } = await res.json();
		elements.submit();
		const si = await stripe.confirmSetup({
			elements,
			clientSecret,
			confirmParams: {
				return_url: "http://localhost:3000",
				payment_method_data: {
					billing_details: {
						address: {
							country: "AU",
						},
					},
				},
			},
		});
	};

	const paymentElementOptions = {
		layout: "tabs",
		fields: {
			billingDetails: {
				address: {
					country: "never",
				},
			},
		},
	};

	return (
		<form id="payment-form" onSubmit={handleSubmit}>
			<PaymentElement id="payment-element" options={paymentElementOptions} />
			<button
				disabled={isLoading || !stripe || !elements}
				id="submit"
				className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			>
				<span id="button-text">
					{isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
				</span>
			</button>
			{/* Show any error or success messages */}
			{message && <div id="payment-message">{message}</div>}
			<div>{showCountryInfo ? <p>visble</p> : null}</div>
		</form>
	);
}
