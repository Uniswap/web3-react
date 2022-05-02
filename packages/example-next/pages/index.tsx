import CoinbaseWalletCard from '../components/connectors/CoinbaseWalletCard'
import GnosisSafeCard from '../components/connectors/GnosisSafeCard'
import MetaMaskCard from '../components/connectors/MetaMaskCard'
import NetworkCard from '../components/connectors/NetworkCard'
import WalletConnectCard from '../components/connectors/WalletConnectCard'
import ProviderExample from '../components/ProviderExample'

export default function Home() {
  return (
    <>
      <ProviderExample />
      <div style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif' }}>
        <MetaMaskCard />
        <WalletConnectCard />
        <CoinbaseWalletCard />
        <NetworkCard />
        <GnosisSafeCard />
      </div>
    </>
  )
}
