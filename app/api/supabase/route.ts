// app/api/get-meditation-audio/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { auth } from "@/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    console.log('No session found or user ID is missing');
    return new NextResponse(JSON.stringify({ error: "Not authorized" }), { status: 401 });
  }
  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const meditationId = searchParams.get('meditationId');
  if (!meditationId) {
    return NextResponse.json({ error: 'Meditation ID is required.' }, { status: 400 });
  }
  try {
    const { data: meditationData, error: meditationError } = await supabase
      .from('meditations')
      .select('audio_path')
      .eq('id', meditationId)
      .eq('user_id', userId)
      .single();

    if (meditationError) {
      console.error('Error retrieving meditation data:', meditationError);
      return NextResponse.json({ error: 'Failed to retrieve meditation data.' }, { status: 500 });
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('private_meditations')
      .createSignedUrl(`user_${userId}/${meditationData.audio_path}`, 60 * 60);

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return NextResponse.json({ error: 'Failed to create signed URL.' }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: signedUrlData.signedUrl });
  } catch (error) {
    console.error('Error retrieving meditation:', error);
    return NextResponse.json({ error: 'Failed to retrieve meditation.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      console.log('No session found or user ID is missing');
      return new NextResponse(JSON.stringify({ error: "Not authorized" }), { status: 401 });
    }
  
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const meditationId = searchParams.get('meditationId');
    if (!meditationId) {
      return NextResponse.json({ error: 'Meditation ID is required.' }, { status: 400 });
    }
  
    try {
      const { data: meditationData, error: meditationError } = await supabase
        .from('meditations')
        .select('audio_path')
        .eq('id', meditationId)
        .eq('user_id', userId);
  
      if (meditationError) {
        console.error('Error retrieving meditation data:', meditationError);
        return NextResponse.json({ error: 'Failed to retrieve meditation data.' }, { status: 500 });
      }
  
      const audioPath = `user_${userId}/${meditationData[0].audio_path}`;
  
      // Delete the audio file from the storage bucket
      const { data: deleteData, error: deleteError } = await supabase.storage
        .from('private_meditations')
        .remove([audioPath]);
  
      if (deleteError) {
        console.error('Error deleting meditation audio:', deleteError);
        return NextResponse.json({ error: 'Failed to delete meditation audio.' }, { status: 500 });
      }
  
      // Delete the meditation record from the meditations table
      const { data: deleteMeditationData, error: deleteMeditationError } = await supabase
        .from('meditations')
        .delete()
        .eq('id', meditationId)
        .eq('user_id', userId);
  
      if (deleteMeditationError) {
        console.error('Error deleting meditation record:', deleteMeditationError);
        return NextResponse.json({ error: 'Failed to delete meditation record.' }, { status: 500 });
      }
  
      console.log('Meditation deleted successfully.');
      return NextResponse.json({ message: 'Meditation deleted successfully.' });
    } catch (error) {
      console.error('Error deleting meditation:', error);
      return NextResponse.json({ error: 'Failed to delete meditation.' }, { status: 500 });
    }
  }

  export async function PUT(req: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      console.log('No session found or user ID is missing');
      return new NextResponse(JSON.stringify({ error: "Not authorized" }), { status: 401 });
    }
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const meditationId = searchParams.get('meditationId');
    if (!meditationId) {
      return NextResponse.json({ error: 'Meditation ID is required.' }, { status: 400 });
    }
    const { newName } = await req.json();
    if (!newName) {
      return NextResponse.json({ error: 'New name is required.' }, { status: 400 });
    }
    try {
      // Update the display_name in the meditations table
      const { data: updateData, error: updateError } = await supabase
        .from('meditations')
        .update({ display_name: newName })
        .eq('id', meditationId)
        .eq('user_id', userId);
  
      if (updateError) {
        console.error('Error updating meditation name:', updateError);
        return NextResponse.json({ error: 'Failed to update meditation name.' }, { status: 500 });
      }
  
      console.log('Meditation renamed successfully.');
      return NextResponse.json({ message: 'Meditation renamed successfully.' });
    } catch (error) {
      console.error('Error renaming meditation:', error);
      return NextResponse.json({ error: 'Failed to rename meditation.' }, { status: 500 });
    }
  }