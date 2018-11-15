import React from 'react'
import PropTypes from 'prop-types'
import ErrorTemplate from './template/ErrorTemplate'

function UnsupportedNetwork(props) {
  const { supportedNetworkNames } = props

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
  supportedNetworkNames: PropTypes.arrayOf(PropTypes.string).isRequired
}

export default UnsupportedNetwork
