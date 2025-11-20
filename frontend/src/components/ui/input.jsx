import React from 'react'
import { cn } from './utils'

const Input = React.forwardRef(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn('px-3 py-2 rounded-md border bg-input text-sm', className)} {...props} />
})

export { Input }


