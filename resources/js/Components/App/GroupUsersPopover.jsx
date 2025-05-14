import { UserIcon } from "@heroicons/react/24/solid";
import { Link } from "@inertiajs/react";
import UserAvatar from "./UserAvatar";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";

export default function GroupUsersPopover ({ users = [] }){
    return (
        <Popover className='relative'>

          <PopoverButton className="text-gray-400 hover:text-gray-200">

            <UserIcon className='w-4' />
            
          </PopoverButton>

          <PopoverPanel
            transition
            // anchor="bottom"
            className="absolute right-0 z-10 mt-3 w-[220px] px-4 sm:px-0 "
          >
            <div className='overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5'>
                <div className='bg-gray-800 py-2'>
                    {users.map((user) => (
                        <Link
                            href={route('chat.user', user.id)}
                            key={user.id}
                            className="flex items-center gap-2 py-2 px-3 hover:bg-black/30"
                        >
                            <UserAvatar user={user} />
                            <div className="text-xs">
                                {user.name}
                            </div>
                        </Link>    
                    ))}
                </div>
            </div>
          </PopoverPanel>
           
        </Popover>
    );
}