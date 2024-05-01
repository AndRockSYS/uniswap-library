import { ethers, HDNodeWallet, JsonRpcProvider, Wallet, ZeroAddress } from 'ethers';

import ERC20 from 'ABI/Token/ERC-20.json';

import { createTransaction } from 'utils';

export default class Token {
    provider: JsonRpcProvider;
    contract: ethers.Contract;

    address: string;
    symbol: string = 'UNDF';
    decimals: number = 18;

    constructor(provider: JsonRpcProvider, address: string) {
        this.provider = provider;
        this.contract = new ethers.Contract(address, ERC20, provider);
        this.address = address;
    }

    async initialize() {
        try {
            this.symbol = await this.contract.symbol();
        } catch (error) {}

        this.decimals = Number(await this.contract.decimals());
    }

    async approve(wallet: HDNodeWallet | Wallet, [spender, amount]: string[]) {
        const tx = await createTransaction(
            ERC20,
            this.contract,
            'approve',
            [spender, amount],
            wallet.address
        );

        await wallet.sendTransaction(tx);
    }

    async getBalance(address: string): Promise<number> {
        const balance: bigint = await this.contract.balanceOf(address);
        return parseFloat(ethers.formatUnits(balance, this.decimals));
    }

    async getMarketCap(): Promise<number> {
        const totalSupply: bigint = await this.contract.totalSupply();

        const contractAddress = await this.contract.getAddress();
        const contractBalance: bigint = await this.contract.balanceOf(contractAddress);

        const burnt: bigint = await this.contract.balanceOf(ZeroAddress);

        const marketCap = totalSupply - burnt - contractBalance;

        const formated = ethers.formatUnits(marketCap, this.decimals);
        return parseFloat(formated);
    }

    async getVolumeLastHour(): Promise<number> {
        const toBlock = await this.provider.getBlockNumber();

        const events = await this.contract.queryFilter('Transfer', toBlock - 300, toBlock);

        let totalTokens: bigint = BigInt(0);
        for (const event of events) {
            const amount = BigInt(event.topics[2]);
            totalTokens += amount;
        }

        const formated = ethers.formatUnits(totalTokens, this.decimals);
        return parseFloat(formated);
    }
}
