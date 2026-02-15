import React from 'react'
import {motion, AnimatePresence} from 'framer-motion'

const ResponsiveMenu = ({open}) => {
  return (<AnimatePresence mode='wait'>
      {
        open && (
            <motion.div
            initial={{opacity: 0, y: -100}}
            animate={{opacity:1, y: 0}}
            exit={{opacity:0, y:-100}}
            transition={{duration: 0.3}}
            className='absolute top-20 left-0 w-full z-20'
            >
                <div className='text-xl font-semibold uppercase py-10 m-6 rounded-3xl bg-[#0057a8] text-white'>
                    <ul className='flex flex-col justify-center items-center gap-10 cursor-pointer'>
                        <li><a href="/">Home</a></li>
                        <li><a href="/about">About</a></li>
                        <li><a href="/product">Product</a></li>
                        <li><a href="/explore">Explore</a></li>
                    </ul>
                </div>
            </motion.div>
        )
      }
    </AnimatePresence>
  )
}

export default ResponsiveMenu
