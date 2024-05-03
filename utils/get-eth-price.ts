import { JsonRpcProvider } from 'ethers';

import Pool from 'class/Pool';
import Token from 'class/Token';

import { Action } from 'types';

import { USDT } from 'addresses';

export default async function getETHPrice(provider: JsonRpcProvider): Promise<number> {
    const USDTToken = new Token(provider, USDT);
    USDTToken.decimals = 6;

    const USDTPool = new Pool(provider, USDT);
    await USDTPool.setPoolVersion();

    return await USDTPool.getPrice(Action.Buy, USDTToken);
}
