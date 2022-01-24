import dynamic from 'next/dynamic'

const PriorityExample = dynamic(() => import('../components/connectors/PriorityExample'), { ssr: false })

const MetaMaskCard = dynamic(() => import('../components/connectors/MetaMask'), { ssr: false })
const WalletConnectCard = dynamic(() => import('../components/connectors/WalletConnect'), { ssr: false })
const WalletLinkCard = dynamic(() => import('../components/connectors/WalletLink'), { ssr: false })
const NetworkCard = dynamic(() => import('../components/connectors/Network'), { ssr: false })

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
