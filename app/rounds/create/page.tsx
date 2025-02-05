'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const roundSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(100, {
    message: "Description must be at least 100 characters.",
  }),
  type: z.enum(["OSS_ROUND", "COMMUNITY_ROUND"]),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  matchingPool: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Matching pool must be a positive number.",
  }),
  startDate: z.string().refine((val) => new Date(val) > new Date(), {
    message: "Start date must be in the future.",
  }),
  endDate: z.string().refine((val) => new Date(val) > new Date(), {
    message: "End date must be in the future.",
  }),
});

type RoundFormData = z.infer<typeof roundSchema>;

export default function CreateRoundPage() {
  const router = useRouter();
  const form = useForm<RoundFormData>({
    resolver: zodResolver(roundSchema),
  });

  const onSubmit = async (data: RoundFormData) => {
    try {
      // In production, this would be an API call
      console.log("Creating round:", data);
      
      // Mock success
      router.push("/rounds");
    } catch (error) {
      console.error("Failed to create round:", error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/rounds" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Rounds
          </Link>
          <h1 className="text-4xl font-bold mt-4">Create a Funding Round</h1>
          <p className="text-gray-600 mt-2">
            Set up a new quadratic funding round to support projects in your ecosystem.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Round Details</CardTitle>
            <CardDescription>
              Fill in the details for your new funding round.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Round Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Web3 Infrastructure Round" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear and descriptive title for your funding round.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the goals and focus areas of this funding round..."
                          className="h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Explain what types of projects you're looking to fund and what impact you hope to achieve.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Round Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select round type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="OSS_ROUND">OSS Round</SelectItem>
                            <SelectItem value="COMMUNITY_ROUND">Community Round</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The type of projects this round will support.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Development">Development</SelectItem>
                            <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Community">Community</SelectItem>
                            <SelectItem value="Research">Research</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The main category this round falls under.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="matchingPool"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matching Pool (USDC)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1000" {...field} />
                      </FormControl>
                      <FormDescription>
                        The total amount of funds available for matching in this round.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          When the round will start accepting applications.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          When the round will stop accepting contributions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => router.push("/rounds")}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Round</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 