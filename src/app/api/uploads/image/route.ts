import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client for storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * API route for image uploads
 * Accepts multipart form data with a file field
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file type
    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }
    
    // Validate file size (limit to 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }
    
    // Convert the file to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate a unique file name
    const fileExtension = fileType.split('/')[1];
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`;
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('listing-images')
      .upload(fileName, buffer, {
        contentType: fileType,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Error uploading image to storage:', error);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('listing-images')
      .getPublicUrl(fileName);
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName: fileName
    });
    
  } catch (error: any) {
    console.error('Error in image upload API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

// Set the maximum request body size
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}; 