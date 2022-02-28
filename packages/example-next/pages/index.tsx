import MetaMaskCard from '../components/connectors/MetaMaskCard'
import NetworkCard from '../components/connectors/NetworkCard'
import PriorityExample from '../components/connectors/PriorityExample'
import WalletConnectCard from '../components/connectors/WalletConnectCard'
import WalletLinkCard from '../components/connectors/WalletLinkCard'

export default function Home() {
  return (
    <>
      <PriorityExample />
      <div style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif' }}>
        <MetaMaskCard />
        <WalletConnectCard />
        <WalletLinkCard />
        <NetworkCard />
      </div>
    </>
  )
}
