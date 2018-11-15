import React, { useState, useEffect } from 'react'
import './template/styles.css'

function LoadingIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 105 105" xmlns="http://www.w3.org/2000/svg" fill="#88c0d3">
      <circle cx="12.5" cy="12.5" r="12.5">
        <animate attributeName="fill-opacity"
          begin="0s" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite" />
      </circle>
      <circle cx="12.5" cy="52.5" r="12.5">
        <animate attributeName="fill-opacity"
          begin="100ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite" />
      </circle>
      <circle cx="52.5" cy="12.5" r="12.5">
        <animate attributeName="fill-opacity"
          begin="300ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite" />
      </circle>
      <circle cx="52.5" cy="52.5" r="12.5">
        <animate attributeName="fill-opacity"
          begin="600ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite" />
      </circle>
      <circle cx="92.5" cy="12.5" r="12.5">
        <animate attributeName="fill-opacity"
          begin="800ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite" />
      </circle>
      <circle cx="92.5" cy="52.5" r="12.5">
        <animate attributeName="fill-opacity"
          begin="400ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite" />
      </circle>
      <circle cx="12.5" cy="92.5" r="12.5">
        <animate attributeName="fill-opacity"
          begin="700ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite" />
      </circle>
      <circle cx="52.5" cy="92.5" r="12.5">
        <animate attributeName="fill-opacity"
          begin="500ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite" />
      </circle>
      <circle cx="92.5" cy="92.5" r="12.5">
        <animate attributeName="fill-opacity"
          begin="200ms" dur="1s"
          values="1;.2;1" calcMode="linear"
          repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

export default function Initializing () {
  const [loaderHidden, setLoaderHidden] = useState(true)

  useEffect(() => {
    const loaderTimer = setTimeout(() => setLoaderHidden(false), 1000)
    return () => clearTimeout(loaderTimer)
  }, [])

  return (
    <div className="wrapper">
      <div className={`loader ${loaderHidden ? 'hidden' : 'fadeIn'}`}>
        <LoadingIcon />
      </div>
    </div>
  )
}
