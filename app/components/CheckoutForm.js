import React from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  CheckIcon,
  CreditCardIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export default function CheckoutForm() {
  const [open, setOpen] = useState(false);

  const cancelButtonRef = useRef(null);

  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showCountryInfo, setShowCountryInfo] = React.useState(false);
  const [chargeInfo, setChargeInfo] = React.useState(null);

  const updateHandler = async (e) => {
    e.preventDefault();
    elements.submit();

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

    // const country = pm.paymentMethod.card.country;
    // console.log(`${pm.paymentMethod.id} = ${country}`);
    // if (["US", "GB"].includes(country)) {
    //   var paymentElement = elements.getElement("payment");
    //   paymentElement.update({
    //     fields: { billingDetails: { address: "auto" } },
    //     defaultValues: { billing_details: { address: { country: country } } },
    //   });
    //   setMessage(`Country is ${country}`);
    // }
    const type = pm.paymentMethod.type;
    console.log(`${pm.paymentMethod.id} = ${type}`);
    console.info(pm.paymentMethod);
    setMessage(`Type is ${type}`);
    //create a switch statement based on type of PM
    switch (type) {
      //if card then update message to state type
      case "card":
        {
          setMessage(`Type is ${type}`);
          const country = pm.paymentMethod.card.country;
          const brand =
            pm.paymentMethod.card.brand.charAt(0).toUpperCase() +
            pm.paymentMethod.card.brand.slice(1);
          const funding = pm.paymentMethod.card.funding;
          const networks = pm.paymentMethod.card.networks.available;
          setMessage(
            `Country is ${country}, Brand is ${brand}, Funding is ${funding}, Networks are ${networks}`
          );
          setChargeInfo(
            `This card is a ${brand} card issued in ${country}, as a result it will incur an additional surcharge of 1.72%. Your total amount due has been updated.`
          );
          setOpen(true);
        }
        break;
      case "au_becs_debit": {
        setMessage(`No surcharge for BECS DD`);
      }
      default:
        setMessage(`No surcharge`);
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    elements.submit();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const res = await fetch("/api/create-setup-intent", {
      method: "POST",
    });

    const { client_secret: clientSecret } = await res.json();
    elements.submit();
    const si = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: "http://localhost:3000",
      },
    });

    setMessage("Payment Intent Created");
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
    <div>
      <form id="payment-form" onSubmit={handleSubmit} onBlur={updateHandler}>
        <PaymentElement id="payment-element" options={paymentElementOptions} />
        <button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <span id="button-text">
            {isLoading ? (
              <div className="spinner" id="spinner"></div>
            ) : (
              "Pay now"
            )}
          </span>
        </button>
        {/* Show any error or success messages */}
        {message && <div id="payment-message">{message}</div>}
        <div>{showCountryInfo ? <p>visble</p> : null}</div>
      </form>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <InformationCircleIcon
                        className="h-6 w-6 text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Surcharge Information
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{chargeInfo}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                      onClick={() => setOpen(false)}
                    >
                      Proceed
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Change payment method
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
