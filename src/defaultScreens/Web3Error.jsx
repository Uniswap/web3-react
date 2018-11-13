import React from 'react'
import PropTypes from 'prop-types'
import ErrorTemplate from './template/ErrorTemplate'

function Web3Error(props) {
  return (
    <ErrorTemplate
      title='Web3 Error'
      message={props.error.toString()}
    />
  )
}

Web3Error.propTypes = {
  error: PropTypes.object.isRequired
}

export default Web3Error
