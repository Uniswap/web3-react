import React from 'react'
import ErrorTemplate from './template/ErrorTemplate'

export default function UnlockNeeded() {
  return (
    <ErrorTemplate
      title='Account Locked'
      message='Please unlock your MetaMask account or Ethereum wallet.'
    />
  )
}
