import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const backgroundColor = '#474c56'
export const linkColor = '#6498ea'
const linkColorHover = '#77a8f4'
const greyTextColor = '#a3a5a8'

const Background = styled.div`
  width: 100%;
  min-width: 100vw;
  height: 100%;
  min-height: 100vh;
  display: block;
`

const FlexWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

const Body = styled.div`
  display: flex;
  background-color: ${backgroundColor};
  flex-direction: column;
  flex-grow: 1;
  flexShrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 100%;
`

const Footer = styled.div`
  display: flex;
  background-color: ${backgroundColor};
  flex-shrink: 0;
`

export const Text = styled.p`
  font-size: .9em;
  font-weight: 500;
  color: ${greyTextColor}
`

export const Button = styled.button`
  border-radius: 1em;
  border: none;
  outline: none;
  background-color: ${linkColor};
  padding-top: 1em;
  padding-bottom: 1em;
  font-size: .9em;
  font-weight: 600;
  color: white;
  cursor: pointer;

  &:hover {
    box-shadow: rgba(50, 50, 93, 0.11) 0px 4px 6px 0px, rgba(0, 0, 0, 0.08) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 0px 1px 0px inset;
    transition: all 0.15s ease 0s;
    background-color: ${linkColorHover};
  }
`

export const ButtonLink = styled.a`
  text-decoration: none;

  border-radius: 1em;
  border: none;
  outline: none;
  background-color: ${linkColor};
  padding-top: 1em;
  padding-bottom: 1em;
  font-size: .9em;
  font-weight: 600;
  color: white;
  cursor: pointer;

  &:hover {
    box-shadow: rgba(50, 50, 93, 0.11) 0px 4px 6px 0px, rgba(0, 0, 0, 0.08) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 0px 1px 0px inset;
    transition: all 0.15s ease 0s;
    background-color: ${linkColorHover};
  }
`

const CreditText = styled(Text)`
  font-size: 1em;
  font-family: monospace;
  margin-left: auto;
  margin-right: 0;
  margin-top: auto;
  margin-bottom: 0;
  padding: .75em
`

export const Link = styled.a`
  color: ${linkColor};
  text-decoration: none;

  &:hover {
    color: ${linkColorHover};
  }
`

function Base ({ children }: { children: any }): any {
  return (
    <Background>
      <FlexWrapper>
        <Body>
          {children}
        </Body>

        <Footer>
          <CreditText>
            Powered by{' '}
            <Link href='https://github.com/NoahZinsmeister/web3-react' target='_blank' rel='noopener noreferrer'>
             web3-react
            </Link>
            .
          </CreditText>
        </Footer>
      </FlexWrapper>
    </Background>
  )
}

Base.propTypes = {
  children: PropTypes.any
}

export default Base
