'use client'

import { useCollection } from '@/contexts/CollectionContext'
import { Card, CardContent, CardHeader, Button, Tabs, TabsContent, TabsList, TabsTrigger, Skeleton } from '@/components/ui'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'

export default function CollectionsPage() {
    const { userCollections, deleteCollection, removeFromCollection, isLoading } = useCollection()
    const [activeCollection, setActiveCollection] = useState<string | null>(
        userCollections.length > 0 ? userCollections[0].id : null
    )
    const { authenticated, login } = usePrivy()

    if (!authenticated) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Collections</h1>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Image 
                        src="/sparkles.png" 
                        alt="Collections" 
                        width={64} 
                        height={64} 
                        className="mx-auto mb-4"
                    />
                    <h2 className="text-xl font-semibold mb-2">Sign in to view your collections</h2>
                    <p className="text-gray-600 mb-4">
                        You need to sign in to create and manage your collections.
                    </p>
                    <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => login()}>
                        Sign In
                    </Button>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">My Collections</h1>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-[200px] w-full" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (userCollections.length === 0) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">My Collections</h1>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Image 
                        src="/sparkles.png" 
                        alt="Collections" 
                        width={64} 
                        height={64} 
                        className="mx-auto mb-4"
                    />
                    <h2 className="text-xl font-semibold mb-2">No Collections Yet</h2>
                    <p className="text-gray-600 mb-4">
                        Start organizing your favorite campaigns by adding them to collections.
                    </p>
                    <Link href="/campaigns">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            Explore Campaigns
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">My Collections</h1>
            
            <Tabs 
                defaultValue={activeCollection || undefined} 
                onValueChange={(value) => setActiveCollection(value)}
                className="w-full"
            >
                <TabsList className="mb-6 flex flex-wrap gap-2">
                    {userCollections.map((collection) => (
                        <TabsTrigger 
                            key={collection.id} 
                            value={collection.id}
                            className="px-4 py-2 rounded-full"
                        >
                            {collection.name} ({collection.stories.length})
                        </TabsTrigger>
                    ))}
                </TabsList>
                
                {userCollections.map((collection) => (
                    <TabsContent key={collection.id} value={collection.id}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">{collection.name}</h2>
                            <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={async () => {
                                    await deleteCollection(collection.id);
                                    setActiveCollection(userCollections.length > 1 ? userCollections[0].id : null);
                                }}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Collection
                            </Button>
                        </div>
                        
                        {collection.stories.length === 0 ? (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                                <p className="text-gray-600">This collection is empty.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {collection.stories.map((story) => (
                                    <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <Link href={`/campaigns/${story.slug}`}>
                                            <CardHeader className="p-0">
                                                <Image
                                                    src={story.image || '/images/placeholder.svg'}
                                                    alt={story.title}
                                                    width={600}
                                                    height={400}
                                                    className="h-[200px] w-full object-cover"
                                                />
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <h3 className="mb-2 text-xl font-bold">{story.title}</h3>
                                                <p className="text-gray-600 text-sm line-clamp-3">{story.description}</p>
                                            </CardContent>
                                        </Link>
                                        <div className="px-6 pb-4 flex justify-end">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    await removeFromCollection(story.id, collection.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
} 