'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCollection } from '@/contexts/CollectionContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, Button, Skeleton } from '@/components/ui'
import { ArrowLeft, Edit, Share, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from '@/hooks/use-toast'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui'

interface CollectionDetails {
    id: string
    name: string
    description?: string
    userId: string
    createdAt: string
    isOwner?: boolean
    items: {
        itemId: string
        itemType: string
        details: {
            id: number
            title: string
            description: string
            slug: string
            image: string
        }
    }[]
}

export default function CollectionDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { id } = params as { id: string }
    const { address, authenticated } = useAuth()
    const { removeFromCollection, deleteCollection } = useCollection()

    const [collection, setCollection] = useState<CollectionDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [isOwner, setIsOwner] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [editName, setEditName] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        async function fetchCollection() {
            try {
                setLoading(true);
                const response = await fetch(`/api/collections/${id}?userAddress=${address || ''}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch collection');
                }
                
                const data = await response.json();
                console.log("Collection data:", data);
                setCollection(data.collection);
                setIsOwner(data.collection.isOwner);
                setEditName(data.collection.name);
                setEditDescription(data.collection.description || '');
            } catch (error) {
                console.error('Error fetching collection:', error);
                toast({
                    title: "Error",
                    description: "Failed to load collection details",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        }

        if (authenticated && id) {
            fetchCollection();
        }
    }, [id, authenticated, address]);

    const handleRemoveItem = async (itemId: string) => {
        if (!collection) return
        
        try {
            await removeFromCollection(itemId, collection.id)
            
            // Update the local state
            setCollection(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    items: prev.items.filter(item => item.itemId !== itemId)
                }
            })
            
            toast({
                title: "Item removed",
                description: "The item has been removed from this collection",
            })
        } catch (error) {
            console.error('Error removing item from collection:', error)
            toast({
                title: "Error",
                description: "Failed to remove item from collection",
                variant: "destructive",
            })
        }
    }

    const handleUpdateCollection = async () => {
        if (!collection || !address) return
        
        setIsUpdating(true)
        try {
            const response = await fetch(`/api/collections/${collection.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editName,
                    description: editDescription,
                    userAddress: address,
                }),
            })
            
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update collection')
            }
            
            // Update local state
            setCollection(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    name: editName,
                    description: editDescription,
                }
            })
            
            setShowEditDialog(false)
            
            toast({
                title: "Collection updated",
                description: "Your changes have been saved",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update collection",
                variant: "destructive",
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteCollection = async () => {
        if (!collection) return
        
        try {
            await deleteCollection(collection.id)
            router.push('/collections')
            
            toast({
                title: "Collection deleted",
                description: "The collection has been permanently deleted",
            })
        } catch (error) {
            console.error('Error deleting collection:', error)
            toast({
                title: "Error",
                description: "Failed to delete collection",
                variant: "destructive",
            })
        }
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: collection?.name || 'Shared Collection',
                text: `Check out this collection: ${collection?.name}`,
                url: window.location.href,
            }).catch(err => {
                console.error('Error sharing:', err)
            })
        } else {
            // Fallback for browsers that don't support the Web Share API
            navigator.clipboard.writeText(window.location.href)
            toast({
                title: "Link copied",
                description: "Collection link copied to clipboard",
            })
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center mb-6">
                    <Skeleton className="h-10 w-20 mr-4" />
                    <Skeleton className="h-10 w-64" />
                </div>
                <Skeleton className="h-6 w-full max-w-3xl mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader className="p-0">
                                <Skeleton className="h-[200px] w-full" />
                            </CardHeader>
                            <CardContent className="p-6">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full mb-4" />
                                <Skeleton className="h-10 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (!authenticated) {
        return (
            <div className="container mx-auto p-6 text-center">
                <h1 className="text-3xl font-bold mb-4">Sign in to view collections</h1>
                <p className="mb-6">You need to sign in to view this collection.</p>
                <Button onClick={() => router.push('/collections')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Collections
                </Button>
            </div>
        )
    }

    if (!collection) {
        return (
            <div className="container mx-auto p-6 text-center">
                <h1 className="text-3xl font-bold mb-4">Collection not found</h1>
                <p className="mb-6">The collection you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
                <Button onClick={() => router.push('/collections')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Collections
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="flex items-center mb-4 md:mb-0">
                    <Button variant="ghost" onClick={() => router.push('/collections')} className="mr-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold">{collection.name}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleShare}>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                    </Button>

                    {isOwner && (
                        <>
                            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Collection</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <div className="mb-4">
                                            <label htmlFor="collectionName" className="block text-sm font-medium text-gray-700 mb-1">
                                                Collection Name
                                            </label>
                                            <Input
                                                id="collectionName"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label htmlFor="collectionDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                                Description (Optional)
                                            </label>
                                            <Input
                                                id="collectionDescription"
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button 
                                            className="bg-purple-600 hover:bg-purple-700"
                                            onClick={handleUpdateCollection}
                                            disabled={isUpdating || !editName.trim()}
                                        >
                                            {isUpdating ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Collection</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <p>Are you sure you want to delete this collection? This action cannot be undone.</p>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button variant="destructive" onClick={handleDeleteCollection}>
                                            Delete Collection
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                </div>
            </div>

            {collection.description && (
                <p className="text-gray-600 mb-8 max-w-3xl">{collection.description}</p>
            )}

            {collection.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collection.items.map((item) => (
                        <Card key={item.itemId} className="overflow-hidden">
                            <CardHeader className="p-0">
                                <Image
                                    src={item.details.image || '/images/placeholder.svg'}
                                    alt={item.details.title}
                                    width={600}
                                    height={400}
                                    className="h-[200px] w-full object-cover"
                                />
                            </CardHeader>
                            <CardContent className="p-6">
                                <Link href={`/campaigns/${item.details.slug}`}>
                                    <h3 className="text-xl font-bold mb-2 hover:text-purple-600 transition-colors">
                                        {item.details.title}
                                    </h3>
                                </Link>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                    {item.details.description}
                                </p>
                                <div className="flex justify-between items-center">
                                    <Link href={`/campaigns/${item.details.slug}`}>
                                        <Button variant="outline" size="sm">
                                            View Campaign
                                        </Button>
                                    </Link>
                                    {isOwner && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleRemoveItem(item.itemId)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Image 
                        src="/sparkles.png" 
                        alt="Empty collection" 
                        width={64} 
                        height={64} 
                        className="mx-auto mb-4"
                    />
                    <h3 className="text-xl font-semibold mb-2">This collection is empty</h3>
                    <p className="text-gray-600 mb-4">
                        {isOwner 
                            ? "Add campaigns to this collection while browsing the platform." 
                            : "The owner hasn't added any campaigns to this collection yet."}
                    </p>
                    <Button onClick={() => router.push('/')}>
                        Browse Campaigns
                    </Button>
                </div>
            )}
        </div>
    )
} 