"use client"

import { SessionProvider } from "next-auth/react"
import React from "react"

export function SessionCustomProvider({children}:{children:React.ReactNode}){
    return <SessionProvider>{children}</SessionProvider>
}