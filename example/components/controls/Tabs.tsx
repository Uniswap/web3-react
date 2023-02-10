import Image from 'next/image'

import Button from './Button'

export default function Tabs({
  data,
  selectedIndex,
  setSelectedIndex,
}: {
  data: { title: string; iconUrl?: string }[]
  selectedIndex: number
  setSelectedIndex: (index: number) => void
}) {
  return data?.length ? (
    <div
      style={{
        width: '100%',
        height: 44,
        display: 'inline-flex',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {data.map((tab, index) => (
        <Button
          key={tab.title}
          style={{
            height: 44,
            minWidth: 100,
            marginLeft: 8,
            marginRight: 8,
            color: selectedIndex === index ? 'rgba(0, 0, 0, 0.8)' : 'white',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          color={selectedIndex === index ? 'rgba(255, 255, 255, 0.8)' : 'transparent'}
          borderColor="transparent"
          onClick={() => setSelectedIndex(index)}
        >
          <>
            {tab?.iconUrl && (
              <Image
                alt={`${tab.title} Logo`}
                width={24}
                height={24}
                style={{
                  width: 24,
                  height: 24,
                  marginRight: 12,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  boxShadow:
                    'rgb(0 0 0 / 50%) 0px 0px 6px 0px, rgb(255 255 255 / 12%) 0px 0px 0px 1px, rgb(0 0 0 / 20%) 1px 1px 1px',
                }}
                src={tab?.iconUrl ?? ''}
              />
            )}
            {tab.title}
          </>
        </Button>
      ))}
    </div>
  ) : null
}
