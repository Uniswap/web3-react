export default function Button({
  color,
  children,
  style,
  disabled,
  onClick,
  ...rest
}: {
  color?: string
  children: JSX.Element | string
  style?: React.CSSProperties
  onClick: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        textTransform: 'uppercase',
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? 'auto' : 'pointer',
        color: 'rgb(201, 209, 217)',
        height: '34px',
        borderWidth: '1px',
        borderRadius: '17px',
        borderColor: disabled ? 'black' : 'rgba(56, 139, 253, 0.4)',
        backgroundColor: disabled ? 'rgba( 100, 100, 100, 0.5)' : color ?? 'rgba(56, 139, 253, 0.15)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
