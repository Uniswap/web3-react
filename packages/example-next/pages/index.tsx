import { Web3ReactProvider } from '@web3-react/core'
import { connectors } from '../utils/connectors'
import SelectedConnectorCard from '../components/cards/SelectedConnectorCard'
import MetaMaskCard from '../components/cards/MetaMaskCard'
import CoinbaseWalletCard from '../components/cards/CoinbaseWalletCard'
import WalletConnectCard from '../components/cards/WalletConnectCard'
import GnosisSafeCard from '../components/cards/GnosisSafeCard'
import BscWalletCard from '../components/cards/BscWalletCard'
import PortisWalletCard from '../components/cards/PortisWalletCard'
import TronLinkCard from '../components/cards/TronLinkCard'
import NetworkCard from '../components/cards/NetworkCard'

export default function Home() {
  return (
    <Web3ReactProvider connectors={connectors} lookupENS subscribe>
      <div
        className="bg-gray-500"
        style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif', color: 'rgb(201, 209, 217' }}
      >
        <style jsx global>{`
          ${'body {background: rgb(3,4,11);}'}
        `}</style>
        <SelectedConnectorCard />
        <MetaMaskCard />
        <CoinbaseWalletCard />
        <WalletConnectCard />
        <GnosisSafeCard />
        <BscWalletCard />
        <PortisWalletCard />
        <TronLinkCard />
        <NetworkCard />
      </div>
    </Web3ReactProvider>
  )
}
