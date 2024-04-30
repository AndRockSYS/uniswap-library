import { AddressLike, ethers, JsonRpcProvider, ZeroAddress } from 'ethers';

import { FACTORY_V2, FACTORY_V3, WETH } from '../addresses.json';

import FactoryV2 from '../ABI/UniswapV2/Factory.json';
import FactoryV3 from '../ABI/UniswapV3/Factory.json';

enum Version {
    V2,
    V3,
}

export default class Pool {
    provider: JsonRpcProvider;

    poolAddress: AddressLike = ZeroAddress;
    version: Version = Version.V2;

    constructor(provider: JsonRpcProvider, tokenAddress: AddressLike) {
        this.provider = provider;

        this.checkStandard(tokenAddress).then(([poolAddress, version]) => {
            this.poolAddress = poolAddress;
            this.version = version;
        });
    }

    private async checkStandard(tokenAddress: AddressLike): Promise<[AddressLike, Version]> {
        let factory = new ethers.Contract(FACTORY_V2, FactoryV2, this.provider);
        let poolAddress = await factory.getPair(tokenAddress, WETH);

        if (poolAddress != ZeroAddress) return [poolAddress, Version.V2];

        factory = new ethers.Contract(FACTORY_V3, FactoryV3, this.provider);
        poolAddress = await factory.getPool(tokenAddress, WETH, 3000);

        return [poolAddress, Version.V3];
    }
}
