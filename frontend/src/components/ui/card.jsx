import * as React from "react"

export function Card({ className = "", ...props }) {
  return (
    <div
      className={`rounded-xl border bg-white shadow-sm ${className}`}
      {...props}
    />
  )
}

export function CardHeader({ className = "", ...props }) {
  return (
    <div className={`p-6 border-b ${className}`} {...props} />
  )
}

export function CardContent({ className = "", ...props }) {
  return <div className={`p-6 ${className}`} {...props} />
}

export function CardFooter({ className = "", ...props }) {
  return (
    <div className={`p-4 border-t ${className}`} {...props} />
  )
}
