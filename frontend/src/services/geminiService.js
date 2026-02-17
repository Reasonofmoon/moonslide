import { GoogleGenerativeAI } from '@google/generative-ai';

const ANALYSIS_PROMPT = `이 슬라이드 이미지를 분석하여 모든 텍스트 요소를 추출해주세요.

각 텍스트 요소에 대해 다음 정보를 JSON으로 제공해주세요:
- type: "title" | "subtitle" | "text" | "caption"
- content: 정확한 텍스트 내용
- x: 슬라이드 왼쪽에서의 위치 (0~100 퍼센트)
- y: 슬라이드 위쪽에서의 위치 (0~100 퍼센트)
- w: 너비 (0~100 퍼센트)
- h: 높이 (0~100 퍼센트)
- fontSize: 추정 폰트 크기 (pt)
- color: 텍스트 색상 (hex, 예: "#FFFFFF")
- bgColor: 텍스트 뒤의 배경 색상 (hex, 예: "#1a1a2e"). 슬라이드 배경이 어두우면 어두운 색, 밝으면 밝은 색으로 정확히 감지
- bold: 굵기 여부 (true/false)
- align: 정렬 ("left" | "center" | "right")

중요 규칙:
1. 가까운 텍스트는 하나의 블록으로 그룹화
2. 바운딩 박스에 2% 패딩 추가
3. 정확한 폰트 크기 보존
4. 퍼센트 기반 좌표 사용 (0~100)
5. 깨진 텍스트도 최선을 다해 복원
6. 텍스트가 없는 장식 요소는 무시
7. bgColor는 반드시 텍스트 영역 뒤의 실제 배경 색상을 감지하세요. 그라데이션이면 가장 주된 색상을 사용

반드시 아래 JSON 형식으로만 응답하세요:
{ "elements": [ { "type": "...", "content": "...", "bgColor": "#...", ... } ] }`;


/**
 * Classify Gemini API errors into user-friendly messages
 */
function classifyError(error) {
  const msg = error?.message || String(error);

  if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid'))
    return { code: 'INVALID_KEY', message: 'API 키가 유효하지 않습니다. Google AI Studio에서 키를 확인해주세요.' };

  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota'))
    return { code: 'QUOTA', message: 'API 사용량 한도에 도달했습니다. 잠시 후 다시 시도하거나, Google AI Studio에서 한도를 확인해주세요.' };

  if (msg.includes('PERMISSION_DENIED'))
    return { code: 'PERMISSION', message: 'API 키에 Gemini 사용 권한이 없습니다. Google AI Studio에서 키 설정을 확인해주세요.' };

  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::'))
    return { code: 'NETWORK', message: '네트워크 연결을 확인해주세요. 인터넷이 끊어져 있거나 방화벽에 의해 차단되었을 수 있습니다.' };

  if (msg.includes('SAFETY') || msg.includes('blocked'))
    return { code: 'SAFETY', message: '이미지가 안전 필터에 의해 차단되었습니다. 다른 슬라이드를 시도해주세요.' };

  if (msg.includes('model') && msg.includes('not found'))
    return { code: 'MODEL', message: 'AI 모델에 접근할 수 없습니다. 잠시 후 다시 시도해주세요.' };

  return { code: 'UNKNOWN', message: `분석 중 오류가 발생했습니다: ${msg}` };
}

/**
 * Analyze a slide image using Gemini Vision
 */
export async function analyzeSlide(apiKey, imageDataUrl) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Convert data URL to base64
  const base64Data = imageDataUrl.split(',')[1];
  const mimeType = imageDataUrl.split(';')[0].split(':')[1];

  let result;
  try {
    result = await model.generateContent([
      ANALYSIS_PROMPT,
      { inlineData: { data: base64Data, mimeType } },
    ]);
  } catch (error) {
    const classified = classifyError(error);
    throw new Error(classified.message);
  }

  const text = result.response.text();

  if (!text || text.trim().length === 0) {
    return { elements: [], warning: '이 슬라이드에서 텍스트를 찾지 못했습니다.' };
  }

  // Parse JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  const jsonStr = jsonMatch[1].trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    console.error('Failed to parse Gemini response:', text);
    return { elements: [], warning: 'AI 응답을 파싱하지 못했습니다. 다시 시도해주세요.' };
  }
}

/**
 * Analyze multiple slides with progress callback
 */
export async function analyzeSlides(apiKey, slideImages, onProgress) {
  const results = [];
  let errorCount = 0;

  for (let i = 0; i < slideImages.length; i++) {
    try {
      const analysis = await analyzeSlide(apiKey, slideImages[i].dataUrl);
      results.push({
        pageNum: slideImages[i].pageNum || i + 1,
        elements: analysis.elements || [],
        warning: analysis.warning || null,
        imageDataUrl: slideImages[i].dataUrl,
        width: slideImages[i].width,
        height: slideImages[i].height,
      });
    } catch (error) {
      errorCount++;
      results.push({
        pageNum: slideImages[i].pageNum || i + 1,
        elements: [],
        imageDataUrl: slideImages[i].dataUrl,
        width: slideImages[i].width,
        height: slideImages[i].height,
        error: error.message,
      });

      // If ALL slides fail, the API key is probably bad — stop early
      if (errorCount === slideImages.length || (i >= 2 && errorCount === i + 1)) {
        throw new Error(error.message);
      }
    }
    if (onProgress) onProgress(i + 1, slideImages.length);
  }

  return results;
}

/**
 * Quick test to validate API key
 */
export async function testApiKey(apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    await model.generateContent('Say "OK" in one word.');
    return { valid: true };
  } catch (error) {
    const classified = classifyError(error);
    return { valid: false, error: classified.message };
  }
}
