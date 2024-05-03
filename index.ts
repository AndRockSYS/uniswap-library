import { Telegraf } from 'telegraf';
import { ethers, JsonRpcProvider, Wallet } from 'ethers';
import dotenv from 'dotenv';

import Token from 'class/Token';
import Pool from 'class/Pool';
import WETHToken from 'class/WETHToken';

import { Action, UserWallet } from 'types';

import { convertPrice, convertAmount, getETHPrice, getETHBalance } from 'utils';

import * as buttons from 'telegram/buttons';

dotenv.config();

const bot = new Telegraf(process.env.BOT_API as string);
const provider = new JsonRpcProvider(process.env.INFURA_API);

const WETH = new WETHToken(provider);

let wallet: UserWallet;

const privateKey = /(0x.{64})/m;
const address = /(0x.{40})/gm;

// todo: check approve, check swap, deposit eth, withdraw weth

bot.start((ctx) => {
    ctx.sendMessage('Welcome to the trading bot! \nProvide a private key or generate a new one.', {
        reply_markup: {
            inline_keyboard: [[buttons.generateWallet]],
        },
    });
});

bot.action('generator', async (ctx) => {
    ctx.deleteMessage();

    wallet = Wallet.createRandom(provider);
    ctx.sendMessage(
        `Your Address \n\`${wallet.address}\` \nPrivate Key \n\`${wallet.privateKey}\``,
        { parse_mode: 'MarkdownV2' }
    );
});

bot.hears(privateKey, async (ctx) => {
    if (!wallet) return;

    wallet = new Wallet(ctx.message.text, provider);
    ctx.sendMessage(`Your Address: \n\`${wallet.address}\``, { parse_mode: 'MarkdownV2' });
});

bot.hears(address, async (ctx) => {
    const token = new Token(provider, ctx.message.text);
    await token.setTokenInfo();

    const pool = new Pool(provider, ctx.message.text);
    await pool.setPoolVersion();

    if (pool.address == ethers.ZeroAddress) {
        ctx.sendMessage('The bot does not support this token');
        return;
    }

    const tokenPrice = await pool.getPrice(Action.Buy, token);
    const ETHPrice = await getETHPrice(provider);

    const balance = wallet ? await token.getBalance(wallet.address) : 0;
    const marketCap = await token.getMarketCap();

    const walletBalance = wallet ? await getETHBalance(provider, wallet.address) : 0;

    ctx.sendMessage(
        `Token - ${token.symbol} 
		\n${convertPrice(tokenPrice * ETHPrice)} USDT/${token.symbol} 
		\nMCap - ${convertAmount(marketCap)}
		\nBalance - ${convertAmount(balance)} ${token.symbol}
		${walletBalance > 0 ? '' : '\nFund your wallet to Buy / Sell tokens'}`,
        walletBalance > 0
            ? {
                  reply_markup: {
                      inline_keyboard: [
                          [buttons.buyTokens],
                          balance > 0 ? [buttons.sellTokens] : [],
                      ],
                  },
              }
            : {}
    );
});

bot.action(['buy', 'sell'], async (ctx) => {
    //todo add buy / sell specific amount of tokens
});

bot.command('ether', async (ctx) => {
    const price = await getETHPrice(provider);
    ctx.sendMessage(`ETH price - ${price.toFixed(2)}`);
});

bot.command('balance', async (ctx) => {
    if (!wallet) {
        ctx.sendMessage(`You dont have an account`, {
            reply_markup: {
                inline_keyboard: [[buttons.generateWallet]],
            },
        });
        return;
    }

    const WETHBalance = await WETH.getBalance(wallet.address);
    const ETHBalance = await getETHBalance(provider, wallet.address);

    let reply = [];

    if (ETHBalance == 0) reply.push([buttons.depositETH]);
    if (WETHBalance == 0) reply.push([buttons.withdrawWETH]);

    ctx.sendMessage(
        `Your balances \n${convertAmount(WETHBalance)} WETH \n${convertAmount(ETHBalance)} ETH`,
        {
            reply_markup: {
                inline_keyboard: reply,
            },
        }
    );
});

bot.action('withdraw-weth', async (ctx) => {
    await ctx.answerCbQuery();

    ctx.sendMessage('Enter the amount you want to withdraw', {
        reply_markup: {
            force_reply: true,
            input_field_placeholder: 'Amount',
        },
    });
    //todo add convert to ether to the address
});

bot.action('deposit-eth', async (ctx) => {
    //todo add convert from eth to weth to the address
});

bot.catch((err, ctx) => {
    ctx.sendMessage(`An error occured \n${err}`);
});

bot.launch();
