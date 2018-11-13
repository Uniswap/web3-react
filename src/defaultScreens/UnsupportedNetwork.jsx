import React from 'react'
import PropTypes from 'prop-types'
import ErrorTemplate from './template/ErrorTemplate'

function UnsupportedNetwork(props) {
  const message = props.supportedNetworkNames.length === 1 ?
    `the '${props.supportedNetworkNames[0]}' network.` :
    `one of the following supported networks: '${props.supportedNetworkNames.join("', '")}'.`

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
