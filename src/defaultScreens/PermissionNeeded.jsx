import React from 'react'
import ErrorTemplate from './template/ErrorTemplate'

export default function PermissionNeeded() {
  return (
    <ErrorTemplate
      title='Permission Needed'
      message='Please grant this site access to your MetaMask account or Ethereum wallet.'
    />
  )
}
