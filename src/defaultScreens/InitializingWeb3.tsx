import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import QRCode from 'qrcode.react'

import Loader from './loader'
import { Connector, MetaMaskConnector, InfuraConnector, WalletConnectConnector } from '../connectors'
import Common, { Button, ButtonLink, Text, Link } from './common'
import { Connectors } from '../types'

import metamaskLogo from './assets/metamask.svg'
import infuraLogo from './assets/infura.svg'
import walletConnectLogo from './assets/walletConnect.svg'

Modal.defaultStyles!.overlay!.backgroundColor = 'rgba(0, 0, 0, .3)';
const greyTextColor = '#a3a5a8'
const mobilePixelCutoff = '600px'

const Container = styled.div`
  margin: 2em;

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

const ConnectorSection: any = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${(props: any) => props.justifyContent};
  flex-basis: ${(props: any) => props.percent};

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

const ConnectorButtonLink = styled(ButtonLink)`
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

const WalletConnectLogo = styled(Logo)`
  background-image: url(${walletConnectLogo});
`

const QRWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

interface connectorDetails {
  logo: any
  text: any
  buttonText: string
}

function getDetails(connector: Connector): connectorDetails {
  if (connector instanceof MetaMaskConnector)
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
  if (connector instanceof InfuraConnector)
    return {
      logo: <InfuraLogo />,
      text: (
        <>
          View with{' '}
          <Link href='https://infura.io/' target='_blank' rel='noopener noreferrer'>Infura</Link>
          .
        </>
      ),
      buttonText: 'View'
    }

  if (!(connector instanceof WalletConnectConnector))
    throw Error('Unsupported connector.')

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

interface URIState { available: boolean, uri: undefined | string }
const initialURIState: URIState = { available: false, uri: undefined }

interface InitializingWeb3Interface {
  inAutomaticPhase: boolean
  connectors: Connectors
  setConnector: Function
}

export default function InitializingWeb3 ({ inAutomaticPhase, connectors, setConnector }: InitializingWeb3Interface) {
  const [showLoader, setShowLoader] = useState(false)
  const [URIState, setURIState] = useState(initialURIState)

  const activeTimeouts: React.MutableRefObject<Array<number>> = useRef([])

  useEffect(() => () => activeTimeouts.current.forEach(t => window.clearTimeout(t)), [])

  if (inAutomaticPhase) return <Loader />

  function ActivatedHandler () {
    activeTimeouts.current = activeTimeouts.current.slice().concat([window.setTimeout(() => setShowLoader(true), 150)])
  }
  function URIAvailableHandler (connector: Connector, URI: string) {
    if (connector.webConnector.isConnected)
      ActivatedHandler()
    else
      setURIState({ available: true, uri: URI })
  }
  function toggleURIVisibility () { setURIState({ available: !URIState.available, uri: URIState.uri }) }

  useEffect(() => {
    const cleanup: Array<Function> = []
    for (const connector of Object.keys(connectors).map(k => connectors[k])) {
      if (connector instanceof MetaMaskConnector || connector instanceof InfuraConnector) {
        connector.on('Activated', ActivatedHandler)
        cleanup.push(() => connector.removeListener('Activated', ActivatedHandler))
      }
      else if (connector instanceof WalletConnectConnector) {
        connector.on('URIAvailable', (URI: string) => URIAvailableHandler(connector, URI))
        cleanup.push(() => connector.removeListener('URIAvailable', URIAvailableHandler))
      }
    }
    if (cleanup.length > 0) return () => cleanup.forEach(c => c())
  }, [])

  function handleClick (connectorName: string) {
    if (connectors[connectorName] instanceof WalletConnectConnector && URIState.uri)
      toggleURIVisibility()
    else
      setConnector(connectorName)
  }

  return showLoader ? <Loader /> :
    <Common>
      <Container>
        {Object.keys(connectors).map(c => {
          const connectorDetails = getDetails(connectors[c])
          return (
            <ConnectorWrapper key={c}>
              <ConnectorSection percent='20%'>
                {connectorDetails.logo}
              </ConnectorSection>
              <ConnectorSection percent='40%' justifyContent='flex-start'>
                <ExplanatoryText>
                  {connectorDetails.text}
                </ExplanatoryText>
              </ConnectorSection>
              <ConnectorSection percent='40%' justifyContent='flex-end'>
                {connectors[c].redirectTo ?
                  <ConnectorButtonLink href={connectors[c].redirectTo} target='_blank' rel='noopener noreferrer'>
                    {connectorDetails.buttonText}
                  </ConnectorButtonLink>
                  :
                  <ConnectorButton onClick={() => handleClick(c)}>{connectorDetails.buttonText}</ConnectorButton>
                }
              </ConnectorSection>
            </ConnectorWrapper>
          )
        })}
      </Container>

      {URIState.available &&
        <Modal
          isOpen={true}
          style={walletConnectModalStyles}
          ariaHideApp={false}
          contentLabel="WalletConnect Modal"
        >
          <QRWrapper>
            <ModalTitleText>WalletConnect</ModalTitleText>
            <QRCode value={URIState.uri as string} level='L' size={250} />
            <br />
            <WalletConnectButton onClick={toggleURIVisibility}>Close</WalletConnectButton>
          </QRWrapper>
        </Modal>
      }
    </Common>
}

InitializingWeb3.propTypes = {
  inAutomaticPhase: PropTypes.bool.isRequired,
  connectors:       PropTypes.objectOf(PropTypes.object).isRequired,
  connectorName:    PropTypes.string,
  connector:        PropTypes.object,
  setConnector:     PropTypes.func.isRequired,
  unsetConnector:   PropTypes.func.isRequired
}
