import { Contract, ethers, JsonRpcProvider } from 'ethers';

import { Action, Version, SwapRequest, ExactInputSingleParams } from 'types';

import Pool from 'class/Pool';
import Token from 'class/Token';

import { ROUTER_V2, ROUTER_V3, WETH, USDT } from 'addresses';

import RouterV2ABI from 'ABI/UniswapV2/Router.json';
import RouterV3ABI from 'ABI/UniswapV3/Router.json';

import { calculateAmounts } from 'utils';

export default class Router {
    provider: JsonRpcProvider;

    routerV2: Contract;
    routerV3: Contract;

    constructor(provider: JsonRpcProvider) {
        this.provider = provider;

        this.routerV2 = new Contract(ROUTER_V2, RouterV2ABI, provider);
        this.routerV3 = new Contract(ROUTER_V3, RouterV3ABI, provider);
    }

    async getWETHPrice(): Promise<number> {
        const amounts: bigint[] = await this.routerV2.getAmountsOut(ethers.parseEther('1'), [
            WETH,
            USDT,
        ]);

        return parseFloat(ethers.formatUnits(amounts[1], 6));
    }

    async swapTokensForWETH(request: SwapRequest, pool: Pool, sender: string) {
        const token: Token = request.token;

        const deadline = Date.now() + 30_000;
        const [amountIn, amountOut] = await calculateAmounts(request, pool);

        if (request.action == Action.Sell) await token.approve(pool.address, amountIn);

        if (pool.version == Version.V2) {
            request.action == Action.Buy
                ? await this.routerV2.swapExactETHForTokens(
                      amountOut,
                      [WETH, token.address],
                      sender,
                      deadline,
                      { value: amountIn }
                  )
                : await this.routerV2.swapExactTokenForETH(
                      amountIn,
                      amountOut,
                      [token.address, WETH],
                      sender,
                      deadline
                  );
        } else {
            const params: ExactInputSingleParams = {
                tokenIn: request.action == Action.Buy ? WETH : token.address,
                tokenOut: request.action == Action.Sell ? token.address : WETH,
                fee: 3000,
                recipient: sender,
                deadline,
                amountIn,
                amountOutMinimum: amountOut,
                sqrtPriceLimitX96: 0,
            };

            await this.routerV3.exactInputSingle(params);
        }
    }
}
