import { withTheme } from '@material-ui/core/styles';
import { PROJECT_LOGO } from '../configs/projects';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdMenu, MdOutlineClose, MdSwapCalls } from "react-icons/md";
import { GiLiquidSoap, GiPadlock } from "react-icons/gi";
import { BsFillRocketTakeoffFill } from "react-icons/bs";
import { useState } from 'react';
import { IconType } from 'react-icons';

interface MenuItem {
    title: string,
    id: string,
    link: string
    other: string[]
    icon?: any
    childrens?: {
        title: string,
        id: string,
        link: string
    }[]
}

const pages: MenuItem[] = [
    // {
    //     title: "Home",
    //     id: "home",
    //     link: "https://zkline.finance/",
    //     other: []
    // },
    {
        title: "Trade",
        id: "trade",
        link: "swap",
        other: ["swap", "liquidity", "pair"],
        childrens: [
            {
                title: "Swap",
                id: "swap",
                link: "swap",
            },
            {
                title: "Liquidity",
                id: "liquidity",
                link: "liquidity",
            },
        ]
    },
    {
        title: "Launchpad",
        id: "launchpad",
        link: "launchpad",
        other: ["launchpad", "locker"],
        childrens: [
            {
                title: "Launchpad",
                id: "launchpad",
                link: "launchpad",
            },
            {
                title: "Token Lock",
                id: "lock",
                link: "locker",
            },
        ]
    },
    {
        title: "Earn",
        id: "earn",
        link: "earn",
        other: ["earn", "earn", "earn"],
        childrens: [
            {
                title: "Coming soon",
                id: "earn1",
                link: "swap",
            },
        ]
    },
    {
        title: "Bridge",
        id: "bridge",
        link: "https://scroll.io/bridge/",
        other: []
    },
];

function Header() {
    const [menuOpen, setMenuOpen] = useState<boolean>(false)
    const [dropdown, setDropdown] = useState<string>("")
    const navigate = useNavigate()
    const location = useLocation()
    const goTo = (v: string) => {
        if (v.includes("http")) {
            window.open(v, "_blank", "noreferrer")
        } else {
            navigate(v)
        }
        setMenuOpen(false)
    }

    return (
        <div>
            <nav className="relative px-4 py-4 flex justify-between items-center bg-black">
                <a className="text-3xl font-bold leading-none" onClick={() => { goTo("/swap") }}>
                    <img {...PROJECT_LOGO} />
                </a>
                <div className="lg:hidden">
                    <button className="navbar-burger flex items-center text-color-text-menu-selected text-3xl p-3" onClick={() => {
                        setMenuOpen(true)
                    }}>
                        <MdMenu />
                    </button>
                </div>
                <ul className="hidden lg:flex lg:ml-5 lg:items-center lg:w-auto lg:space-x-6">
                    {
                        pages.map((val) => (
                            <li key={val.link} className={`flex text-base ${val.other.some(x => location.pathname.includes(x)) ? "text-color-text-menu-selected" : "text-color-text-menu hover:text-color-text-menu-hover"}`}>
                                {val.other.some(x => location.pathname.includes(x)) && val.icon}
                                {
                                    val.childrens ?
                                        <DropdownContainer goTo={goTo} val={val} dropdown={dropdown} setDropdown={setDropdown} /> :
                                        <button className="ml-1" onClick={() => { goTo(val.link) }}>
                                            {val.title}
                                        </button>
                                }
                            </li>
                        ))
                    }
                </ul>

                <div className="hidden lg:inline-block lg:ml-auto lg:mr-3 py-2 px-6 transition duration-200">
                    <ConnectButton accountStatus="address" chainStatus="name" />
                </div>
            </nav>
            <div className={`navbar-menu relative z-50 ${menuOpen ? "!block" : "hidden"}`}>
                <div className={`navbar-backdrop fixed inset-0 bg-gray-800 opacity-25`} ></div>
                <nav className={`fixed top-0 left-0 bottom-0 flex flex-col w-5/6 max-w-sm py-6 px-6 bg-black overflow-y-auto ${menuOpen ? "animate-open-menu" : "animate-close-menu"}`}>
                    <div className="flex items-center mb-8">
                        <a className="mr-auto text-3xl font-bold leading-none">
                            <img {...PROJECT_LOGO} />
                        </a>
                        <button className="navbar-close text-color-text-menu-selected text-3xl" onClick={() => setMenuOpen(false)}>
                            <MdOutlineClose />
                        </button>
                    </div>
                    <div>
                        <ul>
                            {
                                pages.map((val) => (
                                    <li key={val.link} className={` flex text-base mb-3 ${val.other.some(x => location.pathname.includes(x)) ? "text-color-text-menu-selected" : "text-color-text-menu hover:text-color-text-menu-hover"}`}>
                                        {val.other.some(x => location.pathname.includes(x)) && val.icon}
                                        {
                                            val.childrens ?
                                                <DropdownContainer goTo={goTo} val={val} dropdown={dropdown} setDropdown={setDropdown} />
                                                :
                                                <button className="ml-1" onClick={() => { goTo(val.link) }}>
                                                    {val.title}
                                                </button>
                                        }
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    <div className="flex justify-center mt-auto">
                        <div className="pt-6">
                            <div className="flex px-4 py-3 mb-3">
                                <ConnectButton accountStatus="address" chainStatus="name" />
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    )
}

function DropdownContainer({
    val, goTo, dropdown, setDropdown
}: {
    val: MenuItem
    goTo: (t: string) => void
    dropdown: string
    setDropdown: (t: string) => void
}) {
    return (
        <div>
            <button data-dropdown-toggle={val.id} className={`ml-1 flex items-center justify-between`} onClick={() => dropdown === val.id ? setDropdown("") : setDropdown(val.id)}>
                {val.title}
                <svg className="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                </svg>
            </button>
            {
                val.childrens && <div id={val.id} className={`z-10 ${dropdown === val.id ? "" : "hidden"} absolute mt-2 font-normal divide-y rounded-lg shadow w-44 bg-gray-700 divide-gray-600`}>
                    <ul className="py-2 text-sm text-gray-400" aria-labelledby="dropdownLargeButton">
                        {
                            val.childrens.map(x => <li key={x.id}>
                                <a onClick={() => {
                                    setDropdown("")
                                    goTo(x.link)
                                }} className="block px-4 py-2 hover:bg-gray-600 hover:text-white">{x.title}</a>
                            </li>)
                        }
                    </ul>
                </div>
            }
        </div>
    )
}

export default withTheme(Header)