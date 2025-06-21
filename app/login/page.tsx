"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login } from "@/lib/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await login(email, password)
      router.push("/")
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Invalid email or password")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>Sign in to your StayFinder account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {"Don't have an account? "}
                  <Link href="/register" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium mb-2">Demo Accounts:</p>
                <p className="text-xs text-gray-600">Host: host@example.com / password123</p>
                <p className="text-xs text-gray-600">Guest: guest@example.com / password123</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
