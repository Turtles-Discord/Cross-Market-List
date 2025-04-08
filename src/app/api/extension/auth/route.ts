import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserById } from '@/lib/db/utils';

/**
 * Endpoint to authenticate the Chrome extension
 * Provides user information to the extension
 */
export async function POST() {
  try {
    // Get the user ID from the session
    const { userId } = await auth();
    
    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }
    
    // Get user details
    const { data: user, error: userError } = await getUserById(userId);
    
    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }
    
    // Return user information to the extension
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: user.email || '',
        fullName: user.full_name || '',
        imageUrl: user.image_url || '',
      }
    });
    
  } catch (error: any) {
    console.error('Extension auth error:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication error',
      error: error.message
    }, { status: 500 });
  }
} 