import { Web3ReactProvider } from '@web3-react/core'
import { connectors } from '../utils/connectors'
import CoinbaseWalletCard from '../views/CoinbaseWalletCard'
import GnosisSafeCard from '../views/GnosisSafeCard'
import MetaMaskCard from '../views/MetaMaskCard'
import NetworkCard from '../views/NetworkCard'
import SelectedConnectorCard from '../views/SelectedConnectorCard'
import WalletConnectCard from '../views/WalletConnectCard'

export default function Home() {
  const isDark = true

  return (
    <Web3ReactProvider connectors={connectors}>
      <div
        className="bg-gray-500"
        style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif', color: 'rgb(201, 209, 217' }}
      >
        <style jsx global>{`
          ${isDark ? 'body {background: rgb(3,4,11);}' : 'body {background: antiquewhite;}'}
        `}</style>
        <SelectedConnectorCard />
        <MetaMaskCard />
        <WalletConnectCard />
        <CoinbaseWalletCard />
        <NetworkCard />
        <GnosisSafeCard />
      </div>
    </Web3ReactProvider>
  )
}
