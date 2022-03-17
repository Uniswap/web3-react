import React from 'react';
import type { Web3ReactHooks } from './hooks';
import { Connector } from '@web3-react/types';
export declare function Web3ReactProvider({ children, connectors, }: {
    children: React.ReactNode;
    connectors: [Connector, Web3ReactHooks][];
}): JSX.Element;
export declare function useWeb3React(): {
    chainId: number;
};
export declare function Test({ children }: {
    children: React.ReactNode;
}): JSX.Element;
