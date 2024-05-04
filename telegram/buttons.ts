const generateWallet = { text: 'Create new wallet', callback_data: 'generator' };

const buyTokens = { text: 'Buy', callback_data: 'buy' };
const sellTokens = { text: 'Sell', callback_data: 'sell' };

const withdrawWETH = { text: 'Withdraw WETH', callback_data: 'withdraw-weth' };
const depositETH = { text: 'Deposit ETH', callback_data: 'deposit-eth' };

function getPercentageKeyboard(addressOrSymbol: string): {
    text: string;
    callback_data: string;
}[][] {
    return [
        [
            { text: '25%', callback_data: `${addressOrSymbol} 0.25` },
            { text: '50%', callback_data: `${addressOrSymbol} 0.5` },
        ],
        [
            { text: '75%', callback_data: `${addressOrSymbol} 0.75` },
            { text: '100%', callback_data: `${addressOrSymbol} 1` },
        ],
    ];
}

export { generateWallet, buyTokens, sellTokens, withdrawWETH, depositETH, getPercentageKeyboard };
