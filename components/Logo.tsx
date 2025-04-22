import Link from 'next/link'
import React from 'react'

interface LogoProps{
    white?:boolean
}
const Logo = ({white}:LogoProps) => {
  return (
    <div className="flex-shrink-0">
  <Link href="/" className="flex items-center gap-2 group transition-all duration-300 ">
    {/* Logo Text */}
    <span className="flex flex-col leading-none">
      <span className={`font-amiri text-2xl font-bold ${white?"text-white group-hover:text-white":"text-gray-800 group-hover:text-gray-900"} transition-colors`}>
        متجر
        <span className="text-primary ml-1 font-extrabold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
          عبدالله
        </span>
      </span>
     
    </span>
  </Link>
</div>
  )
}

export default Logo