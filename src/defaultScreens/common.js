import React from 'react'
import styled from 'styled-components'

const backgroundColor = '#474c56'
export const linkColor = '#6498ea'
const linkColorHover = '#77a8f4'
const greyTextColor = '#a3a5a8'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 95vh;
  min-width: 100vw;
  background: ${backgroundColor};
`

const Footer = styled.div`
  display: flex;
  background: ${backgroundColor};
  min-height: 5vh;
`

export const Text = styled.p`
  font-size: .9em;
  font-weight: 500;
  color: ${greyTextColor}
`

export const Button = styled.button`
  border-radius: 1em;
  border: none;
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

export default function Loader ({ children }) {
  return (
    <>
      <Wrapper>
        {children}
      </Wrapper>

      <Footer>
        <CreditText>
          Powered by{' '}
          <Link href='https://github.com/NoahZinsmeister/web3-react' target='_blank' rel='noopener noreferrer'>
           web3-react
          </Link>
          .
        </CreditText>
      </Footer>
    </>
  )
}
