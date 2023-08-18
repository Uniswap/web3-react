import { initializeConnector } from "@web3-react/core";
import { Ledger } from "@web3-react/ledger";

import { MAINNET_CHAINS } from "../chains";

const [mainnet, ...optionalChains] = Object.keys(MAINNET_CHAINS).map(Number);

export const [ledger, hooks] = initializeConnector<Ledger>(
  (actions) =>
    new Ledger({
      actions,
      options: {
        projectId: process.env.walletConnectProjectId,
        chains: [mainnet],
        optionalChains,
      },
    })
);
