import { useForm, usePage } from "@inertiajs/react";
import InputError from "../InputError";
import InputLabel from "../InputLabel";
import { useEventBus } from "@/EventBus";
import { useEffect, useState } from "react";
import Modal from "../Modal";
import SecondaryButton from "../SecondaryButton";
import PrimaryButton from "../PrimaryButton";
import TextInput from "../TextInput";
import TextAreaInput from "./TextAreaInput";
import UserPicker from "./UserPicker";

export default function GroupModel({ show = false, onClose = () => {} }) {
    const page = usePage();
    const conversations = page.props.conversations;
    const { emit, on } = useEventBus();
    const [group, setGroup] = useState({});

    const { data, setData, processing, reset, post, put, errors } = useForm({
        id: "",
        name: "",
        description: "",
        user_ids: [],
    });

    const users = conversations.filter((c) => !c.is_group);

    const createOrUpdateGroup = (e) => {
        e.preventDefault();

        if (group.id) {
            put(route("group.update", group.id), {
                onSuccess: () => {
                    closeModel();
                    // emit("toast.show", `Group "${data.name}" was updated`);
                },
            });
            return;
        }
        post(route("group.store"), {
            onSuccess: () => {
                emit("toast.show", `Group "${data.name}" was created`);
                closeModel();
            },
        });
    };

    const closeModel = () => {
        reset();
        onClose();
    };

    useEffect(() => {
        return on("GroupModel.show", (group) => {
            setData({
                name: group.name,
                description: group.description,
                user_ids: group.users
                    .filter((user) => group.owner_id !== user.id)
                    .map((user) => user.id),
            });
            setGroup(group);
        });
    }, [on]);

    return (
        <Modal show={show} onClose={closeModel}>
            <form
                onSubmit={createOrUpdateGroup}
                className="p-6 overflow-y-auto dark:bg-gray-900"
            >
                <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                    {group.id ? `Edit group ${group.name}` : "Create new group"}
                </h2>

                <div className="mt-8">
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full dark:bg-gray-950 dark:text-gray-100"
                        value={data.name}
                        disabled={!!group.id}
                        onChange={(e) => setData("name", e.target.value)}
                        required
                        isFocused
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="description" value="Description" />

                    <TextAreaInput
                        id="description"
                        rows="3"
                        className="mt-1 block w-full dark:bg-gray-950 dark:text-gray-100"
                        value={data.description || ""}
                        onChange={(e) => setData("description", e.target.value)}
                    />

                    <InputError className="mt-2" message={errors.description} />
                </div>

                <div className="mt-4">
                    <InputLabel value="Select Users" />

                    <UserPicker
                        value={
                            users.filter(
                                (user) =>
                                    group.owner_id !== user.id &&
                                    data.user_ids.includes(user.id)
                            ) || []
                        }
                        options={users}
                        onSelect={(users) => {
                            setData(
                                'user_ids',
                                users.map((u) => u.id)
                            )
                        }}
                    />

                    <InputError className="mt-2" message={errors.user_ids} />
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={closeModel}>
                        Cancel
                    </SecondaryButton>

                    <PrimaryButton className="ms-3" disabled={processing}>
                        {group.id ? "Update" : "Create"}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
