/* eslint-disable react/no-unknown-property */
import { Web3ReactProvider } from '@web3-react/core'
import Head from 'next/head'

import NavBar from '../components/molecules/NavBar'
import CardContainer from '../components/organisms/CardContainer'
import { connectors } from '../utils/connectors'

export default function Home() {
  return (
    <>
      <style jsx global>{`
        ${'body {background: rgb(3,4,11);}'}
      `}</style>
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#EF1978" />
        <meta name="msapplication-TileColor" content="#EF1978" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <NavBar />
      <Web3ReactProvider connectors={connectors} lookupENS>
        <CardContainer />
      </Web3ReactProvider>
    </>
  )
}
