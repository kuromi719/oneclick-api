import { prisma } from "./prisma";

interface RateLimitConfig {
  identifier: string;
  endpointId: string;
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { identifier, endpointId, limit, windowMs } = config;
  
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  await prisma.rateLimit.deleteMany({
    where: {
      windowStart: {
        lt: windowStart,
      },
    },
  });

  const currentWindow = new Date(
    Math.floor(now.getTime() / windowMs) * windowMs
  );

  const record = await prisma.rateLimit.findUnique({
    where: {
      identifier_endpointId_windowStart: {
        identifier,
        endpointId,
        windowStart: currentWindow,
      },
    },
  });

  if (!record) {
    await prisma.rateLimit.create({
      data: {
        identifier,
        endpointId,
        count: 1,
        windowStart: currentWindow,
      },
    });

    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: new Date(currentWindow.getTime() + windowMs),
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(currentWindow.getTime() + windowMs),
    };
  }

  await prisma.rateLimit.update({
    where: {
      id: record.id,
    },
    data: {
      count: {
        increment: 1,
      },
    },
  });

  return {
    allowed: true,
    remaining: limit - record.count - 1,
    resetAt: new Date(currentWindow.getTime() + windowMs),
  };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": (result.remaining + (result.allowed ? 1 : 0)).toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.floor(result.resetAt.getTime() / 1000).toString(),
  };
}
