import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconUsers } from '@tabler/icons-react'

export function SyncPage() {
  return (
    <div className="w-full max-w-md mx-auto min-h-[85vh] flex flex-col pt-4">
      <div className="flex-1 flex flex-col px-4 pb-20 justify-center">
        <Card className="w-full">
          <CardContent className="pt-6 space-y-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <IconUsers size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Sync with a Friend</h3>
              <p className="text-muted-foreground text-sm mt-2">Enter your friend's unique ID to find the perfect movie for your night.</p>
            </div>
            <div className="flex gap-2">
              <Input placeholder="User ID (e.g. #7721)" className="flex-1" />
              <Button>Sync</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
