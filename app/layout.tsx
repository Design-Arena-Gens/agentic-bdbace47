import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meal Planner',
  description: 'Plan your meals and generate shopping lists',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
