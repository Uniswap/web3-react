import * as React from 'react'
import { Head, Html, Main, default as NextDocument, NextScript } from 'next/document'

class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default Document
