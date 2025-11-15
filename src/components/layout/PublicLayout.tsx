import Header from './Header'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pb-24 pt-6">
        {children}
      </main>
    </div>
  )
}


