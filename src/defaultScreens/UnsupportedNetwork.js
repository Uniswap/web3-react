import React from 'react'
import PropTypes from 'prop-types'
import ErrorTemplate from './template/ErrorTemplate'
import { getNetworkName } from '../web3Utilities'

function UnsupportedNetwork(props) {
  const { supportedNetworkIds } = props

  const supportedNetworkNames = supportedNetworkIds.map(networkId => getNetworkName(networkId))
  const message = supportedNetworkNames.length === 1 ?
    `the '${supportedNetworkNames[0]}' network.` :
    `one of the following supported networks: '${supportedNetworkNames.join("', '")}'.`

  return (
    <ErrorTemplate
      title='Unsupported Network'
      message={`Please connect your MetaMask account or Ethereum wallet to ${message}`}
    />
  )
}

UnsupportedNetwork.propTypes = {
  supportedNetworkIds: PropTypes.arrayOf(PropTypes.number).isRequired
}

export default UnsupportedNetwork
