'use client'

import React from 'react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { usePrivy } from '@privy-io/react-auth'
import { Grid, Home, Search, Settings, Star, LogOut } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"


interface NavItem {
    icon: JSX.Element
    label: string
    href: string
}

export const SideBar = () => {
    const [isOpen, setIsOpen] = useState(false)

    const navItems: NavItem[] = [
        { icon: <Home className="h-6 w-6" />, label: "Home", href: "/" },
        { icon: <Grid className="h-6 w-6" />, label: "Dashboard", href: "/dashboard" },
        { icon: <Star className="h-6 w-6" />, label: "Favorites", href: "/favorites" },
    ]

    return (
        <div>
            {/* Side Navigation */}
            < aside
                className={
                    cn(
                        "fixed left-0 top-0 z-40 flex h-full flex-col border-r bg-white transition-all duration-300 ease-in-out",
                        isOpen ? "w-[240px]" : "w-[70px]"
                    )
                }
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <div className={cn("flex items-center justify-center h-[100px] px-4 border-b py-8")}>
                    <div className='flex items-center justify-center w-full'>
                        {isOpen ? (
                            <Image src="/logo-full.png" alt="Logo" width={550} height={60} className="rounded-full" />
                        ) : (
                            <Image src="/logo-icon.png" alt="logo-icon" width={100} height={100} className="rounded" />
                        )}
                    </div>
                </div>
                <nav className="flex-1 space-y-1 p-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-center rounded-lg px-1 py-4 text-gray-800 transition-colors hover:bg-gray-100 hover:text-gray-900",
                                item.href === "/" && " bg-green-200 text-gray-900"
                            )}
                        >
                            {item.icon}
                            <span
                                className={cn(
                                    "overflow-hidden transition-all duration-300 ease-in-out",
                                    isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>
                <div className="border-t p-2">
                    <Link
                        href="/settings"
                        className="flex items-center justify-center  gap-3 rounded-lg px-3 py-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Settings className="h-6 w-6" />
                        <span
                            className={cn(
                                "overflow-hidden transition-all duration-300 ease-in-out",
                                isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
                            )}
                        >
                            Settings
                        </span>
                    </Link>
                    {/* <button
            onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button> */}
                    <div className="flex items-center justify-center  gap-3 rounded-lg px-3 py-2">
                        <Image src="https://avatar.vercel.sh/user" alt="User" width={24} height={24} className="rounded-full" />
                        <span
                            className={cn(
                                "overflow-hidden text-sm font-medium transition-all duration-300 ease-in-out",
                                isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
                            )}
                        >
                            User Name
                        </span>
                    </div>
                </div>
            </aside >
        </div>


    )
}
