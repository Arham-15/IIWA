/**
 * AttendanceSafe API Client
 * 
 * Communicates with the FastAPI backend without exposing any backend secrets.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : ''
);

export class ApiError extends Error {
  constructor(message, status, detail = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Handle HTTP response and unpack JSON or meaningful error details
 */
async function handleResponse(response) {
  if (response.ok) {
    return await response.json();
  }

  let errorDetail = '';
  try {
    const errorJson = await response.json();
    if (typeof errorJson.detail === 'string') {
      errorDetail = errorJson.detail;
    } else if (Array.isArray(errorJson.detail)) {
      // Pydantic validation error array
      errorDetail = errorJson.detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
    } else if (errorJson.message) {
      errorDetail = errorJson.message;
    }
  } catch {
    // If not JSON, use status text
    errorDetail = response.statusText || 'Unexpected server error';
  }

  let friendlyMessage = errorDetail;
  if (!friendlyMessage) {
    switch (response.status) {
      case 422:
        friendlyMessage = 'Could not validate the input data or image format.';
        break;
      case 429:
        friendlyMessage = 'A lot of students are using this right now. Please try again in about 30 seconds, or use manual entry instead.';
        break;
      case 500:
        friendlyMessage = 'Server configuration error. Please ensure the backend is properly set up.';
        break;
      case 502:
        friendlyMessage = 'AI service is temporarily unreachable. Please try again shortly.';
        break;
      default:
        friendlyMessage = `Request failed with status ${response.status}.`;
    }
  }

  throw new ApiError(friendlyMessage, response.status, errorDetail);
}

/**
 * POST /calculate-manual
 * @param {{ total: number, attended: number, remaining?: number | null }} payload
 */
export async function calculateManual(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/calculate-manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        total: parseInt(payload.total, 10),
        attended: parseInt(payload.attended, 10),
        remaining: payload.remaining !== undefined && payload.remaining !== '' && payload.remaining !== null
          ? parseInt(payload.remaining, 10)
          : null,
      }),
    });

    return await handleResponse(response);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      'Unable to connect to the AttendanceSafe server. Please make sure the backend is running at port 8000.',
      0,
      err.message
    );
  }
}

/**
 * POST /calculate-ai
 * @param {File} file
 */
export async function calculateAI(file) {
  if (!file) {
    throw new ApiError('Please select or drop an image file first.', 400);
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/calculate-ai`, {
      method: 'POST',
      body: formData,
    });

    return await handleResponse(response);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      'Unable to connect to the AttendanceSafe server. Please make sure the backend is running at port 8000.',
      0,
      err.message
    );
  }
}
