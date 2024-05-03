import { Contract, ethers, Interface, InterfaceAbi } from 'ethers';

import { UserWallet } from 'types';

export default async function sendTransaction(
    ABI: InterfaceAbi,
    contract: Contract,
    functionName: string,
    args: any[],
    wallet: UserWallet,
    value?: number
) {
    const fragment = contract.getFunction(functionName).fragment;

    const contractInterface = new Interface(ABI);
    const data = contractInterface.encodeFunctionData(fragment, args);

    const tx = {
        from: wallet.address,
        to: await contract.getAddress(),
        data,
        value: value ? ethers.parseEther(value.toString()) : 0,
    };

    await wallet.sendTransaction(tx);
}
