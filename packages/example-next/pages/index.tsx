import CoinbaseWalletCard from '../components/connectors/CoinbaseWalletCard'
import MetaMaskCard from '../components/connectors/MetaMaskCard'
import NetworkCard from '../components/connectors/NetworkCard'
import PriorityExample from '../components/connectors/PriorityExample'
import WalletConnectCard from '../components/connectors/WalletConnectCard'
import { Web3ReactProvider } from '@web3-react/core'
import connectors from '../connectors'

export default function Home() {
  return (
    <>
      <Web3ReactProvider connectors={connectors}>
      <PriorityExample />
      <div style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif' }}>
        <MetaMaskCard />
        <WalletConnectCard />
        <CoinbaseWalletCard />
        <NetworkCard />
      </div>
      </Web3ReactProvider>
    </>
  )
}
