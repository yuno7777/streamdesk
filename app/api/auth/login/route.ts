import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const expectedUser = process.env.BASIC_AUTH_USER || 'admin';
    const expectedPass = process.env.BASIC_AUTH_PASS || 'streamdesk2026';

    if (username === expectedUser && password === expectedPass) {
      const cookieStore = await cookies();
      
      // Set secure session cookie
      cookieStore.set('streamdesk_session', 'streamdesk_active_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid username or password' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('streamdesk_session');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
