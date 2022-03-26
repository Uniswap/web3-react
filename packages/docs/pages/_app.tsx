/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import '../styles/globals.css'
import 'nextra-theme-docs/style.css'

export default function Nextra({ Component, pageProps }: { Component: any, pageProps: any }) {
  const getLayout = Component.getLayout || ((page: any) => page)
  return getLayout(<Component {...pageProps} />)
}
