import { AddressLike, Contract, ethers, JsonRpcProvider, ZeroAddress } from 'ethers';

import Token from './Token';

import { FACTORY_V2, FACTORY_V3, WETH } from '../addresses.json';

import PairABI from '../ABI/UniswapV2/Pair.json';
import PoolABI from '../ABI/UniswapV3/Pool.json';

import FactoryV2 from '../ABI/UniswapV2/Factory.json';
import FactoryV3 from '../ABI/UniswapV3/Factory.json';

export default class Pool {
    provider: JsonRpcProvider;

    address: string = ZeroAddress;
    contract: Contract;
    version: Version = Version.V2;

    tokenAddress: AddressLike;

    constructor(provider: JsonRpcProvider, tokenAddress: AddressLike) {
        this.provider = provider;
        this.tokenAddress = tokenAddress;

        this.checkStandard(tokenAddress).then(([poolAddress, version]) => {
            this.address = poolAddress;
            this.version = version;
        });

        this.contract = new Contract(
            this.address,
            this.version == Version.V2 ? PairABI : PoolABI,
            provider
        );
    }

    private async checkStandard(tokenAddress: AddressLike): Promise<[string, Version]> {
        let factory = new Contract(FACTORY_V2, FactoryV2, this.provider);
        let poolAddress = await factory.getPair(tokenAddress, WETH);

        if (poolAddress != ZeroAddress) return [poolAddress, Version.V2];

        factory = new Contract(FACTORY_V3, FactoryV3, this.provider);
        poolAddress = await factory.getPool(tokenAddress, WETH, 3000);

        return [poolAddress, Version.V3];
    }

    async getPrice(action: Action, token: Token): Promise<number> {
        if (this.version == Version.V2) {
            const [reserve0, reserve1, _timestamp]: bigint[] = await this.contract.getReserves();

            const WETHReserve = reserve1 * ethers.parseEther('1');
            const tokenReserve = reserve0 * BigInt(10) ** BigInt(token.decimals);

            return action == Action.Buy
                ? Number(WETHReserve / tokenReserve)
                : Number(tokenReserve / WETHReserve);
        } else {
            const info = await this.contract.slot0();
            const token0 = await this.contract.token0();

            let price = (info.sqrtPriceX96 / 2 ** 96) ** 2 / 10 ** (18 - token.decimals);
            //handle if the token pair was set in a wrong way
            if (token0 == token.address) price = 1 / price;

            return action == Action.Buy ? price : 1 / price;
        }
    }
}
