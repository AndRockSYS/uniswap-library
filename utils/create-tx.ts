import { Contract, Interface, InterfaceAbi, TransactionRequest } from 'ethers';

export default async function createTransaction(
    ABI: InterfaceAbi,
    contract: Contract,
    functionName: string,
    args: any[],
    from: string
): Promise<TransactionRequest> {
    const fragment = contract.getFunction(functionName).fragment;

    const contractInterface = new Interface(ABI);
    const data = contractInterface.encodeFunctionData(fragment, args);

    return {
        from,
        to: await contract.getAddress(),
        data,
    };
}
