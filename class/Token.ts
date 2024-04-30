import { ethers, JsonRpcProvider, ZeroAddress } from 'ethers';

import ERC20 from '../ABI/Token/ERC-20.json';

export default class Token {
    provider: JsonRpcProvider;
    contract: ethers.Contract;

    address: string;

    constructor(provider: JsonRpcProvider, address: string) {
        this.provider = provider;
        this.contract = new ethers.Contract(address, ERC20, provider);
        this.address = address;
    }

    async approve(spender: string, amount: string) {
        await this.contract.approve(spender, amount);
    }

    async getBalance(address: string): Promise<bigint> {
        return await this.contract.balanceOf(address);
    }

    async symbol(): Promise<string> {
        try {
            return await this.contract.symbol();
        } catch (error) {
            return 'UNDF';
        }
    }

    async decimals(): Promise<number> {
        try {
            return await this.contract.decimals();
        } catch (error) {
            return 18;
        }
    }

    async getMarketCap(): Promise<bigint> {
        const totalSupply: bigint = await this.contract.totalSupply();

        const contractAddress = await this.contract.getAddress();
        const contractBalance: bigint = await this.contract.balanceOf(contractAddress);

        const burnt: bigint = await this.contract.balanceOf(ZeroAddress);

        const marketCap = totalSupply - burnt - contractBalance;
        return ethers.parseUnits(marketCap.toString(), await this.decimals());
    }

    async getTokensVolumeLastHour(): Promise<bigint> {
        const toBlock = await this.provider.getBlockNumber();

        const events = await this.contract.queryFilter('Transfer', toBlock - 300, toBlock);

        let totalTokens = BigInt(0);
        for (const event of events) {
            const amount = BigInt(event.topics[2]);
            totalTokens += amount;
        }

        return totalTokens / BigInt(await this.decimals());
    }
}
