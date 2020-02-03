import App from 'next/app'
import Head from 'next/head'

import '../styles.css'

export default class Root extends App {
  render() {
    const { Component } = this.props

    return (
      <>
        <Head>
          <title>web3-react example</title>
        </Head>

        <Component />
      </>
    )
  }
}
