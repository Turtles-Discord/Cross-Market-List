import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

// CORS headers to allow the extension to communicate with the API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated with Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated'
      }, { status: 401, headers: corsHeaders });
    }

    // Get user details
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404, headers: corsHeaders });
    }

    // Return successful authentication with basic user info
    return NextResponse.json({
      success: true,
      message: 'Authenticated',
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl
      }
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Authentication error'
    }, { status: 500, headers: corsHeaders });
  }
} 