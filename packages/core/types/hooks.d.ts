import type { Networkish } from '@ethersproject/networks';
import type { Web3Provider } from '@ethersproject/providers';
import type { Actions, Connector, Web3ReactState, Web3ReactStore } from '@web3-react/types';
import type { UseBoundStore } from 'zustand';
export declare type Web3ReactHooks = ReturnType<typeof getStateHooks> & ReturnType<typeof getDerivedHooks> & ReturnType<typeof getAugmentedHooks>;
export declare type Web3ReactSelectedHooks = ReturnType<typeof getSelectedConnector>;
export declare type Web3ReactPriorityHooks = ReturnType<typeof getPriorityConnector>;
export declare type Web3ReactHookValues = ReturnType<ReturnType<typeof getAugmentedHooks>["useWeb3React"]>;
/**
 * Wraps the initialization of a `connector`. Creates a zustand `store` with `actions` bound to it, and then passes
 * these to the connector as specified in `f`. Also creates a variety of `hooks` bound to this `store`.
 *
 * @typeParam T - The type of the `connector` returned from `f`.
 * @param f - A function which is called with `actions` bound to the returned `store`.
 * @param allowedChainIds - An optional array of chainIds which the `connector` may connect to. If the `connector` is
 * connected to a chainId which is not allowed, a ChainIdNotAllowedError error will be reported.
 * If this argument is unspecified, the `connector` may connect to any chainId.
 * @returns [connector, hooks, store] - The initialized connector, a variety of hooks, and a zustand store.
 */
export declare function initializeConnector<T extends Connector>(f: (actions: Actions) => T, allowedChainIds?: number[]): [T, Web3ReactHooks, Web3ReactStore];
/**
 * Creates a variety of convenience `hooks` that return data associated with a particular passed connector.
 *
 * @param initializedConnectors - Two or more [connector, hooks] arrays, as returned from initializeConnector.
 * @returns hooks - A variety of convenience hooks that wrap the hooks returned from initializeConnector.
 */
export declare function getSelectedConnector(...initializedConnectors: [Connector, Web3ReactHooks][]): {
    useSelectedChainId: (connector: Connector) => number | undefined;
    useSelectedAccounts: (connector: Connector) => string[] | undefined;
    useSelectedIsActivating: (connector: Connector) => boolean;
    useSelectedError: (connector: Connector) => Error | undefined;
    useSelectedAccount: (connector: Connector) => string | undefined;
    useSelectedIsActive: (connector: Connector) => boolean;
    useSelectedProvider: (connector: Connector, network?: Networkish | undefined) => Web3Provider | undefined;
    useSelectedENSNames: (connector: Connector, provider: Web3Provider | undefined) => (string | null)[] | undefined;
    useSelectedENSName: (connector: Connector, provider: Web3Provider | undefined) => string | null | undefined;
    useSelectedWeb3React: (connector: Connector, provider: Web3Provider | undefined) => {
        connector: Connector;
        library: Web3Provider | undefined;
        chainId: number | undefined;
        account: string | undefined;
        active: boolean;
        error: Error | undefined;
    };
};
/**
 * Creates a variety of convenience `hooks` that return data associated with the first of the `initializedConnectors`
 * that is active.
 *
 * @param initializedConnectors - Two or more [connector, hooks] arrays, as returned from initializeConnector.
 * @returns hooks - A variety of convenience hooks that wrap the hooks returned from initializeConnector.
 */
export declare function getPriorityConnector(...initializedConnectors: [Connector, Web3ReactHooks][]): {
    useSelectedChainId: (connector: Connector) => number | undefined;
    useSelectedAccounts: (connector: Connector) => string[] | undefined;
    useSelectedIsActivating: (connector: Connector) => boolean;
    useSelectedError: (connector: Connector) => Error | undefined;
    useSelectedAccount: (connector: Connector) => string | undefined;
    useSelectedIsActive: (connector: Connector) => boolean;
    useSelectedProvider: (connector: Connector, network?: Networkish | undefined) => Web3Provider | undefined;
    useSelectedENSNames: (connector: Connector, provider: Web3Provider | undefined) => (string | null)[] | undefined;
    useSelectedENSName: (connector: Connector, provider: Web3Provider | undefined) => string | null | undefined;
    useSelectedWeb3React: (connector: Connector, provider: Web3Provider | undefined) => {
        connector: Connector;
        library: Web3Provider | undefined;
        chainId: number | undefined;
        account: string | undefined;
        active: boolean;
        error: Error | undefined;
    };
    usePriorityConnector: () => Connector;
    usePriorityChainId: () => number | undefined;
    usePriorityAccounts: () => string[] | undefined;
    usePriorityIsActivating: () => boolean;
    usePriorityError: () => Error | undefined;
    usePriorityAccount: () => string | undefined;
    usePriorityIsActive: () => boolean;
    usePriorityProvider: (network?: Networkish | undefined) => Web3Provider | undefined;
    usePriorityENSNames: (provider: Web3Provider | undefined) => (string | null)[] | undefined;
    usePriorityENSName: (provider: Web3Provider | undefined) => string | null | undefined;
    usePriorityWeb3React: (provider: Web3Provider | undefined) => {
        connector: Connector;
        library: Web3Provider | undefined;
        chainId: number | undefined;
        account: string | undefined;
        active: boolean;
        error: Error | undefined;
    };
};
declare function getStateHooks(useConnector: UseBoundStore<Web3ReactState>): {
    useChainId: () => Web3ReactState['chainId'];
    useAccounts: () => Web3ReactState['accounts'];
    useIsActivating: () => Web3ReactState['activating'];
    useError: () => Web3ReactState['error'];
};
declare function getDerivedHooks({ useChainId, useAccounts, useIsActivating, useError }: ReturnType<typeof getStateHooks>): {
    useAccount: () => string | undefined;
    useIsActive: () => boolean;
};
declare function getAugmentedHooks<T extends Connector>(connector: T, { useChainId, useAccounts, useError }: ReturnType<typeof getStateHooks>, { useAccount, useIsActive }: ReturnType<typeof getDerivedHooks>): {
    useProvider: (network?: Networkish | undefined, enabled?: boolean) => Web3Provider | undefined;
    useENSNames: (provider: Web3Provider | undefined) => (string | null)[] | undefined;
    useENSName: (provider: Web3Provider | undefined) => (string | null) | undefined;
    useWeb3React: (provider: Web3Provider | undefined) => {
        connector: T;
        library: Web3Provider | undefined;
        chainId: number | undefined;
        account: string | undefined;
        active: boolean;
        error: Error | undefined;
    };
};
export {};
