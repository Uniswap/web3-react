import { ThemeProvider } from 'degen'
import Head from 'next/head'
import type { AppProps } from 'next/app'

import '../styles/globals.css'
import 'nextra-theme-docs/style.css'

const App = ({ Component, pageProps }: AppProps) => {
  const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('theme') as any) : undefined
  const defaultMode = ['dark', 'light'].includes(savedTheme) ? savedTheme : undefined
  return (
    <>
      <ThemeProvider defaultMode={defaultMode}>
        <Component {...pageProps} />
      </ThemeProvider>

      <Head>
        {/* Set theme directly to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){try{var d=document.documentElement;var e=localStorage.getItem('theme');if(e){d.setAttribute('data-theme',e.trim())}else{d.setAttribute('data-theme','light');}}catch(t){}}();`,
          }}
          key="theme-script"
        />
      </Head>
    </>
  )
}

export default App
