import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function MovieCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <Skeleton className="w-full aspect-[2/3] rounded-none" />
      <CardHeader>
        <CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle>
        <CardDescription className="flex gap-2 mt-2">
          <Skeleton className="h-4 w-12" />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-6 w-6 rounded-full" />
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}
