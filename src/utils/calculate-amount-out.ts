import { SwapRequest } from 'swap-types';
import { Action } from 'enum-types';

import Pool from 'class/Pool';

export default async function calculateAmounts(
    { action, amountIn, token }: SwapRequest,
    pool: Pool
): Promise<string[]> {
    const price = await pool.getPrice(action, token);
    let amountOut = amountIn * price;

    const decimalsIn = action == Action.Buy ? 18 : token.decimals;
    const decimalsOut = action == Action.Sell ? 18 : token.decimals;

    return [toFullLength(amountIn, decimalsIn), toFullLength(amountOut, decimalsOut)];
}

function toFullLength(amountIn: number, decimals: number): string {
    const amount = Math.floor(amountIn * 10 ** decimals);
    return amount.toLocaleString('fullwide', { useGrouping: false });
}
