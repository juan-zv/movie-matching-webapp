import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function MatchingPage() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Matching</CardTitle>
          <CardDescription>Feature in progress</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This is a placeholder page for the matching feature. Implementation coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
