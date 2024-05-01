import { AddressLike, Contract, ethers, JsonRpcProvider, ZeroAddress } from 'ethers';

import { Version, Action } from 'enum-types';

import Token from 'class/Token';

import { FACTORY_V2, FACTORY_V3, WETH } from 'addresses';

import PairABI from 'abi/UniswapV2/Pair.json';
import PoolABI from 'abi/UniswapV3/Pool.json';
import FactoryV2ABI from 'abi/UniswapV2/Factory.json';
import FactoryV3ABI from 'abi/UniswapV3/Factory.json';

export default class Pool {
    provider: JsonRpcProvider;

    address: string = ZeroAddress;
    contract: Contract = new Contract(ZeroAddress, PairABI);
    version: Version = Version.V2;

    tokenAddress: AddressLike;

    constructor(provider: JsonRpcProvider, tokenAddress: AddressLike) {
        this.provider = provider;
        this.tokenAddress = tokenAddress;
    }

    async initialize() {
        let factory = new Contract(FACTORY_V2, FactoryV2ABI, this.provider);
        let poolAddress = await factory.getPair(this.tokenAddress, WETH);

        if (poolAddress == ZeroAddress) {
            factory = new Contract(FACTORY_V3, FactoryV3ABI, this.provider);
            poolAddress = await factory.getPool(this.tokenAddress, WETH, 3000);
            this.version = Version.V3;
        }

        this.address = poolAddress;

        this.contract = new Contract(
            this.address,
            this.version == Version.V2 ? PairABI : PoolABI,
            this.provider
        );
    }

    async getPrice(action: Action, token: Token): Promise<number> {
        if (this.version == Version.V2) {
            const [reserve0, reserve1, _timestamp]: bigint[] = await this.contract.getReserves();

            const tokenRes = parseFloat(ethers.formatUnits(reserve0, token.decimals));
            const WETHRes = parseFloat(ethers.formatUnits(reserve1, 18));

            return action == Action.Buy ? WETHRes / tokenRes : tokenRes / WETHRes;
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
