import { Telegraf } from 'telegraf';
import { ethers, HDNodeWallet, JsonRpcProvider, Wallet } from 'ethers';
import dotenv from 'dotenv';

import { Action } from 'enum-types';

import Token from 'class/Token';
import Pool from 'class/Pool';
import Router from 'class/Router';

import { convertPrice, convertAmount } from 'utils';

dotenv.config();

const bot = new Telegraf(process.env.BOT_API as string);
const provider = new JsonRpcProvider(process.env.INFURA_API);

let wallet: HDNodeWallet | Wallet;

const privateKey = /(0x.{64})/m;
const address = /(0x.{40})/gm;

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
        `Your Address: \n\`${wallet.address}\` \nPrivate Key \n\`${wallet.privateKey}\``,
        { parse_mode: 'MarkdownV2' }
    );
});

bot.hears(privateKey, async (ctx) => {
    if (!wallet) return;

    wallet = new Wallet(ctx.message.text);
    ctx.sendMessage(`Your Address: \n\`${wallet.address}\``, { parse_mode: 'MarkdownV2' });
});

bot.command('/ether', async (ctx) => {
    const router = new Router(provider);

    const price = await router.getWETHPrice();

    ctx.sendMessage(price.toString());
});

bot.hears(address, async (ctx) => {
    const token = new Token(provider, ctx.message.text);
    await token.initialize();

    const pool = new Pool(provider, ctx.message.text);
    await pool.initialize();

    if (pool.address == ethers.ZeroAddress) {
        ctx.sendMessage('The bot cannot support this token');
        return;
    }

    const price = await pool.getPrice(Action.Buy, token);
    const balance = wallet ? await token.getBalance(wallet.address) : 0;
    const marketCap = await token.getMarketCap();
    const volume = await token.getVolumeLastHour();

    ctx.sendMessage(
        `Token - ${token.symbol} 
		\n${convertPrice(price)} WETH/${token.symbol} 
		\nMCap - ${convertAmount(marketCap)}
		\nLast Hour - ${volume}
		\nBalance - ${convertAmount(balance)} ${token.symbol}`
    );
});

bot.launch();
