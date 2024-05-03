import { Contract, ethers, HDNodeWallet, JsonRpcProvider, Wallet } from 'ethers';

import Token from './Token';

import WETHTokenABI from 'ABI/Token/WETH.json';

import { WETH } from 'addresses';
import { sendTransaction } from 'utils';

export default class WETHToken extends Token {
    constructor(provider: JsonRpcProvider) {
        super(provider, WETH);

        this.symbol = 'WETH';
        this.contract = new Contract(WETH, WETHTokenABI, provider);
    }

    async deposit(wallet: Wallet | HDNodeWallet, amount: number) {
        await sendTransaction(
            WETHTokenABI,
            this.contract,
            'withdraw',
            [ethers.parseEther(amount.toString())],
            wallet
        );
    }

    async withdraw(amount: number) {}
}
