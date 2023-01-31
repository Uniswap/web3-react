import { memo, useEffect, useRef, useState } from 'react'
import { renderIcon } from '@download/blockies'

function Blockies({ account, diameter, alt }: { account: string; diameter: number; alt?: string }) {
  const [dataUrl, setDataUrl] = useState<string>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    renderIcon({ seed: account.toLowerCase() }, canvas)
    const updatedDataUrl = canvas.toDataURL()

    if (updatedDataUrl !== dataUrl) {
      setDataUrl(updatedDataUrl)
    }
  }, [dataUrl, account])

  return (
    <div
      style={{ borderRadius: diameter, overflow: 'hidden', height: diameter, minWidth: diameter, marginRight: '0.5em' }}
    >
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {dataUrl ? <img src={dataUrl} style={{ height: diameter, width: diameter }} alt={alt || ''} /> : null}
    </div>
  )
}

export default memo(Blockies)
