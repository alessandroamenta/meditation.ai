// app/api/get-all-meditations/route.ts
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

  try {
    const { data: meditations, error } = await supabase
      .from('meditations')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const meditationsWithSignedUrls = await Promise.all(
      meditations.map(async (meditation) => {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('private_meditations')
          .createSignedUrl(`user_${userId}/${meditation.audio_path}`, 60 * 60);

        if (signedUrlError) throw signedUrlError;

        return { ...meditation, signedUrl: signedUrlData.signedUrl };
      })
    );

    return new NextResponse(JSON.stringify(meditationsWithSignedUrls), { status: 200 });
  } catch (error) {
    console.error('Error retrieving meditations:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to retrieve meditations.' }), { status: 500 });
  }
}