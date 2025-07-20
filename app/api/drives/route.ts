// app/api/drives/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  initializeDriveSheet, 
  getAllDrives, 
  addDrive, 
  updateDrive, 
  deleteDrive, 
  getDriveById,
  getDrivesByStatus,
  batchUpdateDrives,
  DriveData,
  invalidateCache,
  getCacheStats
} from '@/lib/driveSheetHelpers';

// Advanced rate limiting with sliding window
interface RateLimitEntry {
  requests: number[];
  lastReset: number;
}

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 50; // Increased limit
const rateLimitStore = new Map<string, RateLimitEntry>();

// Multi-tier caching system
interface CacheEntry {
  data: any;
  timestamp: number;
  etag: string;
  hits: number;
}

const responseCache = new Map<string, CacheEntry>();
const RESPONSE_CACHE_TTL = 30 * 1000; // 30 seconds for responses
const MAX_CACHE_SIZE = 100;

// Performance monitoring
const performanceMetrics = {
  requests: 0,
  cacheHits: 0,
  avgResponseTime: 0,
  slowRequests: 0
};

// Advanced rate limiting with sliding window
function advancedRateLimit(ip: string): { allowed: boolean; remainingRequests: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  let entry = rateLimitStore.get(ip);
  if (!entry) {
    entry = { requests: [], lastReset: now };
    rateLimitStore.set(ip, entry);
  }
  
  // Clean old requests
  entry.requests = entry.requests.filter(timestamp => timestamp > windowStart);
  
  if (entry.requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remainingRequests: 0 };
  }
  
  entry.requests.push(now);
  return { 
    allowed: true, 
    remainingRequests: RATE_LIMIT_MAX_REQUESTS - entry.requests.length 
  };
}

// Enhanced IP detection
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const cfConnecting = request.headers.get('cf-connecting-ip');
  
  if (cfConnecting) return cfConnecting;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (real) return real;
  
  return request.ip || 'unknown';
}

// Response cache management
function getCacheKey(url: string, method: string): string {
  return `${method}:${url}`;
}

function getFromCache(key: string): any | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > RESPONSE_CACHE_TTL) {
    responseCache.delete(key);
    return null;
  }
  
  entry.hits++;
  performanceMetrics.cacheHits++;
  return entry.data;
}

function setCache(key: string, data: any): void {
  // Implement LRU eviction
  if (responseCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = Array.from(responseCache.entries())
      .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0][0];
    responseCache.delete(oldestKey);
  }
  
  responseCache.set(key, {
    data,
    timestamp: Date.now(),
    etag: generateETag(data),
    hits: 0
  });
}

function generateETag(data: any): string {
  return Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16);
}

// Performance monitoring middleware
function trackPerformance(startTime: number): void {
  const duration = Date.now() - startTime;
  performanceMetrics.requests++;
  performanceMetrics.avgResponseTime = 
    (performanceMetrics.avgResponseTime * (performanceMetrics.requests - 1) + duration) / performanceMetrics.requests;
  
  if (duration > 1000) {
    performanceMetrics.slowRequests++;
  }
}

// HTTP caching headers
function addCacheHeaders(response: NextResponse, data: any, maxAge: number = 30): NextResponse {
  const etag = generateETag(data);
  response.headers.set('ETag', etag);
  response.headers.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=60`);
  response.headers.set('Vary', 'Accept-Encoding');
  return response;
}

/**
 * GET - Optimized with multi-layer caching
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const { searchParams, pathname } = new URL(request.url);
  
  // Rate limiting
  const { allowed, remainingRequests } = advancedRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000) },
      { 
        status: 429,
        headers: { 'Retry-After': Math.ceil(RATE_LIMIT_WINDOW / 1000).toString() }
      }
    );
  }
  
  try {
    // Check if-none-match header for 304 responses
    const ifNoneMatch = request.headers.get('if-none-match');
    const cacheKey = getCacheKey(request.url, 'GET');
    
    // Try response cache first
    const cachedResponse = getFromCache(cacheKey);
    if (cachedResponse) {
      const etag = generateETag(cachedResponse);
      if (ifNoneMatch === etag) {
        return new NextResponse(null, { status: 304 });
      }
      
      const response = NextResponse.json(cachedResponse);
      addCacheHeaders(response, cachedResponse);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('X-RateLimit-Remaining', remainingRequests.toString());
      trackPerformance(startTime);
      return response;
    }
    
    // Initialize sheet only if needed
    if (!searchParams.get('skipInit')) {
      await initializeDriveSheet();
    }
    
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    
    let result: any;
    
    if (id) {
      result = await getDriveById(id);
      if (!result) {
        return NextResponse.json(
          { error: 'Drive not found' },
          { status: 404 }
        );
      }
    } else if (status) {
      result = await getDrivesByStatus(status);
    } else {
      result = await getAllDrives();
    }
    
    // Apply pagination if requested
    if (limit && Array.isArray(result)) {
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset || '0');
      const total = result.length;
      result = {
        data: result.slice(offsetNum, offsetNum + limitNum),
        pagination: {
          total,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < total
        }
      };
    }
    
    // Cache the response
    setCache(cacheKey, result);
    
    const response = NextResponse.json(result);
    addCacheHeaders(response, result);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('X-RateLimit-Remaining', remainingRequests.toString());
    
    // Add performance headers
    const cacheStats = getCacheStats();
    response.headers.set('X-Cache-Stats', JSON.stringify(cacheStats));
    
    trackPerformance(startTime);
    return response;
    
  } catch (error) {
    console.error('Error in GET /api/drives:', error);
    trackPerformance(startTime);
    return NextResponse.json(
      { error: 'Failed to fetch drives', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Optimized with immediate cache updates
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  
  const { allowed, remainingRequests } = advancedRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Enhanced validation
    const requiredFields = ['title', 'location', 'date', 'organizer', 'contactEmail'];
    const missingFields = requiredFields.filter(field => !body[field]?.trim());
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.contactEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }
    
    const driveData: DriveData = {
      title: body.title.trim(),
      location: body.location.trim(),
      date: body.date,
      participants: Math.max(0, parseInt(body.participants) || 0),
      treesTarget: Math.max(0, parseInt(body.treesTarget) || 0),
      status: body.status || 'upcoming',
      registrationOpen: body.registrationOpen ?? true,
      description: body.description?.trim() || '',
      organizer: body.organizer.trim(),
      contactEmail: body.contactEmail.trim().toLowerCase(),
      registrationDeadline: body.registrationDeadline || '',
      meetingPoint: body.meetingPoint?.trim() || '',
      duration: body.duration?.trim() || '',
      difficulty: body.difficulty || 'Easy',
      logo: body.logo?.trim() || ''
    };
    
    const newDrive = await addDrive(driveData);
    
    // Invalidate related caches
    responseCache.clear();
    
    const response = NextResponse.json(newDrive, { status: 201 });
    response.headers.set('X-RateLimit-Remaining', remainingRequests.toString());
    trackPerformance(startTime);
    return response;
    
  } catch (error) {
    console.error('Error in POST /api/drives:', error);
    trackPerformance(startTime);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create drive' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Optimized updates with partial validation
 */
export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  
  const { allowed, remainingRequests } = advancedRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Drive ID is required' },
        { status: 400 }
      );
    }
    
    const { id, ...updateData } = body;
    
    // Validate only provided fields
    if (updateData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.contactEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    if (updateData.date && !/^\d{4}-\d{2}-\d{2}$/.test(updateData.date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }
    
    // Sanitize string fields
    const sanitizedData = Object.entries(updateData).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = value.trim();
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    const updatedDrive = await updateDrive(id, sanitizedData);
    
    // Invalidate related caches
    responseCache.clear();
    
    const response = NextResponse.json(updatedDrive);
    response.headers.set('X-RateLimit-Remaining', remainingRequests.toString());
    trackPerformance(startTime);
    return response;
    
  } catch (error) {
    console.error('Error in PUT /api/drives:', error);
    trackPerformance(startTime);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update drive' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Optimized with immediate cache invalidation
 */
export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  
  const { allowed, remainingRequests } = advancedRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Drive ID is required' },
        { status: 400 }
      );
    }
    
    const success = await deleteDrive(id);
    
    if (success) {
      // Invalidate all caches
      responseCache.clear();
      
      const response = NextResponse.json({ 
        message: 'Drive deleted successfully',
        id: id 
      });
      response.headers.set('X-RateLimit-Remaining', remainingRequests.toString());
      trackPerformance(startTime);
      return response;
    } else {
      return NextResponse.json(
        { error: 'Failed to delete drive' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in DELETE /api/drives:', error);
    trackPerformance(startTime);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete drive' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Enhanced bulk operations with progress tracking
 */
export async function PATCH(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  
  const { allowed, remainingRequests } = advancedRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  try {
    const body = await request.json();
    const { operation, data } = body;
    
    switch (operation) {
      case 'bulk_update_status':
        const { ids, status } = data;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return NextResponse.json(
            { error: 'Invalid or empty IDs array' },
            { status: 400 }
          );
        }
        
        if (!['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
          return NextResponse.json(
            { error: 'Invalid status value' },
            { status: 400 }
          );
        }
        
        // Use optimized batch update
        const updates = ids.map((id: string) => ({ id, data: { status } }));
        const results = await batchUpdateDrives(updates);
        
        responseCache.clear();
        
        const response = NextResponse.json({ 
          message: 'Bulk status update completed',
          updated: results.length,
          results: results.map(r => ({ id: r.id, status: r.status }))
        });
        response.headers.set('X-RateLimit-Remaining', remainingRequests.toString());
        trackPerformance(startTime);
        return response;
        
      case 'bulk_update_fields':
        const { updates: fieldUpdates } = data;
        
        if (!Array.isArray(fieldUpdates) || fieldUpdates.length === 0) {
          return NextResponse.json(
            { error: 'Invalid updates array' },
            { status: 400 }
          );
        }
        
        const batchResults = await batchUpdateDrives(fieldUpdates);
        responseCache.clear();
        
        const batchResponse = NextResponse.json({ 
          message: 'Bulk update completed',
          updated: batchResults.length,
          results: batchResults
        });
        batchResponse.headers.set('X-RateLimit-Remaining', remainingRequests.toString());
        trackPerformance(startTime);
        return batchResponse;
        
      case 'initialize_sheet':
        await initializeDriveSheet();
        const initResponse = NextResponse.json({ message: 'Sheet initialized successfully' });
        initResponse.headers.set('X-RateLimit-Remaining', remainingRequests.toString());
        trackPerformance(startTime);
        return initResponse;
        
      case 'clear_cache':
        responseCache.clear();
        invalidateCache();
        const clearResponse = NextResponse.json({ 
          message: 'All caches cleared successfully',
          timestamp: new Date().toISOString()
        });
        clearResponse.headers.set('X-RateLimit-Remaining', remainingRequests.toString());
        trackPerformance(startTime);
        return clearResponse;
        
      case 'get_stats':
        const stats = {
          performance: performanceMetrics,
          cache: {
            responseCache: {
              size: responseCache.size,
              maxSize: MAX_CACHE_SIZE,
              hitRate: performanceMetrics.requests > 0 ? 
                (performanceMetrics.cacheHits / performanceMetrics.requests * 100).toFixed(2) + '%' : '0%'
            },
            driveCache: getCacheStats()
          },
          rateLimit: {
            totalIPs: rateLimitStore.size,
            window: RATE_LIMIT_WINDOW / 1000 + 's',
            maxRequests: RATE_LIMIT_MAX_REQUESTS
          }
        };
        
        const statsResponse = NextResponse.json(stats);
        statsResponse.headers.set('X-RateLimit-Remaining', remainingRequests.toString());
        trackPerformance(startTime);
        return statsResponse;
        
      default:
        return NextResponse.json(
          { error: 'Invalid operation. Supported: bulk_update_status, bulk_update_fields, initialize_sheet, clear_cache, get_stats' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Error in PATCH /api/drives:', error);
    trackPerformance(startTime);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform operation' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS - CORS preflight with caching info
 */
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, If-None-Match');
  response.headers.set('Access-Control-Expose-Headers', 'ETag, X-Cache, X-RateLimit-Remaining');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return response;
}

// Cleanup function to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  
  // Clean up expired rate limit entries
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now - entry.lastReset > RATE_LIMIT_WINDOW * 2) {
      rateLimitStore.delete(ip);
    }
  }
  
  // Clean up expired cache entries
  for (const [key, entry] of responseCache.entries()) {
    if (now - entry.timestamp > RESPONSE_CACHE_TTL * 2) {
      responseCache.delete(key);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

export const dynamic = 'auto';
export const runtime = 'nodejs';