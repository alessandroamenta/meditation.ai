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
    return new NextResponse(JSON.stringify({ error: 'Not authorized' }), { status: 401 });
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
    console.error('Error retrieving meditation audio:', error);
    return NextResponse.json({ error: 'Failed to retrieve meditation audio.' }, { status: 500 });
  }
}