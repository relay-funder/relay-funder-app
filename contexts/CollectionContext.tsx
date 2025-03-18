'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Story, Collection, CollectionContextType } from '@/types'
import { usePrivy } from '@privy-io/react-auth'
import { toast } from '@/hooks/use-toast'

const CollectionContext = createContext<CollectionContextType>({
    userCollections: [],
    isLoading: false,
    addToCollection: async () => {},
    removeFromCollection: async () => {},
    deleteCollection: async () => {},
    getCollection: () => undefined,
    refreshCollections: async () => {},
})

export const useCollection = () => useContext(CollectionContext)

export const CollectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userCollections, setUserCollections] = useState<Collection[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { user, authenticated } = usePrivy()

    const fetchCollections = async () => {
        if (!authenticated || !user?.wallet?.address) return

        setIsLoading(true)
        try {
            const userAddress = user.wallet.address
            const response = await fetch(`/api/collections?userAddress=${userAddress}`)
            const data = await response.json()

            if (response.ok) {
                // Transform the API response to match our Collection interface
                const collections = data.collections.map((collection: any) => ({
                    id: collection.id,
                    name: collection.name,
                    description: collection.description,
                    createdAt: new Date(collection.createdAt),
                    stories: collection.items.map((item: any) => ({
                        id: item.itemId,
                        title: item.details?.title || 'Unknown',
                        description: item.details?.description || '',
                        image: item.details?.image || '/images/placeholder.svg',
                        slug: item.details?.slug || '',
                        type: item.itemType,
                    })),
                }))
                setUserCollections(collections)
            } else {
                console.error('Failed to fetch collections:', data.error)
            }
        } catch (error) {
            console.error('Error fetching collections:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch collections when user is authenticated
    useEffect(() => {
        if (authenticated && user?.wallet?.address) {
            fetchCollections()
        }
    }, [authenticated, user?.wallet?.address])

    const refreshCollections = async () => {
        await fetchCollections()
    }

    const addToCollection = async (story: Story, collectionName: string, createNew = false) => {
        if (!authenticated || !user?.wallet?.address) return

        const userAddress = user.wallet.address
        try {
            if (createNew) {
                // Create a new collection
                const createResponse = await fetch('/api/collections', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: collectionName,
                        userAddress,
                    }),
                })

                const createData = await createResponse.json()

                if (!createResponse.ok) {
                    throw new Error(createData.error || 'Failed to create collection')
                }

                const newCollection = createData.collection

                // Add the story to the new collection
                const addResponse = await fetch(`/api/collections/${newCollection.id}/items`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        itemId: story.id,
                        itemType: story.type,
                        userAddress,
                    }),
                })

                const addData = await addResponse.json()

                if (!addResponse.ok) {
                    throw new Error(addData.error || 'Failed to add item to collection')
                }

                // Update local state
                setUserCollections(prevCollections => [
                    ...prevCollections,
                    {
                        id: newCollection.id,
                        name: newCollection.name,
                        description: newCollection.description,
                        createdAt: new Date(newCollection.createdAt),
                        stories: [story],
                    },
                ])

                toast({
                    title: "Added to new collection",
                    description: `Item has been added to the new collection "${collectionName}"`,
                })
            } else {
                // Find the collection
                const collection = userCollections.find(c => c.name === collectionName)
                
                if (!collection) {
                    throw new Error(`Collection "${collectionName}" not found`)
                }

                // Add the story to the existing collection
                const response = await fetch(`/api/collections/${collection.id}/items`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        itemId: story.id,
                        itemType: story.type,
                        userAddress,
                    }),
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to add item to collection')
                }

                // Update local state
                setUserCollections(prevCollections => 
                    prevCollections.map(c => {
                        if (c.id === collection.id) {
                            return {
                                ...c,
                                stories: [...c.stories, story]
                            }
                        }
                        return c
                    })
                )

                toast({
                    title: "Added to collection",
                    description: `Item has been added to "${collectionName}"`,
                })
            }
        } catch (error) {
            console.error('Error adding to collection:', error)
            toast({
                title: "Failed to add to collection",
                description: error instanceof Error ? error.message : 'An error occurred',
                variant: "destructive",
            })
        }
    }

    const removeFromCollection = async (storyId: string, collectionId: string) => {
        if (!authenticated || !user?.wallet?.address) return

        const userAddress = user.wallet.address
        try {
            const response = await fetch(`/api/collections/${collectionId}/items`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId: storyId,
                    userAddress,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to remove item from collection')
            }

            // Update local state
            setUserCollections(prevCollections => 
                prevCollections.map(collection => {
                    if (collection.id === collectionId) {
                        return {
                            ...collection,
                            stories: collection.stories.filter(story => story.id !== storyId)
                        }
                    }
                    return collection
                })
            )

            toast({
                title: "Removed from collection",
                description: "Item has been removed from the collection",
            })
        } catch (error) {
            console.error('Error removing from collection:', error)
            toast({
                title: "Failed to remove from collection",
                description: error instanceof Error ? error.message : 'An error occurred',
                variant: "destructive",
            })
        }
    }

    const deleteCollection = async (collectionId: string) => {
        if (!authenticated || !user?.wallet?.address) return

        const userAddress = user.wallet.address
        try {
            const response = await fetch(`/api/collections/${collectionId}?userAddress=${userAddress}`, {
                method: 'DELETE',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete collection')
            }

            // Update local state
            setUserCollections(prevCollections => 
                prevCollections.filter(collection => collection.id !== collectionId)
            )

            toast({
                title: "Collection deleted",
                description: "The collection has been deleted",
            })
        } catch (error) {
            console.error('Error deleting collection:', error)
            toast({
                title: "Failed to delete collection",
                description: error instanceof Error ? error.message : 'An error occurred',
                variant: "destructive",
            })
        }
    }

    const getCollection = (collectionId: string) => {
        return userCollections.find(collection => collection.id === collectionId)
    }

    return (
        <CollectionContext.Provider value={{
            userCollections,
            isLoading,
            addToCollection,
            removeFromCollection,
            deleteCollection,
            getCollection,
            refreshCollections,
        }}>
            {children}
        </CollectionContext.Provider>
    )
} 