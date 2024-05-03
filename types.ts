import Token from 'class/Token';
import { HDNodeWallet, Wallet } from 'ethers';

enum Version {
    V2,
    V3,
}

enum Action {
    Buy,
    Sell,
}

type SwapRequest = {
    action: Action;
    amountIn: number;
    token: Token;
};

type ExactInputSingleParams = {
    tokenIn: string;
    tokenOut: string;
    fee: number;
    recipient: string;
    deadline: number;
    amountIn: string;
    amountOutMinimum: string;
    sqrtPriceLimitX96: number;
};

type Slot0 = {
    sqrtPriceX96: bigint;
    tick: bigint;
    observationIndex: bigint;
    observationCardinality: bigint;
    observationCardinalityNext: bigint;
    feeProtocol: bigint;
    unlocked: boolean;
};

type UserWallet = Wallet | HDNodeWallet;

export { Action, Version, SwapRequest, ExactInputSingleParams, Slot0, UserWallet };
