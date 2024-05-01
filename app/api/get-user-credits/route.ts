// app/api/get-user-credits/route.ts
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
    const { data: userData, error } = await supabase
      .schema('next_auth')
      .from('users')
      .select('credits, subscriptionPlan')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    return NextResponse.json({ credits: userData.credits, subscriptionPlan: userData.subscriptionPlan });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
