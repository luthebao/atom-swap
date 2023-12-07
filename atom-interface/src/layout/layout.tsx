import { Outlet } from "react-router-dom";
import Header from "./header2";
import { PROJECT_LOGO } from "../configs/projects";

export default function Layout() {
    return (
        <div className="!absolute !min-h-[100vh] w-full bg-[url(/images/swap-bg.png?v=006)] bg-cover bg-bottom bg-no-repeat bg-black">
            <Header />
            <main>
                <Outlet />
            </main>
            {/* <footer className="fixed bottom-0 left-0 z-20 w-full p-4 rounded-lg shadow md:px-6 md:py-8 ">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <a target="_blank" className="flex items-center mb-4 sm:mb-0">
                        <img {...PROJECT_LOGO} className="mr-4 h-8" />
                    </a>
                    <ul className="flex flex-wrap items-center mb-6 sm:mb-0">
                        <li>
                            <a href="#" className="mr-4 text-sm hover:underline md:mr-6 !text-gray-400">About</a>
                        </li>
                        <li>
                            <a href="#" className="mr-4 text-sm text-gray-500 hover:underline md:mr-6 !text-gray-400">Privacy
                                Policy</a>
                        </li>
                        <li>
                            <a href="#"
                                className="mr-4 text-sm text-gray-500 hover:underline md:mr-6 !text-gray-400">Licensing</a>
                        </li>
                        <li>
                            <a href="#" className="text-sm text-gray-500 hover:underline !text-gray-400">Contact</a>
                        </li>
                    </ul>
                </div>
                <hr className="my-6 border-gray-200 sm:mx-auto !border-gray-700 lg:my-8" />
                <span className="block text-sm text-gray-500 sm:text-center !text-gray-400">
                    © 2023
                    <a href="https://flowbite.com" target="_blank" className="hover:underline">
                        {PROJECT_LOGO.alt}
                    </a>.
                    All Rights Reserved.
                </span>
            </footer> */}
        </div>
    );
}
