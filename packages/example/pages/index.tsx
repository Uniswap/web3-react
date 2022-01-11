import dynamic from 'next/dynamic'

export default dynamic(() => import('../App'), { ssr: false })
