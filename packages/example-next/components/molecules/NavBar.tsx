import Button from '../atoms/Button'
import Image from 'next/image'
import uniswapLogo from '../../images/uniswap.png'

export default function NavBar() {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '100%',
        height: 64,
        display: 'inline-flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 12,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'nowrap',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <Image
          alt="Web3React logo"
          src={uniswapLogo}
          width={40}
          height={40}
          style={{ marginRight: 12, marginTop: -8 }}
        />
        <b style={{ fontSize: '2em', fontFamily: 'sans-serif', color: 'white' }}>Web3React</b>
        <b style={{ fontSize: '1em', fontFamily: 'sans-serif', color: 'white', marginTop: 12, marginLeft: 8 }}>v8</b>
      </div>
      <Button
        style={{ width: 100, height: 44 }}
        color={'rgba(255,0,122,0.15)'}
        borderColor={'rgba(255,0,122,0.4)'}
        onClick={() => {
          const newWindow = window.open('https://github.com/Uniswap/web3-react', '_blank', 'noopener,noreferrer')
          if (newWindow) newWindow.opener = null
        }}
      >
        Github
      </Button>
    </div>
  )
}
