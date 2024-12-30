"use server";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia",
});

interface CreateCustomerProps {
  fullName: string;
  email: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  shipping: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  patientId: string;
}

export async function createCustomer({
                                       fullName,
                                       email,
                                       address,
                                       shipping,
                                       patientId,
                                     }: CreateCustomerProps) {
  const customer = await stripe.customers.create({
    name: fullName,
    email: email || undefined,
    address: {
      line1: address.line1,
      line2: address.line2 || undefined,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: "US",
    },
    shipping: {
      name: fullName,
      address: {
        line1: shipping.line1,
        line2: shipping.line2 || undefined,
        city: shipping.city,
        state: shipping.state,
        postal_code: shipping.postal_code,
        country: "US",
      },
    },
    metadata: {
      patientId: patientId,
    },
  });

  return JSON.parse(JSON.stringify(customer));
}
