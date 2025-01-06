'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react'
import { Search } from 'lucide-react'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { usePrivy } from '@privy-io/react-auth';
import { CreateCampaign } from '@/components/create-campaign'
import { IoLocationSharp } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dailog"
import { useCollection } from '@/contexts/CollectionContext'
import { SideBar } from '@/components/SideBar'
import { useSidebar } from '@/contexts/SidebarContext'
interface Story {
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
}

interface Category {
  id: string
  name: string
  icon: JSX.Element
}

// interface NavItem {
//   icon: JSX.Element
//   label: string
//   href: string
// }

export function ExploreStories() {
  const { logout } = usePrivy();
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [selectedCollection, setSelectedCollection] = useState<string>('')
  const { addToCollection } = useCollection()

  const { isOpen } = useSidebar()

  // const navItems: NavItem[] = [
  //   { icon: <Home className="h-6 w-6" />, label: "Home", href: "/" },
  //   { icon: <Grid className="h-6 w-6" />, label: "Dashboard", href: "/dashboard" },
  //   { icon: <Star className="h-6 w-6" />, label: "Favorites", href: "/favorites" },
  // ]

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
      authorImage: "/images/profiles/jana.png",
      excerpt: "I left my home with nothing but a dream—to find safety and a future. The road was long, filled with uncertainty, but ev...",
      donations: 80,
      fundingGoal: 100,
      donationCount: 96,
    },
    {
      id: "2",
      title: "The Glass Castle",
      author: "Jana Dorali",
      location: "Pagirinya, Uganda",
      image: "/images/c1.png",
      authorImage: "/images/profiles/jana.png",
      excerpt: "I left my home with nothing but a dream—to find safety and a future. The road was long, filled with uncertainty, but ev...",
      donations: 40,
      fundingGoal: 100,
      donationCount: 56,
    },
    {
      id: "3",
      title: "Man's Search for Meaning",
      author: "Jana Dorali",
      location: "Pagirinya, Uganda",
      image: "/images/c2.png",
      authorImage: "/images/profiles/jana.png",
      excerpt: "I left my home with nothing but a dream—to find safety and a future. The road was long, filled with uncertainty, but ev...",
      donations: 10,
      fundingGoal: 100,
      donationCount: 26,
    },
  ]

  const collections = [
    { id: 1, name: "Collection 1", initial: "1" },
    { id: 2, name: "Collection 2", initial: "2" },
  ]

  const { login, authenticated } = usePrivy();

  return (
    <div className="flex min-h-screen w-screen bg-gray-50">
      {/* Side Navigation */}
      <SideBar />

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
                  <Card key={story.id} className="overflow-hidden flex flex-col h-full">
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
                      <div className="flex justify-between items-center mb-4 gap-2">
                        <div className="flex align self-start">

                          <Image
                            src={story.authorImage}
                            alt={story.author}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                          <span className="font-medium">{story.author}</span>
                        </div>
                        <div className="flex align self-start">

                          <IoLocationSharp className='text-[#55DFAB] mt-0.5' />
                          <span className="text-gray-900 text-sm">{story.location}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-[12px]">{story.excerpt}</p>
                      <div className="mb-4 items-center text-[14px] gap-2 underline decoration-black text-black">Read More</div>

                    </CardContent>
                    <div className="mt-auto px-6 py-4 space-y-2">
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
                      <div className="flex items-center justify-between text-sm">
                        <Progress value={(story.donations / story.fundingGoal) * 100} className="h-2 " />
                      </div>
                    </div>
                    <CardFooter className="mt-auto gap-4 p-6 pt-0">
                      <Button className="flex bg-purple-600 hover:bg-purple-700">
                        <Image src="/diamond.png" alt="wallet" width={24} height={24} />
                        Donate
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedStory(story)
                          setShowCollectionModal(true)
                        }}
                      >
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

      <Dialog
        open={showCollectionModal}
        onOpenChange={(open) => {
          setShowCollectionModal(open)
          if (!open) {
            setSelectedCollection('')
            setSelectedStory(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span className="text-2xl font-bold">Add to Collection</span>
              <Image src="/sparkles.png" alt="wallet" width={24} height={24} />
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4 text-sm">Choose the collection where you&#39;d like to add this story:</p>
            <div className="space-y-2">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border hover:bg-green-50 cursor-pointer",
                    selectedCollection === collection.name && "border-emerald-400 bg-green-50"
                  )}
                  onClick={() => setSelectedCollection(collection.name)}
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-lg">
                    {collection.initial}
                  </div>
                  <span className="flex-grow">{collection.name}</span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2",
                    selectedCollection === collection.name
                      ? "border-emerald-400 bg-emerald-400"
                      : "border-gray-200"
                  )} />
                </div>
              ))}
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                <div className="w-10 h-10 border-2 border-dashed border-purple-400 rounded-lg flex items-center justify-center text-purple-400">
                  +
                </div>
                <span className="text-purple-600">New Collection</span>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!selectedCollection || !selectedStory}
                onClick={() => {
                  if (selectedStory && selectedCollection) {
                    addToCollection(selectedStory, selectedCollection)
                    setShowCollectionModal(false)
                    setSelectedCollection('')
                    setSelectedStory(null)
                  }
                }}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowCollectionModal(false)}
              >
                Cancel
              </Button>

            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* <Dialog open={showCollectionModal} onOpenChange={setShowCollectionModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span className="text-2xl font-bold">Add to Collection</span>
              <Image src="/sparkles.png" alt="wallet" width={24} height={24} />
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4 text-sm">Choose the collection where you&#39;d like to add this story:</p>
            <div className="space-y-2">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-green-50 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-lg">
                    {collection.initial}
                  </div>
                  <span className="flex-grow">{collection.name}</span>
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-400" />
                </div>
              ))}
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                <div className="w-10 h-10 border-2 border-dashed border-purple-400 rounded-lg flex items-center justify-center text-purple-400">
                  +
                </div>
                <span className="text-purple-600">New Collection</span>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Save
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowCollectionModal(false)}
              >
                Cancel
              </Button>

            </div>
          </div>
        </DialogContent>
      </Dialog> */}
    </div>
  )
}