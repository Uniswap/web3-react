import { useRouter } from 'next/router'

const TITLE_WITH_TRANSLATIONS = {
  'en-US': 'React Hooks library for Ethereum',
}

const github = 'https://github.com/NoahZinsmeister/web3-react'

const FEEDBACK_LINK_WITH_TRANSLATIONS = {
  'en-US': 'Question? Give us feedback →',
}

export default {
  docsRepositoryBase: `${github}/tree/main/docs/pages`,
  feedbackLabels: 'feedback',
  feedbackLink: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { locale } = useRouter()
    return FEEDBACK_LINK_WITH_TRANSLATIONS[locale || 'en-US']
  },
  floatTOC: true,
  footerEditLink: `Edit this page on GitHub`,
  footerText: `MIT ${new Date().getFullYear()} © web3-react`,
  github,
  head: ({ title, meta }) => {
    return (
      <>
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta name="description" content={meta.description || 'React hooks for connecting wallets'} />
        <meta name="og:description" content={meta.description || 'React hooks for connecting wallets'} />
        <meta name="og:title" content={title ? title + ' – web3-react' : 'web3-react: React Hooks for connecting wallets'} />
      </>
    )
  },
  // i18n: [{ locale: 'en-US', text: 'English' }],
  logo: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { locale } = useRouter()
    return (
      <>
        <span className="mr-2 font-extrabold">web3-react</span>
        <span className="text-gray-600 font-normal hidden md:inline">{TITLE_WITH_TRANSLATIONS[locale || 'en-US']}</span>
      </>
    )
  },
  nextLinks: true,
  prevLinks: true,
  projectLink: github,
  search: true,
  titleSuffix: ' – web3-react',
  unstable_flexsearch: true,
}
