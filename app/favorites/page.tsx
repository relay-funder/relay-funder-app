'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { IoLocationSharp } from "react-icons/io5"
import { SideBar } from '@/components/SideBar'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/contexts/SidebarContext'

interface SavedStory {
    id: string
    title: string
    author: string
    location: string
    image: string
    authorImage: string
    excerpt: string
    donations: number
    fundingGoal: number
    donationCount: number
    collectionName: string
}

export default function FavoritesPage() {
    const [savedStories] = useState<SavedStory[]>([
        {
            id: "1",
            title: "From Shadows to Light: My Journey to Hope",
            author: "Jana Dorali",
            location: "Pagirinya, Uganda",
            image: "/images/c3.png",
            authorImage: "/images/profiles/jana.png",
            excerpt: "I left my home with nothing but a dream—to find safety and a future...",
            donations: 80,
            fundingGoal: 100,
            donationCount: 96,
            collectionName: "Collection 1"
        },
    ])

    const { isOpen } = useSidebar()

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideBar />
            <div
                className={cn(
                    "flex-1 p-8 transition-all duration-300 ease-in-out",
                    isOpen ? "ml-[240px]" : "ml-[70px]"
                )}
            >
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">My Saved Stories</h1>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {savedStories.map((story) => (
                            <Card key={story.id} className="overflow-hidden flex flex-col h-full">
                                <CardHeader className="p-0">
                                    <div className="relative">
                                        <Image
                                            src={story.image}
                                            alt={story.title}
                                            width={600}
                                            height={400}
                                            className="h-[200px] w-full object-cover"
                                        />
                                        <div className="absolute top-4 right-4 bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm">
                                            {story.collectionName}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <h2 className="mb-2 text-xl font-bold">{story.title}</h2>
                                    <div className="flex justify-between items-center mb-4 gap-2">
                                        <div className="flex items-center gap-2">
                                            <Image
                                                src={story.authorImage}
                                                alt={story.author}
                                                width={24}
                                                height={24}
                                                className="rounded-full"
                                            />
                                            <span className="font-medium">{story.author}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <IoLocationSharp className='text-[#55DFAB] mt-0.5' />
                                            <span className="text-gray-900 text-sm">{story.location}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-[12px]">{story.excerpt}</p>
                                    <div className="mb-4 items-center text-[14px] gap-2 underline decoration-black text-black">
                                        Read More
                                    </div>
                                </CardContent>
                                <div className="mt-auto px-6 py-4 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className='flex'>
                                            <div className='text-[#55DFAB] px-1 font-bold'>
                                                {story.donationCount}
                                            </div>
                                            donations
                                        </span>
                                        <span className='flex'>
                                            <div className='text-[#55DFAB] px-1 font-bold'>
                                                {(story.donations / story.fundingGoal) * 100}%
                                            </div>
                                            of funding goal
                                        </span>
                                    </div>
                                    <Progress value={(story.donations / story.fundingGoal) * 100} className="h-2" />
                                </div>
                                <CardFooter className="mt-auto gap-4 p-6 pt-0">
                                    <Button className="flex bg-purple-600 hover:bg-purple-700">
                                        <Image src="/diamond.png" alt="wallet" width={24} height={24} />
                                        Donate
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <Image src="/sparkles.png" alt="wallet" width={24} height={24} />
                                        Remove from Collection
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
} 