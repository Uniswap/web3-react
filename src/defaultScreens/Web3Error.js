import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Connector, InjectedConnector } from '../connectors'
import error from './assets/error.svg';
import Common, { Text, Button } from './common'
import { getNetworkName } from '../utilities'

const Logo = styled.div`
  margin: 1em;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  height: 6em;
  width: 6em;
`

const ErrorLogo = styled(Logo)`
  background-image: url(${error});
`

const ResetButton = styled(Button)`
  margin: 1em;
  padding: 1em;
`

const ErrorWrapper = styled.div`
  justify-content: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 95vh;
  width: 90%;
`

const ErrorText = styled(Text)`
  text-align: center;
  font-size: 2em;
  margin-bottom: 1em;
`

export default function Web3Error ({ error, currentConnector, unsetConnector }) {
  console.error(currentConnector.constructor.name, 'threw an error.') // eslint-disable-line no-console
  console.error(error) // eslint-disable-line no-console

  const getErrorMessage = () => {
    if (currentConnector instanceof InjectedConnector) {
      if (error.code === InjectedConnector.errorCodes.ETHEREUM_ACCESS_DENIED)
        return 'Unlock your MetaMask Account to Continue.'
      if (error.code === InjectedConnector.errorCodes.NO_WEB3)
        return 'No Web3 Provider Found.'
      if (error.code === InjectedConnector.errorCodes.UNSUPPORTED_NETWORK) {
        const supportedNetworkNames = currentConnector.supportedNetworks.map(networkId => getNetworkName(networkId))
        const message = supportedNetworkNames.length === 1 ?
          `the '${supportedNetworkNames[0]}' network` :
          `one of the following networks: '${supportedNetworkNames.join("', '")}'`
        return `Please connect to ${message}.`
      }
    }

    return 'An unexpected error occurred. Please try again.'
  }

  return (
    <Common>
      <ErrorWrapper>
        <ErrorLogo></ErrorLogo>
        <ErrorText>{getErrorMessage()}</ErrorText>
        <ResetButton onClick={() => unsetConnector()}>Reset</ResetButton>
      </ErrorWrapper>
    </Common>
  )
}

Web3Error.propTypes = {
  error:            PropTypes.any,
  currentConnector: PropTypes.instanceOf(Connector),
  unsetConnector:   PropTypes.func.isRequired
}
