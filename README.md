# Uniswap bot on Telegram
The bot was created to buy/sell Uniswap tokens from Telegram messenger. It can show you info about any token on V2 or V3 if you send an `address` of a token.
Soon it will have an implementation of auto buy/sell.
## Commands
- /start - will show you greeting message and ask you to provide a `privateKey` or generate a new `wallet`.
- /balance - will show WETH, ETH balances of a current wallet.
  - you can `deposit` ETH -> WETH or `withdraw` WETH -> ETH.
- sending an address will provoke a function and you will receive information about the token: symbol, price, MCap, your balance (also could include last hour volume).
  - you can pick wheneter you want to `buy` or `sell` token and then pick amount: 25%, 50%, 75%, 100%.
