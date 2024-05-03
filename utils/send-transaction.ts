import {
    Contract,
    HDNodeWallet,
    Interface,
    InterfaceAbi,
    TransactionRequest,
    Wallet,
} from 'ethers';

export default async function sendTransaction(
    ABI: InterfaceAbi,
    contract: Contract,
    functionName: string,
    args: any[],
    wallet: Wallet | HDNodeWallet
) {
    const fragment = contract.getFunction(functionName).fragment;

    const contractInterface = new Interface(ABI);
    const data = contractInterface.encodeFunctionData(fragment, args);

    const tx = {
        from: wallet.address,
        to: await contract.getAddress(),
        data,
    };

    await wallet.sendTransaction(tx);
}
