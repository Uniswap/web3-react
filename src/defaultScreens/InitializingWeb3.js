import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import QRCode from 'qrcode.react'

import Loader from './loader'
import { Connector, InjectedConnector, NetworkOnlyConnector, WalletConnectConnector } from '../connectors'
import Common, { Button, Text, Link } from './common'

import metamaskLogo from './assets/metamask.svg';
import infuraLogo from './assets/infura.svg';
import walletConnectLogo from './assets/walletConnect.svg';

Modal.defaultStyles.overlay.backgroundColor = 'rgba(0, 0, 0, .3)';

const greyTextColor = '#a3a5a8'

const mobilePixelCutoff = '600px'

const Container = styled.div`
  height: 75vh;

  @media (max-width: ${mobilePixelCutoff}) {
    width: 95%;
  }

  @media (max-width: 1000px) {
    width: 75%;
  }

  @media (min-width: 1000px) {
    width: 75%;
  }

  @media (min-width: 1200px) {
    width: 50%;
  }
`

const ConnectorWrapper = styled.div`
  display: flex;
  justify-content: center;
  background-color: white;
  width: 100%;
  border-radius: 1em;
  margin-bottom: 2em;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: ${mobilePixelCutoff}) {
    flex-direction: column;
  }
`

const ConnectorSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.justifyContent};
  flex-basis: ${props => props.percent};

  @media (max-width: ${mobilePixelCutoff}) {
    justify-content: center;
  }
`

const ConnectorButton = styled(Button)`
  margin-right: 1em;
  padding-left: 1.5em;
  padding-right: 1.5em;

  @media (max-width: ${mobilePixelCutoff}) {
    margin-right: 0em;
    margin-bottom: 1em;
  }
`

const WalletConnectButton = styled(Button)`
  min-width: 20%;
`

const ModalTitleText = styled(Text)`
  font-size: 1.5em;
  text-align: center;
  margin-top: 0;
`

const ExplanatoryText = styled(Text)`
  margin-right: 1em;
  font-size: .9em;
  font-weight: 500;
  color: ${greyTextColor}

  @media (max-width: ${mobilePixelCutoff}) {
    margin-top: 0;
    margin-right: 0;
    text-align: center;
  }
`

const Logo = styled.div`
  margin: 1em;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  height: 4em;
  min-width: 4em;
`

const MetamaskLogo = styled(Logo)`
  background-image: url(${metamaskLogo});
`

const InfuraLogo = styled(Logo)`
  background-image: url(${infuraLogo});
`

// '#4099FF'
const WalletConnectLogo = styled(Logo)`
  background-image: url(${walletConnectLogo});
`

const QRWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

function getDetails(connector) {
  if (connector instanceof InjectedConnector)
    return {
      logo: <MetamaskLogo />,
      text: (
        <>
          Connect to{' '}
          <Link href='https://metamask.io/' target='_blank' rel='noopener noreferrer'>MetaMask</Link>
          .
        </>
      ),
      buttonText: 'Connect to MetaMask'
    }
  if (connector instanceof NetworkOnlyConnector)
    return {
      logo: <InfuraLogo />,
      text: (
        <>
          Connect in read-only mode with{' '}
          <Link href='https://infura.io/' target='_blank' rel='noopener noreferrer'>Infura</Link>
          .
        </>
      ),
      buttonText: 'Connect'
    }
  if (connector instanceof WalletConnectConnector)
    return {
      logo: <WalletConnectLogo />,
      text: (
        <>
          Use{' '}
          <Link href='https://walletconnect.org/' target='_blank' rel='noopener noreferrer'>WalletConnect</Link>
          .
        </>
      ),
      buttonText: 'Use WalletConnect'
    }
}

const walletConnectModalStyles = {content: {
  top:         '50%',
  left:        '50%',
  right:       'auto',
  bottom:      'auto',
  marginRight: '-50%',
  transform:   'translate(-50%, -50%)',
  border:      'none'
}}

export default function InitializingWeb3 (
  { connectors, currentConnector, inAutomaticPhase, setConnector, unsetConnector }
) {
  const [URIAvailable, setURIAvailable] = useState(false)
  function URIAvailableHandler () {
    if (!URIAvailable) setURIAvailable(true)
  }

  useEffect(() => {
    if (currentConnector instanceof WalletConnectConnector) {
      currentConnector.on('URIAvailable', URIAvailableHandler)
      return () => currentConnector.removeListener('URIAvailable', URIAvailableHandler)
    }
  }, [currentConnector])

  if (inAutomaticPhase && currentConnector && !(currentConnector instanceof WalletConnectConnector))
    return null

  if (currentConnector && !(currentConnector instanceof WalletConnectConnector))
    return <Loader />

  if (currentConnector instanceof WalletConnectConnector && currentConnector.webConnector.isConnected)
     return <Loader />

  const walletConnectModalOpen =
    URIAvailable &&
    currentConnector instanceof WalletConnectConnector &&
    !currentConnector.webConnector.isConnected &&
    !!currentConnector.uri

  return (
    <Common>
      <Container>
        {Object.keys(connectors).map(c => {
          const connectorDetails = getDetails(connectors[c])
          return (
            <ConnectorWrapper key={c}>
              <ConnectorSection percent='20%' flexShrink='0'>
                {connectorDetails.logo}
              </ConnectorSection>
              <ConnectorSection percent='40%' justifyContent='flex-start' flexShrink='2'>
                <ExplanatoryText>
                  {connectorDetails.text}
                </ExplanatoryText>
              </ConnectorSection>
              <ConnectorSection percent='40%' justifyContent='flex-end' flexShrink='0' last={true}>
                <ConnectorButton onClick={() => setConnector(c)}>{connectorDetails.buttonText}</ConnectorButton>
              </ConnectorSection>
            </ConnectorWrapper>
          )
        })}
      </Container>

      <Modal
        isOpen={walletConnectModalOpen}
        style={walletConnectModalStyles}
        ariaHideApp={false}
        contentLabel="WalletConnect Modal"
      >
        <QRWrapper>
          <ModalTitleText>WalletConnect</ModalTitleText>
          {!!(currentConnector instanceof WalletConnectConnector) && currentConnector.uri &&
            <QRCode value={currentConnector.uri} level='L' size={250} />
          }
          <br />
          <WalletConnectButton onClick={unsetConnector}>Close</WalletConnectButton>
        </QRWrapper>
      </Modal>
    </Common>
  )
}

InitializingWeb3.propTypes = {
  connectors:       PropTypes.objectOf(PropTypes.instanceOf(Connector)).isRequired,
  currentConnector: PropTypes.instanceOf(Connector),
  inAutomaticPhase: PropTypes.bool.isRequired,
  setConnector:     PropTypes.func.isRequired,
  unsetConnector:   PropTypes.func.isRequired
}
