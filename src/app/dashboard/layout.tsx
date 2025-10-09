import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardFooter from "@/components/dashboard/DashboardFooter";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token");

    if (!authToken || authToken.value !== "authenticated") {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
            <DashboardSidebar />
            <main className="pl-64 transition-all duration-300">
                <div className="fixed inset-0 -z-10 pl-64">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]" />
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
                </div>
                {children}
            </main>
            <DashboardFooter />
        </div>
    );
}