type SwapRequest = {
    action: Action;
    amountIn: number;
    token: Token;
};

type ExactInputSingleParams = {
    tokenIn: string;
    tokenOut: string;
    fee: number;
    recipient: string;
    deadline: number;
    amountIn: string;
    amountOutMinimum: string;
    sqrtPriceLimitX96: number;
};
