import { Telegraf } from 'telegraf';
import { ethers, HDNodeWallet, JsonRpcProvider, Wallet } from 'ethers';
import dotenv from 'dotenv';

import Token from 'class/Token';
import Pool from 'class/Pool';

import { Action } from 'types';

import { convertPrice, convertAmount, getETHPrice } from 'utils';

import { WETH } from 'addresses';

dotenv.config();

const bot = new Telegraf(process.env.BOT_API as string);
const provider = new JsonRpcProvider(process.env.INFURA_API);

let wallet: HDNodeWallet | Wallet;

const privateKey = /(0x.{64})/m;
const address = /(0x.{40})/gm;

// todo: check approve, check swap

bot.start((ctx) => {
    ctx.sendMessage('Welcome to the trading bot! \nProvide a private key or generate a new one.', {
        reply_markup: {
            inline_keyboard: [[{ text: 'Create new wallet', callback_data: 'generator' }]],
        },
    });
});

bot.action('generator', async (ctx) => {
    await ctx.answerCbQuery();

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
    const volume = await token.getVolumeLastHour();

    ctx.sendMessage(
        `Token - ${token.symbol} 
		\n${convertPrice(tokenPrice * ETHPrice)} USDT/${token.symbol} 
		\nMCap - ${convertAmount(marketCap)}
		\nLast Hour - ${volume}
		\nBalance - ${convertAmount(balance)} ${token.symbol}`
    );
});

bot.command('ether', async (ctx) => {
    const price = await getETHPrice(provider);
    ctx.sendMessage(`ETH price - ${price.toFixed(2)}`);
});

bot.command('balance', async (ctx) => {
    if (!wallet) {
        ctx.sendMessage(`You dont have an account`, {
            reply_markup: {
                inline_keyboard: [[{ text: 'Create new wallet', callback_data: 'generator' }]],
            },
        });
        return;
    }

    const WETHToken = new Token(provider, WETH);
    await WETHToken.setTokenInfo();

    const balance = await WETHToken.getBalance(wallet.address);

    ctx.sendMessage(`Your balance \n${balance} WETH`, {
        reply_markup: {
            inline_keyboard: [[{ text: 'Convert to ETH', callback_data: 'convert-to-eth' }]],
        },
    });
});

bot.action('convert-to-ether', async (ctx) => {
    //todo add convert to ether to the address
});

bot.catch((err, ctx) => {
    ctx.sendMessage(`An error occured \n${err}`);
});

bot.launch();
