import { useState } from 'react'
import { Connector } from '@web3-react/types'
import { useWeb3React } from '@web3-react/core'
import { cardanoMainChainId, ethMainChainId, solMainChainId, tronMainChainId } from '../../config/chains/chainIds'
import { cardanoConnectors, evmConnectors, solanaConnectors, tronConnectors } from '../../utils/connectors'
import { getImageUrlFromTrust } from '../../utils/helpers'
import BscWalletCard from './connectorCards/BscWalletCard'
import CoinbaseWalletCard from './connectorCards/CoinbaseWalletCard'
import GnosisSafeCard from './connectorCards/GnosisSafeCard'
import MetaMaskCard from './connectorCards/MetaMaskCard'
import NamiWalletCard from './connectorCards/NamiWalletCard'
import NetworkCard from './connectorCards/NetworkCard'
import PhantomWalletCard from './connectorCards/PhantomWalletCard'
import PortisWalletCard from './connectorCards/PortisWalletCard'
import SelectedConnectorCard from './connectorCards/SelectedConnectorCard'
import SolflareWalletCard from './connectorCards/SolflareWalletCard'
import TronLinkCard from './connectorCards/TronLinkCard'
import WalletConnectCard from './connectorCards/WalletConnectCard'
import YoroiWalletCard from './connectorCards/YoroiWalletCard'
import Tabs from '../molecules/Tabs'

const tabIndex = {
  ALL: 0,
  EVM: 1,
  Cardano: 2,
  Solana: 3,
  Tron: 4,
}
const tabTitles = ['All', 'EVM', 'Cardano', 'Solana', 'Tron']
const tabChainIds = [
  0,
  ethMainChainId, // Using ETH icon for all EVMs
  cardanoMainChainId,
  solMainChainId,
  tronMainChainId,
]

export default function CardContainer() {
  const { setSelectedConnector } = useWeb3React()

  const [selectedIndex, setSelectedIndex] = useState<number>(tabIndex.ALL)

  const handleSelectedIndex = (index: number) => {
    let connector: Connector

    if (!tabChainIds[index]) {
      setSelectedConnector()
    } else if (tabChainIds[index] === ethMainChainId) {
      connector = evmConnectors.find(([connector]) => !!connector.getState().accounts.length)?.[0]
    } else if (tabChainIds[index] === cardanoMainChainId) {
      connector = cardanoConnectors.find(([connector]) => !connector.getState().accounts.length)?.[0]
    } else if (tabChainIds[index] === solMainChainId) {
      connector = solanaConnectors.find(([connector]) => !connector.getState().accounts.length)?.[0]
    } else if (tabChainIds[index] === tronMainChainId) {
      connector = tronConnectors.find(([connector]) => !connector.getState().accounts.length)?.[0]
    }

    setSelectedConnector(connector)
    setSelectedIndex(index)
  }

  const hideEVM = ![tabIndex.ALL, tabIndex.EVM].includes(selectedIndex)
  const hideCardano = ![tabIndex.ALL, tabIndex.Cardano].includes(selectedIndex)
  const hideSolana = ![tabIndex.ALL, tabIndex.Solana].includes(selectedIndex)
  const hideTron = ![tabIndex.ALL, tabIndex.Tron].includes(selectedIndex)

  return (
    <div>
      <Tabs
        data={tabTitles.map((title, index) => ({
          title,
          iconUrl: index === 0 ? undefined : getImageUrlFromTrust(tabChainIds[index]),
        }))}
        selectedIndex={selectedIndex}
        setSelectedIndex={handleSelectedIndex}
      />
      <div
        className="bg-gray-500"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(20em, 1fr))',
          fontFamily: 'sans-serif',
          color: 'rgb(201, 209, 217',
        }}
      >
        <SelectedConnectorCard hide={false} />

        <NetworkCard hide={hideEVM} />
        <MetaMaskCard hide={hideEVM} />
        <CoinbaseWalletCard hide={hideEVM} />
        <WalletConnectCard hide={hideEVM} />
        <GnosisSafeCard hide={hideEVM} />
        <PortisWalletCard hide={hideEVM} />
        <BscWalletCard hide={hideEVM} />

        <YoroiWalletCard hide={hideCardano} />
        <NamiWalletCard hide={hideCardano} />

        <PhantomWalletCard hide={hideSolana} />
        <SolflareWalletCard hide={hideSolana} />

        <TronLinkCard hide={hideTron} />
      </div>
    </div>
  )
}
