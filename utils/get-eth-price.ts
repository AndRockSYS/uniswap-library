import { ethers, JsonRpcProvider } from 'ethers';

import Pool from 'class/Pool';
import Token from 'class/Token';

import { Action } from 'types';

import { USDT } from 'addresses';

export async function getETHPrice(provider: JsonRpcProvider): Promise<number> {
    const USDTToken = new Token(provider, USDT);
    USDTToken.decimals = 6;

    const USDTPool = new Pool(provider, USDT);
    await USDTPool.setPoolVersion();

    return await USDTPool.getPrice(Action.Buy, USDTToken);
}

export async function getETHBalance(provider: JsonRpcProvider, address: string): Promise<number> {
    const balance: bigint = await provider.getBalance(address);
    return Number(ethers.formatEther(balance));
}
