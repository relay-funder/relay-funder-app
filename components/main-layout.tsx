'use client'

import { cn } from "@/lib/utils"
import { SideBar } from "./SideBar"
import { useSidebar } from "@/contexts/SidebarContext"

export function MainLayout({ children }: { children: React.ReactNode }) {
    const { isOpen } = useSidebar()
    
    return (
        <div className="flex min-h-screen w-screen bg-gray-50">
            <SideBar />
            <div
                className={cn(
                    "flex-1 transition-all duration-300 ease-in-out",
                    isOpen ? "ml-[240px]" : "ml-[72px]"
                )}
            >
                {children}
            </div>
        </div>
    )
} 