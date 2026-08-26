import { AppHeader } from "@/components/app-header"
import { PlanBoard } from "@/components/plan-board"

export default function Page() {
  return (
    <main className="min-h-svh bg-background p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <AppHeader />
        <PlanBoard />
      </div>
    </main>
  )
}
