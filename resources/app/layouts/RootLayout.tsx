import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

export default function RootLayout(props: { children?: ReactNode }) {
    return (
        <main className="flex">
            <Sidebar />
            <div className="flex-1 p-4 ml-64 text-gray-700">
                {props.children}
                <Outlet />
            </div>
        </main>
    );
}
