import React, { useState } from 'react'
import { useWorkspace } from '../hooks/useWorkspace'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Building2, Users, Plus, ArrowRight } from 'lucide-react'

export function WorkspaceSetup() {
  const { user } = useAuth()
  const { createWorkspace, isLoading } = useWorkspace()
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceDescription, setWorkspaceDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!workspaceName.trim()) {
      setError('Workspace name is required')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      await createWorkspace(workspaceName.trim(), workspaceDescription.trim() || undefined)
      // Workspace context will automatically update and redirect
    } catch (error) {
      console.error('Error creating workspace:', error)
      setError('Failed to create workspace. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const suggestedNames = [
    `${user?.email?.split('@')[0]}'s Team`,
    'My Workspace',
    'Team Collaboration',
    'Project Hub'
  ]

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to THREAD</h1>
          <p className="text-gray-600">Let's set up your first workspace to get started</p>
        </div>

        {/* Main Setup Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Your Workspace
            </CardTitle>
            <CardDescription>
              A workspace is where your team communicates and collaborates. You can always create more later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              {/* Workspace Name */}
              <div>
                <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Name *
                </label>
                <Input
                  id="workspace-name"
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Enter workspace name"
                  className="w-full"
                  disabled={isCreating}
                />
                
                {/* Suggested Names */}
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedNames.map((name, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setWorkspaceName(name)}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        disabled={isCreating}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workspace Description */}
              <div>
                <label htmlFor="workspace-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <Textarea
                  id="workspace-description"
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  placeholder="What's this workspace for? (e.g., Marketing team, Product development, etc.)"
                  className="w-full"
                  rows={3}
                  disabled={isCreating}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isCreating || !workspaceName.trim()}
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Creating Workspace...
                  </>
                ) : (
                  <>
                    Create Workspace
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Team Collaboration</h3>
            <p className="text-sm text-gray-600">Invite team members and organize conversations in channels</p>
          </div>
          <div className="text-center p-4">
            <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Organized Workspace</h3>
            <p className="text-sm text-gray-600">Keep projects and teams organized with dedicated spaces</p>
          </div>
          <div className="text-center p-4">
            <Plus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Easy Setup</h3>
            <p className="text-sm text-gray-600">Get started in seconds with automatic channel creation</p>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Signed in as <span className="font-medium">{user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  )
}