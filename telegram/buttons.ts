const generateWallet = { text: 'Create new wallet', callback_data: 'generator' };

const buyTokens = { text: 'Buy', callback_data: 'buy' };
const sellTokens = { text: 'Sell', callback_data: 'sell' };

const withdrawWETH = { text: 'Withdraw WETH', callback_data: 'withdraw-weth' };
const depositETH = { text: 'Deposit ETH', callback_data: 'deposit-eth' };

function getPercentageKeyboard(
    addressOrSymbol: string,
    action?: string
): {
    text: string;
    callback_data: string;
}[][] {
    return [
        [
            { text: '25%', callback_data: `${addressOrSymbol} 0.25 ${action}` },
            { text: '50%', callback_data: `${addressOrSymbol} 0.5 ${action}` },
        ],
        [
            { text: '75%', callback_data: `${addressOrSymbol} 0.75 ${action}` },
            { text: '100%', callback_data: `${addressOrSymbol} 1 ${action}` },
        ],
    ];
}

export { generateWallet, buyTokens, sellTokens, withdrawWETH, depositETH, getPercentageKeyboard };
