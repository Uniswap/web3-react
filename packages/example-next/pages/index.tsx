import CoinbaseWalletCard from '../components/connectors/CoinbaseWalletCard'
import MetaMaskCard from '../components/connectors/MetaMaskCard'
import NetworkCard from '../components/connectors/NetworkCard'
import PriorityExample from '../components/connectors/PriorityExample'
import WalletConnectCard from '../components/connectors/WalletConnectCard'
import { Test, useWeb3React, Web3ReactProvider } from '@web3-react/core'
import connectors from '../connectors'

export default function Home() {
  return (
    <>
      {/* <Test> */}
      {/* <Web3ReactProvider connectors={connectors}> */}
      <PriorityExample />
      <div style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif' }}>
        <MetaMaskCard />
        <WalletConnectCard />
        <CoinbaseWalletCard />
        <NetworkCard />

        <Test>Hey!</Test>
      </div>
      {/* </Web3ReactProvider> */}
      {/* </Test> */}
    </>
  )
}
