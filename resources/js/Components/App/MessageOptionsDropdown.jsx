import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
  } from "@headlessui/react";
import { TrashIcon } from "@heroicons/react/16/solid";
  import {
    EllipsisVerticalIcon,
  } from "@heroicons/react/24/solid";

import axios from "axios";
import { useEventBus } from "@/EventBus";


  
  export default function MessageOptionsDropdown({ message }) {
    const { emit } = useEventBus();

    const onDeleteMessage = () => {
        console.log('Deleted message');

        axios.delete(route('message.destory', message.id))
        .then((res) => {
            emit('message.deleted', {message, prevMessage: res.data.message});
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        })
    }
  
    return (
      <div className="text-gray-100 absolute right-full top-1/2 -translate-y-1/2">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="flex justify-center items-center md:w-8 sm:w-4 h-8 rounded-full hover:bg-black/40">
              <EllipsisVerticalIcon className="h-5 w-5 text-white" />
            </MenuButton>
          </div>
  
          <MenuItems
            anchor="bottom end"
            className="absolute right-0 mt-2 w-48 rounded-md bg-gray-700 shadow-lg z-50"
          >
            <div className="px-1 py-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={onDeleteMessage}
                    className={`${
                      active
                        ? "bg-black/30 text-white"
                        : "text-gray-100"
                    } group flex w-full items-center rounded-md p-2 text-sm`}
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete Message
                  </button>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>
    );
  }
  