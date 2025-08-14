import { kebabCase } from 'case-anything'
import React from 'react'

import { Toaster } from 'sonner'
import frogIcon from '@/assets/icons/read-frog.png'
import { APP_NAME } from '@/utils/constants/app'

import './style.css'

const frogIconElement = <img src={frogIcon} alt="🐸" />

function FrogToast(props: React.ComponentProps<typeof Toaster>) {
  return (
    <Toaster
      {...props}
      richColors
      icons={{
        warning: frogIconElement,
        success: frogIconElement,
        error: frogIconElement,
        info: frogIconElement,
        loading: frogIconElement,
      }}
      toastOptions={{
        className: `${kebabCase(APP_NAME)}-toaster`,
      }}
      className="z-[2147483647] notranslate"
    />
  )
}

export default FrogToast
