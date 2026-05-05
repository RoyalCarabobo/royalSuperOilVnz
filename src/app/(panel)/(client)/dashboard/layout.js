import NavClient from '@/components/NavClient'

export default function ClienteLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavClient />
      <main className="mx-auto bg-background ">
        {children}
      </main>
    </div>
  )
}