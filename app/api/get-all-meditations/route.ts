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
        .select('id, audio_path, duration')
        .eq('user_id', userId);
  
      if (error) throw error;
  
      return new NextResponse(JSON.stringify(meditations), { status: 200 });
    } catch (error) {
      console.error('Error retrieving meditations:', error);
      return new NextResponse(JSON.stringify({ error: 'Failed to retrieve meditations.' }), { status: 500 });
    }
  }