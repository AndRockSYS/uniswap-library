import { SwapRequest, Action } from 'types';

export default function calculateAmounts(
    { action, amountIn, token }: SwapRequest,
    price: number
): bigint[] {
    let amountOut = amountIn * price;

    const decimalsIn = action == Action.Buy ? 18 : token.decimals;
    const decimalsOut = action == Action.Sell ? 18 : token.decimals;

    return [toBigInt(amountIn, decimalsIn), toBigInt(amountOut, decimalsOut)];
}

function toBigInt(amountIn: number, decimals: number): bigint {
    return BigInt(amountIn * 10 ** decimals);
}
