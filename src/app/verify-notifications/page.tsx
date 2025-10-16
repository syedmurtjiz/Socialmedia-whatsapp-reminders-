'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function VerifyNotifications() {
  const { user } = useAuth()
  const [verificationResult, setVerificationResult] = useState(null)
  const [creatingNotification, setCreatingNotification] = useState(false)
  const [creationResult, setCreationResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const verifyNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/verify-notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      setVerificationResult(result)
    } catch (error) {
      setVerificationResult({ 
        success: false, 
        error: error.message,
        message: 'Failed to verify notifications system'
      })
    } finally {
      setLoading(false)
    }
  }

  const createTestNotification = async () => {
    if (!user) return
    
    setCreatingNotification(true)
    try {
      const response = await fetch('/api/verify-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          subscriptionId: 'test-subscription-id',
          serviceName: 'Test Service'
        }),
      })
      
      const result = await response.json()
      setCreationResult(result)
    } catch (error) {
      setCreationResult({ 
        success: false, 
        error: error.message,
        message: 'Failed to create test notification'
      })
    } finally {
      setCreatingNotification(false)
    }
  }

  useEffect(() => {
    verifyNotifications()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Notification System Verification</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">System Verification</h2>
        
        <button
          onClick={verifyNotifications}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 mb-4"
        >
          {loading ? 'Verifying...' : 'Verify Notification System'}
        </button>
        
        {verificationResult && (
          <div className={`p-4 rounded-lg mb-4 ${verificationResult.success ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700' : 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700'}`}>
            <h3 className="font-semibold text-lg mb-2">
              {verificationResult.success ? '✅ Success' : '❌ Error'}
            </h3>
            <p>{verificationResult.message}</p>
            {verificationResult.count !== undefined && (
              <p className="mt-2">Notification count: {verificationResult.count}</p>
            )}
            {verificationResult.error && (
              <p className="mt-2 text-red-700 dark:text-red-300">Error: {verificationResult.error}</p>
            )}
          </div>
        )}
      </div>
      
      {user && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create Test Notification</h2>
          
          <button
            onClick={createTestNotification}
            disabled={creatingNotification || !user}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 mb-4"
          >
            {creatingNotification ? 'Creating...' : 'Create Test Notification'}
          </button>
          
          {creationResult && (
            <div className={`p-4 rounded-lg ${creationResult.success ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700' : 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700'}`}>
              <h3 className="font-semibold text-lg mb-2">
                {creationResult.success ? '✅ Success' : '❌ Error'}
              </h3>
              <p>{creationResult.message}</p>
              {creationResult.notification && (
                <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded">
                  <p className="font-medium">Created Notification:</p>
                  <p className="text-sm">Title: {creationResult.notification.title}</p>
                  <p className="text-sm">Message: {creationResult.notification.message}</p>
                  <p className="text-sm">ID: {creationResult.notification.id}</p>
                </div>
              )}
              {creationResult.error && (
                <p className="mt-2 text-red-700 dark:text-red-300">Error: {creationResult.error}</p>
              )}
            </div>
          )}
        </div>
      )}
      
      {!user && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2">Sign In Required</h3>
          <p>Please sign in to create test notifications.</p>
        </div>
      )}
    </div>
  )
}