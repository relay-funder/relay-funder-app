'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { revalidatePath } from 'next/cache'

interface CampaignUpdateFormProps {
    campaignId: number
    creatorAddress: string
    userAddress?: string
    slug: string
}

export function CampaignUpdateForm({ campaignId, creatorAddress, userAddress, slug }: CampaignUpdateFormProps) {
    const { toast } = useToast()
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    })

    const isOwner = userAddress?.toLowerCase() === creatorAddress?.toLowerCase()

    if (!isOwner) {
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const response = await fetch('/api/campaigns/updates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    campaignId,
                    title: formData.title,
                    content: formData.content,
                    creatorAddress
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create update')
            }

            toast({
                title: "Success!",
                description: "Campaign update posted successfully.",
            })

            // Reset form
            setFormData({ title: '', content: '' })

            // Revalidate the campaign page
            revalidatePath(`/campaigns/${slug}`)

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to post update. Please try again.",
            })
            console.log('Failed to create campaign update:', error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Input
                    placeholder="Update Title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                />
            </div>
            <div>
                <Textarea
                    placeholder="Share your campaign progress..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    required
                    className="min-h-[150px]"
                />
            </div>
            <Button type="submit" className="w-full">
                Post Update
            </Button>
        </form>
    )
} 