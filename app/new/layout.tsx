import type React from "react"
import { Header } from "../../components/new/header"

export default function NewLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}
