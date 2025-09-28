import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Extractive Summarization API is running',
    timestamp: new Date().toISOString()
  });
}
