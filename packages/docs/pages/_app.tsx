import type { AppProps } from 'next/app'

import '../styles/globals.css'
import 'nextra-theme-docs/style.css'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Component {...pageProps} />
    </>
  )
}

export default App
