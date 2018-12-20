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

export default function Web3Error (
  { error, connectorName, connector, unsetConnector }:
  { error: Error, connectorName: string, connector: Connector, unsetConnector: Function }
) {
  console.error(`The ${connectorName}' connector threw an error.`) // eslint-disable-line no-console
  console.error(error) // eslint-disable-line no-console

  const getErrorMessage = () => {
    if (error.code === InjectedConnector.errorCodes.ETHEREUM_ACCESS_DENIED)
      return 'Grant access to continue.'
    if (error.code === InjectedConnector.errorCodes.NO_WEB3)
      return 'No Web3 Provider Found.'
    if (error.code === InjectedConnector.errorCodes.LEGACY_PROVIDER)
      return 'Update your legacy Web3 Provider.'
    if (error.code === InjectedConnector.errorCodes.UNLOCK_REQUIRED)
      return 'Unlock your Ethereum Account.'
    if (error.code === Connector.errorCodes.UNSUPPORTED_NETWORK) {
      const supportedNetworkNames = connector.supportedNetworks!.map((networkId: number) => getNetworkName(networkId))
      const message = supportedNetworkNames.length === 1 ?
        `the '${supportedNetworkNames[0]}' network` :
        `one of the following networks: '${supportedNetworkNames.join("', '")}'`
      return `Please connect to ${message}.`
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
  error:          PropTypes.any,
  connectorName:  PropTypes.string,
  connector:      PropTypes.object,
  setConnector:   PropTypes.func.isRequired,
  unsetConnector: PropTypes.func.isRequired
}
