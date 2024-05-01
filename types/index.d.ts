declare module 'enum-types' {
    export enum Version {
        V2,
        V3,
    }

    export enum Action {
        Buy,
        Sell,
    }
}

declare module 'swap-types' {
    export type SwapRequest = {
        action: Action;
        amountIn: number;
        token: Token;
    };

    export type ExactInputSingleParams = {
        tokenIn: string;
        tokenOut: string;
        fee: number;
        recipient: string;
        deadline: number;
        amountIn: string;
        amountOutMinimum: string;
        sqrtPriceLimitX96: number;
    };
}
