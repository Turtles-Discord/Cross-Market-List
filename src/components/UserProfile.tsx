"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

export default function UserProfile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex-shrink-0">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || "User profile"}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-2xl text-gray-600 dark:text-gray-300">
                  {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                <dd className="mt-1 text-gray-900 dark:text-gray-100">{user.fullName || "Not provided"}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="mt-1 text-gray-900 dark:text-gray-100">
                  {user.emailAddresses[0]?.emailAddress || "Not provided"}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</dt>
                <dd className="mt-1 text-gray-900 dark:text-gray-100">{user.username || "Not set"}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</dt>
                <dd className="mt-1 text-gray-900 dark:text-gray-100">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 