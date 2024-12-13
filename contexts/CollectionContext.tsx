'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

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
    collectionName?: string
}

interface CollectionContextType {
    savedStories: Story[]
    addToCollection: (story: Story, collectionName: string) => void
    removeFromCollection: (storyId: string) => void
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined)

export function CollectionProvider({ children }: { children: ReactNode }) {
    const [savedStories, setSavedStories] = useState<Story[]>([])

    const addToCollection = (story: Story, collectionName: string) => {
        setSavedStories(prev => [...prev, { ...story, collectionName }])
    }

    const removeFromCollection = (storyId: string) => {
        setSavedStories(prev => prev.filter(story => story.id !== storyId))
    }

    return (
        <CollectionContext.Provider value={{ savedStories, addToCollection, removeFromCollection }}>
            {children}
        </CollectionContext.Provider>
    )
}

export function useCollection() {
    const context = useContext(CollectionContext)
    if (context === undefined) {
        throw new Error('useCollection must be used within a CollectionProvider')
    }
    return context
} 