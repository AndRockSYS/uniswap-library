import { Contract, ethers, JsonRpcProvider } from 'ethers';

import { ROUTER_V2, WETH, USDT } from '../addresses.json';

import RouterV2 from '../ABI/UniswapV2/Router.json';

export default class Router {
    routerV2: Contract;

    constructor(provider: JsonRpcProvider) {
        this.routerV2 = new Contract(ROUTER_V2, RouterV2, provider);
    }

    async getWETHPrice(): Promise<number> {
        const amounts: bigint[] = await this.routerV2.getAmountsOut(ethers.parseEther('1'), [
            WETH,
            USDT,
        ]);

        return Number(amounts[1]) / 10 ** 6;
    }
}
