import { JsonRpcProvider } from 'ethers';

import Pool from 'class/Pool';
import Token from 'class/Token';

import { Action } from 'types';

import { USDT } from 'addresses';

export default async function getETHPrice(provider: JsonRpcProvider): Promise<number> {
    const token2 = new Token(provider, USDT);
    await token2.initialize();

    const pool2 = new Pool(provider, USDT);
    await pool2.initialize();

    return await pool2.getPrice(Action.Buy, token2);
}
