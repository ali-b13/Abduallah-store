'use client'

import { ChevronDown } from 'lucide-react'
import { SelectHTMLAttributes, useState } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string; icon?: React.ReactNode }[]
  className?: string
}

export function Select({ options, className, ...props }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find(opt => opt.value === props.value)

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon}
          <span className="text-gray-700">{selectedOption?.label}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  if (props.onChange) {
                    props.onChange({
                      target: { value: option.value }
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                  setIsOpen(false)
                }}
                className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {option.icon}
                <span className="text-gray-700">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden native select for form compatibility */}
      <select
        {...props}
        className="absolute opacity-0 w-0 h-0"
        aria-hidden="true"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}