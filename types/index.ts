export interface Story {
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

export interface Category {
    id: string
    name: string
    icon: string
}