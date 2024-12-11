'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react'
import { Grid, Home, Search, Settings, Star, LogOut } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { usePrivy } from '@privy-io/react-auth';
import { CreateCampaign } from '@/components/create-campaign'

interface Story {
  id: string
  title: string
  author: string
  location: string
  image: string
  excerpt: string
  donations: number
  fundingGoal: number
  donationCount: number
}

interface Category {
  id: string
  name: string
  icon: JSX.Element
}

interface NavItem {
  icon: JSX.Element
  label: string
  href: string
}

export function ExploreStories() {
  const { logout } = usePrivy();
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)

  const navItems: NavItem[] = [
    { icon: <Home className="h-6 w-6" />, label: "Home", href: "/" },
    { icon: <Grid className="h-6 w-6" />, label: "Dashboard", href: "/dashboard" },
    { icon: <Star className="h-6 w-6" />, label: "Favorites", href: "/favorites" },
  ]

  const categories: Category[] = [
    { id: "visual-arts", name: "Visual Arts", icon: <span className="text-xl">🎨</span> },
    { id: "music-audio", name: "Music & Audio", icon: <span className="text-xl">🎵</span> },
    { id: "film-photography", name: "Film & Photography", icon: <span className="text-xl">📷</span> },
    { id: "crafts-artifacts", name: "Crafts & Artifacts", icon: <span className="text-xl">🏺</span> },
    { id: "literature-writing", name: "Literature & Writing", icon: <span className="text-xl">📚</span> },
    { id: "food-culinary", name: "Food & Culinary Arts", icon: <span className="text-xl">🍳</span> },
    { id: "fashion-textiles", name: "Fashion & Textiles", icon: <span className="text-xl">👕</span> },
    { id: "education-workshops", name: "Education & Workshops", icon: <span className="text-xl">🎓</span> },
    { id: "digital-art-nfts", name: "Digital Art & NFTs", icon: <span className="text-xl">💻</span> },
    { id: "community-goods", name: "Community & Public Goods", icon: <span className="text-xl">🤝</span> },
  ]

  const stories: Story[] = [
    {
      id: "1",
      title: "From Shadows to Light: My Journey to Hope",
      author: "Jana Dorali",
      location: "Pagirinya, Uganda",
      image: "/images/c3.png",
      excerpt: "I left my home with nothing but a dream—to find safety and a future. The road was long, filled with uncertainty, but ev...",
      donations: 50,
      fundingGoal: 100,
      donationCount: 86,
    },
    {
      id: "2",
      title: "The Glass Castle",
      author: "Jana Dorali",
      location: "Pagirinya, Uganda",
      image: "/images/c1.png",
      excerpt: "I left my home with nothing but a dream—to find safety and a future. The road was long, filled with uncertainty, but ev...",
      donations: 50,
      fundingGoal: 100,
      donationCount: 86,
    },
    {
      id: "3",
      title: "Man's Search for Meaning",
      author: "Jana Dorali",
      location: "Pagirinya, Uganda",
      image: "/images/c2.png",
      excerpt: "I left my home with nothing but a dream—to find safety and a future. The road was long, filled with uncertainty, but ev...",
      donations: 50,
      fundingGoal: 100,
      donationCount: 86,
    },
  ]

  const { login, ready, authenticated } = usePrivy();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Side Navigation */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r bg-white transition-all duration-300 ease-in-out",
          isOpen ? "w-[240px]" : "w-[70px]"
        )}
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
          <button 
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
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
      </aside>

      <div
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isOpen ? "ml-[240px]" : "ml-[72px]"
        )}
      >
        <header className=" px-4 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input className="w-[300px] pl-10 rounded-xl" placeholder="Search Stories" type="search" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="bg-purple-50 font-semibold text-purple-600 hover:bg-purple-100"
                onClick={login}
              >
                {authenticated ? "Connected" : "Connect Wallet"}
                <Image src="/wallet-icon.png" alt="wallet" width={14} height={14} />
              </Button>
              <Button 
                className="bg-emerald-400 font-semibold hover:bg-emerald-500"
                onClick={() => setShowCreateCampaign(true)}
              >
                Create Story
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8">
          {showCreateCampaign ? (
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateCampaign(false)}
                className="mb-4"
              >
                ← Back to Stories
              </Button>
              <CreateCampaign />
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="mb-4 text-3xl font-bold">Explore Stories</h1>
                <p className="mx-auto mb-8 max-w-3xl text-gray-600">
                  Explore personal memories shared by refugees—each story offers a glimpse into their resilience, hopes, and dreams.
                  By taking in these moments, you help preserve their voices and honor their journeys.
                </p>
              </div>

              <div className="mb-8 flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant="outline"
                    className="flex items-center gap-2 rounded-full bg-white"
                  >
                    {category.icon}
                    {category.name}
                  </Button>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stories.map((story) => (
                  <Card key={story.id} className="overflow-hidden">
                    <CardHeader className="p-0">
                      <Image
                        src={story.image}
                        alt={story.title}
                        width={600}
                        height={400}
                        className="h-[200px] w-full object-cover"
                      />
                    </CardHeader>
                    <CardContent className="p-6">
                      <h2 className="mb-2 text-xl font-bold">{story.title}</h2>
                      <div className="mb-4 flex items-center gap-2">
                        <Image
                          src={`https://avatar.vercel.sh/${story.author}`}
                          alt={story.author}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span className="font-medium">{story.author}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">{story.location}</span>
                      </div>
                      <p className="mb-4 text-gray-600">{story.excerpt}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className='flex '>
                            <div className='text-[#55DFAB] px-1 font-bold'>
                              {story.donationCount}
                            </div>
                            donations
                          </span>

                          <span className='flex'>
                            <div className='text-[#55DFAB] px-1 font-bold'>
                              {(story.donations / story.fundingGoal) * 100}%
                            </div>
                            of funding goal</span>
                        </div>
                        <Progress value={(story.donations / story.fundingGoal) * 100} className="h-2 " />
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-4 p-6 pt-0">
                      <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                        <Image src="/diamond.png" alt="wallet" width={24} height={24} />

                        Donate
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Image src="/sparkles.png" alt="wallet" width={24} height={24} />
                        Add to Collection
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}