import GroupNotification from "@/Components/App/GroupNotification";
import NewMessageNotification from "@/Components/App/NewMessageNotification";
import NewUserModal from "@/Components/App/NewUserModal";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import PrimaryButton from "@/Components/PrimaryButton";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { useEventBus } from "@/EventBus";
import { UserPlusIcon } from "@heroicons/react/16/solid";
import { Link, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const conversations = usePage().props.conversations;

    const { emit } = useEventBus();

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const [showNewUserModal, setShowNewUserModal] = useState(false);

    const subscribedChannels = useRef(new Set());

    useEffect(() => {
        conversations.forEach((conversation) => {
            let channel = `message.group.${conversation.id}`;

            if (conversation.is_user) {
                channel = `message.user.${[
                    parseInt(user.id),
                    parseInt(conversation.id),
                ]
                    .sort((a, b) => a - b)
                    .join("-")}`;
            }

            subscribedChannels.current.add(channel);

            Echo.private(channel)
                .error((error) => {
                    console.log(error);
                })
                .listen("SocketMessage", (e) => {
                    console.log("Socket Event", e);
                    const message = e.message;

                    //if the conversation with the sender is not selected then show a notification
                    if (e.messageDeleted) {
                        emit("message.deleted", {
                            message: e.message,
                            prevMessage: e.lastMessage,
                        });
                        return;
                    }
                    emit("message.created", message);

                    if (message.sender_id === user.id) {
                        return;
                    }

                    emit("newMessageIds", message);

                    emit("newMessageNotification", {
                        user: message.sender,
                        group_id: message.group_id,
                        message:
                            message.message ||
                            `Shared ${
                                message.attachments.length === 1
                                    ? "an attachment"
                                    : message.attachments.length +
                                      " attachments"
                            }`,
                    });
                });

            if (conversation.is_group) {
                Echo.private(`group.deleted.${conversation.id}`)
                    .listen("DeleteGroupEvent", (e) => {
                        console.log("groupdeletd", e);
                        emit("group.deleted", { id: e.id, name: e.name });
                    })
                    .error((err) => {
                        console.log(err);
                    });

                Echo.private(`group.updated.${conversation.id}`)
                    .listen("CreateOrUpdateGroup", (e) => {
                        console.log("updated group", e);

                        if (e.group.owner_id != user.id) {
                            emit("update.users", {
                                removedUsers: Object.values(e.removedUsers),
                                addedUsers: Object.values(e.addedUsers),
                                groupId: e.group.id,
                                group: e.group,
                            });
                        } else {
                            emit(
                                "toast.show",
                                `"${e.group.name}" was updated 🎉`
                            );
                        }
                    })
                    .error((err) => {
                        console.log(err);
                    });
            }
        });

        return () => {
            console.log(
                "return call howa hai or sab channel delete hogaye hai"
            );
            subscribedChannels.current.forEach((channel) => {
                Echo.leave(channel);
            });
            subscribedChannels.current.clear();

            conversations.forEach((conversation) => {
                if (conversation.is_group) {
                    Echo.leave("group.deleted." + conversation.id);
                }
            });
        };
    }, [user.id]);

    return (
        <>
            <div className="min-h-screen h-[100dvh] flex flex-col ">
                <nav className="border-b border-gray-700">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex shrink-0 items-center">
                                    <Link href="/">
                                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-100" />
                                    </Link>
                                </div>

                                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                    <NavLink
                                        href={route("dashboard")}
                                        active={route().current("dashboard")}
                                    >
                                        Dashboard
                                    </NavLink>
                                </div>
                            </div>

                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                <div className="relative flex gap-2 ms-3">
                                    {user.is_admin && (
                                        <PrimaryButton
                                            onClick={(e) => {
                                                setShowNewUserModal(true);
                                            }}
                                        >
                                            <UserPlusIcon className="w-5 h-5 mr-4" />
                                            Add new user
                                        </PrimaryButton>
                                    )}

                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-md border border-transparent dark:bg-gray-950 px-3 py-2 text-sm font-medium leading-4 text-gray-100 transition duration-150 ease-in-out hover:text-gray-200 focus:outline-none"
                                                >
                                                    {user.name}

                                                    <svg
                                                        className="-me-0.5 ms-2 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link
                                                href={route("profile.edit")}
                                            >
                                                Profile
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                            >
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>

                            <div className="-me-2 flex items-center sm:hidden">
                                <button
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) => !previousState
                                        )
                                    }
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-100 transition duration-150 ease-in-out hover:bg-gray-900 hover:text-gray-300 focus:bg-gray-950 focus:text-gray-500 focus:outline-none"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            className={
                                                !showingNavigationDropdown
                                                    ? "inline-flex"
                                                    : "hidden"
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={
                                                showingNavigationDropdown
                                                    ? "inline-flex"
                                                    : "hidden"
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        className={
                            (showingNavigationDropdown ? "block" : "hidden") +
                            " sm:hidden"
                        }
                    >
                        <div className="space-y-1 pb-3 pt-2">
                            <ResponsiveNavLink
                                href={route("dashboard")}
                                active={route().current("dashboard")}
                            >
                                Dashboard
                            </ResponsiveNavLink>
                        </div>

                        <div className="border-t border-gray-200 pb-1 pt-4">
                            <div className="px-4">
                                <div className="text-base font-medium text-gray-100">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-indigo-100">
                                    {user.email}
                                </div>
                            </div>

                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route("profile.edit")}>
                                    Profile
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    method="post"
                                    href={route("logout")}
                                    as="button"
                                >
                                    Log Out
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </nav>

                {header && (
                    <header className="bg-gray-950 shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {children}
            </div>
            <NewMessageNotification />
            <GroupNotification />
            <NewUserModal
                show={showNewUserModal}
                onClose={(e) => setShowNewUserModal(false)}
            />
        </>
    );
}
