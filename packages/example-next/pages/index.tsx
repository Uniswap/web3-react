import { Web3ReactProvider } from '@web3-react/core'
import { connectors } from '../utils/connectors'
import SelectedConnectorCard from '../views/SelectedConnectorCard'
import MetaMaskCard from '../views/MetaMaskCard'
import CoinbaseWalletCard from '../views/CoinbaseWalletCard'
import WalletConnectCard from '../views/WalletConnectCard'
import GnosisSafeCard from '../views/GnosisSafeCard'
import NetworkCard from '../views/NetworkCard'

export default function Home() {
  return (
    <Web3ReactProvider connectors={connectors}>
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
        <NetworkCard />
      </div>
    </Web3ReactProvider>
  )
}
