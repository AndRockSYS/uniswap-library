import { Telegraf } from 'telegraf';
import { HDNodeWallet, JsonRpcProvider, Wallet } from 'ethers';
import dotenv from 'dotenv';

import Token from './class/Token';

dotenv.config();

const bot = new Telegraf(process.env.BOT_API as string);
const provider = new JsonRpcProvider(process.env.INFURA_API);

let wallet: HDNodeWallet | Wallet;

const privateKey = /(0x.{64})/m;
const address = /(0x.{40})/gm;

bot.start((ctx) => {
    ctx.sendMessage(
        'Welcome to the bot! Provide a private key or a new wallet will be generated.',
        {
            reply_markup: {
                inline_keyboard: [[{ text: 'Create new wallet', callback_data: 'generator' }]],
            },
        }
    );
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

bot.hears(address, async (ctx) => {
    const token = new Token(provider, ctx.message.text);

    ctx.sendMessage(`${await token.symbol()} ${await token.decimals()}`);
});

bot.launch();
