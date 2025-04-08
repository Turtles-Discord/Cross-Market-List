"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { DbResult } from "../db/utils";
import { SUBSCRIPTION_PLANS } from "../constants";

interface UserSubscriptionStatus {
  isLoaded: boolean;
  isPro: boolean;
  hasReachedLimit: boolean;
  availableListings: number | null;
}

// Hook to check subscription status and listing limits
export function useSubscriptionStatus(): UserSubscriptionStatus {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const [status, setStatus] = useState<UserSubscriptionStatus>({
    isLoaded: false,
    isPro: false,
    hasReachedLimit: false,
    availableListings: null,
  });

  useEffect(() => {
    if (!isClerkLoaded || !user) {
      return;
    }

    async function checkSubscription() {
      try {
        const response = await fetch("/api/subscription/status");
        if (!response.ok) {
          throw new Error("Failed to fetch subscription status");
        }

        const data = await response.json();
        
        // Calculate available listings for free plan
        const availableListings = data.isPro 
          ? null // unlimited for pro
          : Math.max(0, SUBSCRIPTION_PLANS.FREE.listingLimit - data.listingsCount);

        setStatus({
          isLoaded: true,
          isPro: data.isPro,
          hasReachedLimit: !data.isPro && data.listingsCount >= SUBSCRIPTION_PLANS.FREE.listingLimit,
          availableListings,
        });
      } catch (error) {
        console.error("Error checking subscription:", error);
        setStatus({
          isLoaded: true,
          isPro: false,
          hasReachedLimit: false,
          availableListings: SUBSCRIPTION_PLANS.FREE.listingLimit,
        });
      }
    }

    checkSubscription();
  }, [user, isClerkLoaded]);

  return status;
}

// Hook to get all connected sites for the user
export function useConnectedSites() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const [connectedSites, setConnectedSites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isClerkLoaded || !user) {
      return;
    }

    async function fetchConnectedSites() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/sites/connected");
        if (!response.ok) {
          throw new Error("Failed to fetch connected sites");
        }

        const data = await response.json();
        setConnectedSites(data);
      } catch (error) {
        console.error("Error fetching connected sites:", error);
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setIsLoading(false);
      }
    }

    fetchConnectedSites();
  }, [user, isClerkLoaded]);

  return { connectedSites, isLoading, error };
}

// Hook to get all available sites
export function useAvailableSites() {
  const [availableSites, setAvailableSites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAvailableSites() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/sites/available");
        if (!response.ok) {
          throw new Error("Failed to fetch available sites");
        }

        const data = await response.json();
        setAvailableSites(data);
      } catch (error) {
        console.error("Error fetching available sites:", error);
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setIsLoading(false);
      }
    }

    fetchAvailableSites();
  }, []);

  return { availableSites, isLoading, error };
}

// Hook to get user's listings with pagination
export function useUserListings(page = 1, limit = 10, status?: string) {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!isClerkLoaded || !user) {
      return;
    }

    async function fetchListings() {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (status) {
          queryParams.append('status', status);
        }
        
        const response = await fetch(`/api/listings?${queryParams}`);
        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data = await response.json();
        setListings(data.listings);
        setTotalCount(data.total);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setIsLoading(false);
      }
    }

    fetchListings();
  }, [user, isClerkLoaded, page, limit, status]);

  return { listings, isLoading, error, totalCount };
} 