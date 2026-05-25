import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  const data = readFileSync(join(process.cwd(), 'src/app/Big_C_mini_logo.png'))
  const src = `data:image/png;base64,${data.toString('base64')}`

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src={src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>,
    size,
  )
}
