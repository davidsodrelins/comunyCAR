declare module 'paypal-rest-sdk' {
  export interface PaymentDetails {
    intent: string;
    payer: {
      payment_method: string;
    };
    redirect_urls: {
      return_url: string;
      cancel_url: string;
    };
    transactions: Array<{
      amount: {
        total: string;
        currency: string;
        details: {
          subtotal: string;
        };
      };
      description: string;
      item_list: {
        items: Array<{
          name: string;
          sku: string;
          price: string;
          currency: string;
          quantity: number;
        }>;
      };
    }>;
  }

  export interface Payment {
    id: string;
    links: Array<{
      rel: string;
      href: string;
    }>;
  }

  export const configure: (config: {
    mode: 'sandbox' | 'production';
    client_id: string;
    client_secret: string;
  }) => void;

  export const payment: {
    create: (details: PaymentDetails, callback: (error: any, payment: Payment) => void) => void;
    execute: (paymentId: string, data: { payer_id: string }, callback: (error: any, payment: any) => void) => void;
    get: (paymentId: string, callback: (error: any, payment: Payment) => void) => void;
  };
}
