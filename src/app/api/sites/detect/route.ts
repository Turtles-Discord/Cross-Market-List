import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserById } from '@/lib/db/utils';
import { MARKETPLACE_PLATFORMS } from '@/lib/constants';

/**
 * API endpoint to receive site detection notifications from the extension
 */
export async function POST(req: Request) {
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
    
    // Get the request body
    const body = await req.json();
    const { siteId, siteUrl, timestamp } = body;
    
    if (!siteId || !siteUrl) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: siteId, siteUrl'
      }, { status: 400 });
    }
    
    // Check if the site is supported
    const site = MARKETPLACE_PLATFORMS.find(p => p.id === siteId);
    if (!site) {
      return NextResponse.json({
        success: false,
        message: `Unsupported site: ${siteId}`
      }, { status: 400 });
    }
    
    // Get user details
    const { data: user, error: userError } = await getUserById(userId);
    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }
    
    // Log the site detection (in a real implementation, this would be saved to the database)
    console.log(`Site detected: ${siteId} at ${new Date(timestamp || Date.now()).toISOString()} for user ${userId}`);
    console.log(`Site URL: ${siteUrl}`);
    
    // Here you would typically save this information to the database
    // For now, we just return success
    
    return NextResponse.json({
      success: true,
      message: 'Site detection recorded',
      data: {
        siteId,
        siteName: site.name,
        timestamp: timestamp || Date.now(),
        userId
      }
    });
  } catch (error: any) {
    console.error('Error processing site detection:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing site detection',
      error: error.message
    }, { status: 500 });
  }
} 