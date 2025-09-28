declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

declare module "midtrans-client" {
  export class CoreApi {
    constructor(options: { isProduction: boolean; serverKey: string; clientKey?: string });
    charge(parameter: any): Promise<any>;
    capture(parameter: any): Promise<any>;
    status(orderId: string): Promise<any>;
    approve(orderId: string): Promise<any>;
    cancel(orderId: string): Promise<any>;
    expire(orderId: string): Promise<any>;
    refund(orderId: string, parameter: any): Promise<any>;
    notification(parameter: any): Promise<any>; 
  }

  export class Snap {
    constructor(options: { isProduction: boolean; serverKey: string; clientKey: string });
    createTransaction(parameter: any): Promise<any>;
    createTransactionToken(parameter: any): Promise<any>;
    createTransactionRedirectUrl(parameter: any): Promise<any>;
  }
}

export {};
