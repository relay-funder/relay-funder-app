import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { CROWDSPLIT_WEBHOOK_SECRET } from '@/lib/constant';
import { prisma } from '@/lib/prisma';

// Define webhook body types
interface WebhookBody {
  secret?: string;
  data?: {
    type?: string;
    id?: string;
    status?: string;
    subStatus?: string;
    metadata?: Record<string, unknown> | null;
    [key: string]: unknown;
  };
  // Legacy fields for backwards compatibility
  event?: string;
  transaction_id?: string;
  status?: string;
  type?: string;
  object?: string;
  id?: string;
  amount?: number;
  currency?: string;
  created?: number;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const requestId = crypto.randomUUID();
  
  console.log(`\n🔍 [DEBUG WEBHOOK] ${timestamp} - Request ID: ${requestId}`);
  console.log('===============================================');
  
  try {
    // Log request URL and method
    console.log(`📍 URL: ${request.url}`);
    console.log(`🔧 Method: ${request.method}`);
    
    // Log ALL headers comprehensively
    console.log('\n📋 All Headers:');
    const headers: Record<string, string> = {};
    const sensitiveHeaders = ['authorization', 'signature', 'secret', 'token', 'key', 'auth'];
    const possibleSignatureHeaders = [
      'x-crowdsplit-signature',
      'x-signature', 
      'stripe-signature',
      'x-webhook-signature',
      'webhook-signature',
      'x-hub-signature',
      'x-hub-signature-256',
      'x-paypal-transmission-sig',
      'x-square-signature',
      'authorization',
      'x-auth-token',
      'x-api-key',
      'crowdsplit-signature',
      'signature'
    ];
    
    const foundSignatureHeaders: string[] = [];
    
    request.headers.forEach((value, key) => {
      headers[key] = value;
      const keyLower = key.toLowerCase();
      
      // Check if this could be a signature header
      if (possibleSignatureHeaders.some(h => keyLower.includes(h.toLowerCase()) || h.toLowerCase().includes(keyLower))) {
        foundSignatureHeaders.push(key);
      }
      
      // Log with security considerations
      if (sensitiveHeaders.some(sensitive => keyLower.includes(sensitive))) {
        console.log(`  ${key}: ${value.substring(0, 20)}... (truncated for security)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
    
    // Highlight potential signature headers
    if (foundSignatureHeaders.length > 0) {
      console.log(`\n🔐 Potential signature/auth headers found: ${foundSignatureHeaders.join(', ')}`);
    } else {
      console.log(`\n🔐 No obvious signature/auth headers detected`);
    }
    
    // Log query parameters
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams);
    if (Object.keys(searchParams).length > 0) {
      console.log('\n🔍 Query Parameters:');
      console.log(JSON.stringify(searchParams, null, 2));
    }
    
    // Get raw body for signature verification
    let bodyText = '';
    let body: WebhookBody | null = null;
    
    try {
      bodyText = await request.text();
      if (bodyText) {
        console.log(`\n📦 Raw Body Length: ${bodyText.length} bytes`);
        
        // Try to parse as JSON
        try {
          body = JSON.parse(bodyText) as WebhookBody;
          console.log('📦 Body (JSON):');
          console.log(JSON.stringify(body, null, 2));
        } catch {
          console.log('📦 Body (Raw Text):');
          console.log(bodyText);
        }
      } else {
        console.log('\n📦 Body: Empty');
      }
    } catch (error) {
      console.log('\n❌ Error reading body:', error);
    }
    
    // Enhanced Webhook Authentication Analysis
    console.log('\n🔐 Webhook Authentication Analysis:');
    console.log(`  Has CROWDSPLIT_WEBHOOK_SECRET: ${!!CROWDSPLIT_WEBHOOK_SECRET}`);
    console.log(`  CROWDSPLIT_WEBHOOK_SECRET value: ${CROWDSPLIT_WEBHOOK_SECRET ? CROWDSPLIT_WEBHOOK_SECRET.substring(0, 10) + '...' : 'Not set'}`);
    
    // Check for secret in payload
    const payloadSecret = body?.secret;
    console.log(`  Secret in payload: ${payloadSecret ? payloadSecret : 'None'}`);
    
    // Try all possible signature headers
    const allPossibleSignatures = possibleSignatureHeaders.map(headerName => ({
      name: headerName,
      value: request.headers.get(headerName)
    })).filter(h => h.value);
    
    console.log(`  All signature-like headers found: ${allPossibleSignatures.length}`);
    allPossibleSignatures.forEach(({ name, value }) => {
      console.log(`    ${name}: ${value?.substring(0, 30)}...`);
    });
    
    let isSignatureValid = false;
    let authenticationMethod = 'none';
    let authenticationDetails = '';
    
    // Method 1: Check payload secret against environment variable
    if (CROWDSPLIT_WEBHOOK_SECRET && payloadSecret) {
      if (CROWDSPLIT_WEBHOOK_SECRET === payloadSecret) {
        isSignatureValid = true;
        authenticationMethod = 'payload_secret_match';
        authenticationDetails = 'Payload secret matches environment variable';
        console.log(`  ✅ Payload secret validation: VALID`);
      } else {
        authenticationDetails = 'Payload secret does not match environment variable';
        console.log(`  ❌ Payload secret validation: INVALID`);
        console.log(`    Expected: ${CROWDSPLIT_WEBHOOK_SECRET}`);
        console.log(`    Received: ${payloadSecret}`);
      }
    }
    
    // Method 2: Try signature header validation if we haven't found valid auth yet
    if (!isSignatureValid && allPossibleSignatures.length > 0 && CROWDSPLIT_WEBHOOK_SECRET && bodyText) {
      for (const { name, value: signatureHeader } of allPossibleSignatures) {
        if (!signatureHeader) continue;
        
        console.log(`\n  Testing signature header: ${name}`);
        
        try {
          // Stripe-style signature validation
          if (signatureHeader.includes('t=') && signatureHeader.includes('v1=')) {
            const elements = signatureHeader.split(',');
            let timestampElement = '';
            let signatureElement = '';
            
            elements.forEach(element => {
              const [key, value] = element.split('=');
              if (key === 't') timestampElement = value;
              else if (key === 'v1') signatureElement = value;
            });
            
            if (timestampElement && signatureElement) {
              const payload = timestampElement + '.' + bodyText;
              const expectedSignature = crypto
                .createHmac('sha256', CROWDSPLIT_WEBHOOK_SECRET)
                .update(payload, 'utf8')
                .digest('hex');
              
              if (expectedSignature === signatureElement) {
                isSignatureValid = true;
                authenticationMethod = 'stripe_style_signature';
                authenticationDetails = `Valid Stripe-style signature via ${name}`;
                console.log(`    ✅ Stripe-style validation: VALID`);
                break;
              } else {
                console.log(`    ❌ Stripe-style validation: INVALID`);
              }
            }
          }
          
          // Simple HMAC validation
          const expectedSignature = crypto
            .createHmac('sha256', CROWDSPLIT_WEBHOOK_SECRET)
            .update(bodyText, 'utf8')
            .digest('hex');
          
          if (expectedSignature === signatureHeader) {
            isSignatureValid = true;
            authenticationMethod = 'hmac_signature';
            authenticationDetails = `Valid HMAC signature via ${name}`;
            console.log(`    ✅ Simple HMAC validation: VALID`);
            break;
          } else {
            console.log(`    ❌ Simple HMAC validation: INVALID`);
          }
          
          // Try with sha1 (GitHub style)
          const expectedSignatureSha1 = crypto
            .createHmac('sha1', CROWDSPLIT_WEBHOOK_SECRET)
            .update(bodyText, 'utf8')
            .digest('hex');
          
          if (signatureHeader === expectedSignatureSha1 || signatureHeader === `sha1=${expectedSignatureSha1}`) {
            isSignatureValid = true;
            authenticationMethod = 'github_style_signature';
            authenticationDetails = `Valid GitHub-style signature via ${name}`;
            console.log(`    ✅ GitHub-style validation: VALID`);
            break;
          }
          
        } catch (signatureError) {
          console.log(`    ❌ Signature validation error: ${signatureError}`);
        }
      }
    }
    
    console.log(`\n  Final Authentication Result: ${isSignatureValid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`  Authentication Method: ${authenticationMethod}`);
    console.log(`  Details: ${authenticationDetails}`);
    
    // Enhanced Payment Event Processing Logic
    console.log('\n💳 Payment Event Processing:');
    if (body && typeof body === 'object') {
      // Handle CrowdSplit's nested structure
      const eventData = body.data || body;
      const eventType = eventData.type || body.event || body.type;
      const transactionId = eventData.id || body.transaction_id || body.id;
      const status = eventData.status || body.status;
      const subStatus = eventData.subStatus;
      
      console.log(`  Event Type: ${eventType || 'unknown'}`);
      console.log(`  Transaction ID: ${transactionId || 'none'}`);
      console.log(`  Status: ${status || 'unknown'}`);
      if (subStatus) console.log(`  Sub Status: ${subStatus}`);
      
      // Enhanced event detection for CrowdSplit
      const isPaymentEvent = (
        eventType === 'transaction.updated' || 
        eventType === 'transaction.update' || 
        eventType === 'payment_intent.succeeded' || 
        status === 'COMPLETED' ||
        status === 'completed' ||
        subStatus === 'CAPTURED'
      );
      
      console.log(`  Is Payment Event: ${isPaymentEvent ? '✅ YES' : '❌ NO'}`);
      
      if (isPaymentEvent) {
        if (transactionId) {
          console.log(`\n🔍 Payment lookup for transaction: ${transactionId}`);
          
          try {
            // Look for existing payment
            const existingPayment = await prisma.payment.findFirst({
              where: {
                OR: [
                  { externalId: transactionId },
                  { provider: 'CROWDSPLIT' }
                ]
              },
              orderBy: { createdAt: 'desc' },
              take: 1
            });
            
            if (existingPayment) {
              console.log(`  ✅ Found payment: ID ${existingPayment.id}, Status: ${existingPayment.status}`);
              console.log(`  📋 Payment details: External ID: ${existingPayment.externalId}, Amount: ${existingPayment.amount}`);
              
              // Determine new status based on CrowdSplit status
              let newStatus = 'pending';
              if (status === 'COMPLETED' && subStatus === 'CAPTURED') {
                newStatus = 'confirmed';
              } else if (status === 'COMPLETED' || status === 'completed') {
                newStatus = 'confirmed';
              }
              
              console.log(`  🔄 Would update status from '${existingPayment.status}' to '${newStatus}'`);
              console.log(`  🧪 [DEBUG MODE] Payment update simulation completed`);
              
            } else {
              console.log(`  ❌ No payment found for transaction: ${transactionId}`);
              
              // Check recent payments for context
              const recentPayments = await prisma.payment.findMany({
                where: { provider: 'CROWDSPLIT' },
                select: { id: true, externalId: true, status: true, createdAt: true },
                take: 5,
                orderBy: { createdAt: 'desc' }
              });
              
              console.log(`  📊 Recent CROWDSPLIT payments (${recentPayments.length}):`);
              recentPayments.forEach(p => {
                console.log(`    - ID: ${p.id}, External: ${p.externalId}, Status: ${p.status}, Created: ${p.createdAt.toISOString()}`);
              });
            }
          } catch (dbError) {
            console.log(`  ❌ Database lookup error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
          }
        } else {
          console.log(`  ⚠️  No transaction ID found in webhook payload`);
        }
      } else {
        console.log(`  ℹ️  Event type not related to payment confirmation`);
      }
    } else {
      console.log(`  ⚠️  Invalid or missing webhook payload`);
    }
    
    console.log('\n✅ Debug webhook processing completed');
    console.log('===============================================\n');
    
    return NextResponse.json({
      success: true,
      debug: {
        message: 'Debug webhook received and processed successfully',
        requestId,
        timestamp,
        receivedData: {
          headersCount: Object.keys(headers).length,
          bodySize: bodyText.length,
          hasSignatureHeaders: foundSignatureHeaders.length > 0,
          signatureHeadersFound: foundSignatureHeaders,
          hasPayloadSecret: !!body?.secret,
          contentType: request.headers.get('content-type'),
          eventType: body?.data?.type || body?.event || body?.type || 'unknown'
        },
        authentication: {
          method: authenticationMethod,
          valid: isSignatureValid,
          details: authenticationDetails,
          webhook_secret_configured: !!CROWDSPLIT_WEBHOOK_SECRET,
          payload_secret_present: !!payloadSecret,
          payload_secret_matches: !!(CROWDSPLIT_WEBHOOK_SECRET && payloadSecret && CROWDSPLIT_WEBHOOK_SECRET === payloadSecret)
        },
        simulation: {
          payment_processing: !!(body?.data?.type === 'transaction.updated' || body?.event === 'transaction.updated' || body?.data?.status === 'COMPLETED'),
          would_trigger_db_update: !!(
            (body?.data?.status === 'COMPLETED' || body?.status === 'completed') && 
            (body?.data?.id || body?.transaction_id)
          )
        }
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error(`❌ [DEBUG WEBHOOK ERROR] ${timestamp}:`, error);
    console.log('===============================================\n');
    
    return NextResponse.json({
      success: false,
      error: 'Debug webhook processing failed',
      requestId,
      timestamp,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle other HTTP methods for debugging
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`\n🔍 [DEBUG WEBHOOK GET] ${timestamp}`);
  console.log(`📍 URL: ${request.url}`);
  
  return NextResponse.json({
    success: true,
    message: 'Debug webhook endpoint is active',
    timestamp,
    endpoint: '/api/debug/webhooks',
    methods: ['GET', 'POST'],
    configuration: {
      webhook_secret_configured: !!CROWDSPLIT_WEBHOOK_SECRET,
      signature_validation: 'Stripe-style webhook validation',
      supported_events: [
        'transaction.update',
        'transaction.updated',
        'payment_intent.succeeded',
        'payment_intent.payment_failed'
      ]
    },
    note: 'This endpoint validates webhook signatures and simulates payment processing for debugging purposes'
  });
}

export async function PUT(request: NextRequest) {
  return POST(request);
}

export async function PATCH(request: NextRequest) {
  return POST(request);
}

export async function DELETE(request: NextRequest) {
  return POST(request);
} 