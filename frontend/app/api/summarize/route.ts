import { NextRequest, NextResponse } from 'next/server';

// Simple extractive summarization algorithm
function extractiveSummarize(text: string, topK: number = 3): string {
  // Split text into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (sentences.length <= topK) {
    return text;
  }

  // Simple scoring based on word frequency and position
  const words = text.toLowerCase().split(/\s+/);
  const wordFreq: { [key: string]: number } = {};
  
  // Calculate word frequencies
  words.forEach(word => {
    if (word.length > 3) { // Only count words longer than 3 characters
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Score sentences
  const scoredSentences = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    let score = 0;
    
    // Word frequency score
    sentenceWords.forEach(word => {
      if (word.length > 3) {
        score += wordFreq[word] || 0;
      }
    });
    
    // Position score (first and last sentences get bonus)
    if (index === 0 || index === sentences.length - 1) {
      score += 2;
    }
    
    // Length penalty for very short sentences
    if (sentenceWords.length < 5) {
      score *= 0.5;
    }
    
    return { sentence, score, index };
  });

  // Sort by score and select top K
  const selected = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .sort((a, b) => a.index - b.index); // Maintain original order

  return selected.map(s => s.sentence).join('. ').trim() + '.';
}

export async function POST(request: NextRequest) {
  try {
    const { text, top_k = 3 } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const summary = extractiveSummarize(text, top_k);

    return NextResponse.json({
      summary
    });

  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Summarization API is running'
  });
}
