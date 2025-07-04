import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";

function Edit({ mustVerifyEmail, status }) {
    return (
        <>
            <Head title="Profile" />

            <div className="py-12 overflow-y-auto">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </>
    );
}

Edit.layout = (page) => {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="sm:text-lg text-sm font-semibold leading-tight text-gray-50">
                    Profile
                </h2>
            }
        >{page}</AuthenticatedLayout>
    );
};

export default Edit;

