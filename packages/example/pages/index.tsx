import dynamic from 'next/dynamic'
import { NetworkCard } from '../components/connectors/Network'

const MetaMaskCard = dynamic(() => import('../components/connectors/MetaMask'), { ssr: false })
const WalletConnectCard = dynamic(() => import('../components/connectors/WalletConnect'), { ssr: false })
const WalletLinkCard = dynamic(() => import('../components/connectors/WalletLink'), { ssr: false })

export default function Home() {
  return (
    <div style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif' }}>
      <MetaMaskCard />
      <WalletConnectCard />
      <WalletLinkCard />
      <NetworkCard />
    </div>
  )
}
