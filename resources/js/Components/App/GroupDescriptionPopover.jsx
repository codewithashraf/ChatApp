import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ExclamationCircleIcon } from '@heroicons/react/24/solid'

import React from 'react'

const GroupDescriptionPopover = ({description}) => {
    return (
        <Popover className='relative'>

          <PopoverButton className="block text-sm/6 font-semibold text-white/50 focus:outline-none data-active:text-white data-focus:outline data-focus:outline-white data-hover:text-white">

            <ExclamationCircleIcon className='w-4' />
            
          </PopoverButton>

          <PopoverPanel
            transition
            // anchor="bottom"
            className="absolute -right-5 z-10 mt-3 w-[250px] sm:w-[300px] px-4 sm:px-0"
          >
            <div className='overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5'>
                <div className='bg-gray-800 p-4'>
                    <h2 className='text-lg mb-3'>
                        Description
                    </h2>

                    {description && (
                        <div className='text-xs'>
                            {description}
                        </div>
                    )}

                    {!description && (
                        <div className='text-xs text-gray-500 text-center py-4'>
                            No Description is defined
                        </div>
                    )}
                </div>
            </div>
          </PopoverPanel>
           
        </Popover>
      )
}

export default GroupDescriptionPopover