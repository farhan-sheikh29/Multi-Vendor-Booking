import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
    typescript: true,
});

export async function createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
            enabled: true,
        },
    });
}

export async function refundPayment(
    paymentIntentId: string,
    amount?: number,
    reason?: string
): Promise<Stripe.Refund> {
    const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
    };

    if (amount) {
        refundData.amount = Math.round(amount * 100);
    }

    if (reason) {
        refundData.reason = reason as Stripe.RefundCreateParams.Reason;
    }

    return await stripe.refunds.create(refundData);
}

export async function retrievePaymentIntent(
    paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
}

export async function cancelPaymentIntent(
    paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.cancel(paymentIntentId);
}
