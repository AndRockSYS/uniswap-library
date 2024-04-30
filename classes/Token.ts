import { ethers, JsonRpcProvider, ZeroAddress } from 'ethers';

import ERC20 from '../ABI/Token/ERC-20.json';

export default class Token {
    contract: ethers.Contract;

    address: string;
    symbol: string = 'UNDEFINED';
    decimals: number = 18;

    constructor(provider: JsonRpcProvider, address: string) {
        this.contract = new ethers.Contract(address, ERC20, provider);
        this.address = address;

        this.contract.symbol().then((symbol) => {
            this.symbol = symbol;
        });

        this.contract.decimals().then((decimals) => {
            this.decimals = decimals;
        });
    }

    async getMarketCap(): Promise<bigint> {
        const totalSupply: bigint = await this.contract.totalSupply();

        const contractAddress = await this.contract.getAddress();
        const contractBalance: bigint = await this.contract.balanceOf(contractAddress);

        const burnt: bigint = await this.contract.balanceOf(ZeroAddress);

        const marketCap = totalSupply - burnt - contractBalance;
        return ethers.parseUnits(marketCap.toString(), this.decimals);
    }

    async approve(spender: string, amount: string) {
        await this.contract.approve(spender, amount);
    }
}
