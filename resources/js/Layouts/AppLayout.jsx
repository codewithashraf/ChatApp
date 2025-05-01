// resources/js/Layouts/AppLayout.jsx

import AuthenticatedLayout from "./AuthenticatedLayout";
import ChatLayout from "./ChatLayout";


export default function AppLayout({ children }) {
  return (
    <AuthenticatedLayout>
      <ChatLayout>{children}</ChatLayout>
    </AuthenticatedLayout>
  );
}

