import { Connector } from "@web3-react/types";

import { LedgerConstructorArgs, LedgerOptions, LedgerProvider } from "./type";

export const URI_AVAILABLE = "URI_AVAILABLE";

function parseChainId(chainId: string | number) {
  return typeof chainId === "string" ? Number.parseInt(chainId, 16) : chainId;
}

const isLogActive = false;

export class Ledger extends Connector {
  private readonly connectKitPromise = this.loadConnectKit();
  private readonly defaultChainId: number = 1;
  private readonly options: LedgerOptions;
  private connectKit?: any;
  public provider?: LedgerProvider;

  constructor({ actions, options, onError }: LedgerConstructorArgs) {
    isLogActive && console.log("Ledger Connector Constructor: Initializing...");
    super(actions, onError);
    this.options = options;
  }

  private chainChangedListener = (chainId: string): void => {
    isLogActive &&
      console.log("chainChangedListener: Handling chain changed event...");
    this.actions.update({ chainId: Number.parseInt(chainId, 16) });
  };

  private accountsChangedListener = (accounts: string[]): void => {
    isLogActive &&
      console.log(
        "accountsChangedListener: Handling accounts changed event..."
      );
    this.actions.update({ accounts });
  };

  private async isomorphicInitialize() {
    console.group("isomorphicInitialize method");
    isLogActive && console.log("isomorphicInitialize: Loading provider...");
    try {
      if (this.provider) return this.provider;
      this.connectKit = await this.connectKitPromise;

      const {
        projectId,
        chains,
        optionalChains,
        requiredMethods,
        optionalMethods,
        requiredEvents,
        optionalEvents,
        rpcMap = {
          1: "https://cloudflare-eth.com/", // Mainnet
          5: "https://goerli.optimism.io/", // Goerli
          137: "https://polygon-rpc.com/", // Polygon
        },
      } = this.options;

      this.connectKit.checkSupport({
        providerType: "Ethereum",
        walletConnectVersion: 2,
        projectId,
        chains,
        optionalChains,
        methods: requiredMethods,
        optionalMethods,
        events: requiredEvents,
        optionalEvents,
        rpcMap,
      });
      this.connectKit.enableDebugLogs();

      const provider: LedgerProvider = (this.provider =
        (await this.connectKit.getProvider()) as LedgerProvider);
      provider.on("chainChanged", this.chainChangedListener);
      provider.on("accountsChanged", this.accountsChangedListener);

      return provider;
    } finally {
      console.groupEnd();
    }
  }

  private async loadConnectKit() {
    isLogActive && console.log("loadConnectKit: Loading Connect Kit...");

    const src = "https://statuesque-naiad-0cb980.netlify.app/umd/index.js";
    const globalName = "ledgerConnectKit";

    return new Promise((resolve, reject) => {
      const scriptId = `ledger-ck-script-${globalName}`;

      if (typeof window === "undefined" || !window.document) {
        reject("Connect Kit does not support server side");
        return;
      }

      if (document.getElementById(scriptId)) {
        resolve((window as { [key: string]: any })[globalName]);
      } else {
        const script = document.createElement("script");
        script.src = src;
        script.id = scriptId;
        script.addEventListener("load", () => {
          resolve((window as { [key: string]: any })[globalName]);
        });
        script.addEventListener("error", (e) => {
          reject(e.error);
        });
        document.head.appendChild(script);
      }
    });
  }

  async connectEagerly() {
    isLogActive && console.log("connectEagerly: Connecting eagerly...");

    try {
      this.provider = await this.isomorphicInitialize();
      if (!this.provider.session) {
        throw new Error("No active session found. Connect your wallet first.");
      }

      const [chainId, accounts] = await Promise.all([
        this.provider.request({ method: "eth_chainId" }) as Promise<string>,
        this.provider.request({ method: "eth_accounts" }) as Promise<string[]>,
      ]);

      this.actions.update({ chainId: parseChainId(chainId), accounts });
    } catch (error) {
      console.debug("connectEagerly: Could not connect eagerly", error);
      await this.deactivate();
    }
  }

  public async activate(
    desiredChainId: number = this.defaultChainId
  ): Promise<void> {
    console.group("activate method");
    isLogActive && console.group("activate: Activating...");

    try {
      this.provider = await this.isomorphicInitialize();

      const { request }: { request: any } = this.provider;

      if (this.provider.accounts?.length === 0) {
        const accounts = (await request({
          method: "eth_requestAccounts",
        })) as string[];

        const chainId = (await request({
          method: "eth_chainId",
        })) as string;

        this.actions.update({ chainId: parseChainId(chainId), accounts });
        return;
      }

      if (desiredChainId === this.provider.chainId) return;

      const isConnectedToDesiredChain =
        this.provider.session?.namespaces?.eip155.accounts.some(
          (account: string) => account.startsWith(`eip155:${desiredChainId}:`)
        );

      if (!isConnectedToDesiredChain) {
        if (this.options.optionalChains?.includes(desiredChainId)) {
          throw new Error(
            `Cannot activate an optional chain (${desiredChainId}), as the wallet is not connected to it.\n\tYou should handle this error in application code, as there is no guarantee that a wallet is connected to a chain configured in "optionalChains".`
          );
        }
        throw new Error(
          `Unknown chain (${desiredChainId}). Make sure to include any chains you might connect to in the "chains" or "optionalChains" parameters when initializing WalletConnect.`
        );
      }

      await request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + desiredChainId.toString(16) }],
      });

      this.actions.update({
        chainId: desiredChainId,
        accounts: this.provider.accounts,
      });
    } catch (error) {
      await this.deactivate();
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  async deactivate() {
    isLogActive && console.log("deactivate: Deactivating...");
    if (this.provider) {
      this.provider?.disconnect?.();
      this.provider = undefined;
    }
    this.actions.resetState();
  }
}
