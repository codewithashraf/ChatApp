import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
  } from "@headlessui/react";
  import {
    EllipsisVerticalIcon,
    LockClosedIcon,
    LockOpenIcon,
    ShieldCheckIcon,
    UserIcon,
  } from "@heroicons/react/24/solid";
  import axios from "axios";
  
  export default function UserOptionsDropDown({ conversation }) {
    const changeUserRole = () => {
      if (!conversation.is_user) return;
  
      axios
        .post(route("user.changeRole", conversation.id))
        .then((res) => console.log(res.data))
        .catch((err) => console.error(err));
    };
  
    const onBlockUser = () => {
      if (!conversation.is_user) return;
  
      axios
        .post(route("user.blockUnblock", conversation.id))
        .then((res) => console.log(res.data))
        .catch((err) => console.log(err));
    };
  
    return (
      <div>
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
                    onClick={onBlockUser}
                    className={`${
                      active
                        ? "bg-black/30 text-white"
                        : "text-gray-100"
                    } group flex w-full items-center rounded-md p-2 text-sm`}
                  >
                    {conversation.blocked_at ? (
                      <>
                        <LockOpenIcon className="w-4 h-4 mr-2" />
                        Unblock User
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-4 h-4 mr-2" />
                        Block User
                      </>
                    )}
                  </button>
                )}
              </MenuItem>
            </div>
  
            <div className="px-1 py-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={changeUserRole}
                    className={`${
                      active
                        ? "bg-black/30 text-white"
                        : "text-gray-100"
                    } group flex w-full items-center rounded-md p-2 text-sm`}
                  >
                    {conversation.is_admin ? (
                      <>
                        <UserIcon className="w-4 h-4 mr-2" />
                        Make Regular User
                      </>
                    ) : (
                      <>
                        <ShieldCheckIcon className="w-4 h-4 mr-2" />
                        Make Admin
                      </>
                    )}
                  </button>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>
    );
  }
  