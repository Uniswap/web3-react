import dynamic from 'next/dynamic'

export default dynamic(() => import('../components').then((m) => m.Connectors), { ssr: false })
