import React, { memo } from 'react'
import PropTypes from 'prop-types'
import ErrorTemplate from './template/ErrorTemplate'

function Web3Error(props) {
  const { error } = props

  return (
    <ErrorTemplate
      title='Web3 Error'
      message={error.toString()}
    />
  )
}

Web3Error.propTypes = {
  error: PropTypes.object.isRequired
}

export default memo(Web3Error)
