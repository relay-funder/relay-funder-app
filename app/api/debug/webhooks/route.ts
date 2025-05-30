import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { CROWDSPLIT_WEBHOOK_SECRET } from '@/lib/constant';
import { prisma } from '@/lib/prisma';

// Define webhook body types
interface WebhookBody {
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
  data?: {
    object?: Record<string, unknown>;
  };
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
    
    // Log all headers
    console.log('\n📋 Headers:');
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
      // Don't log full signature for security, but show it exists
      if (key.toLowerCase().includes('signature')) {
        console.log(`  ${key}: ${value.substring(0, 20)}... (truncated for security)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
    
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
    
    // Webhook Signature Validation (Stripe-style)
    console.log('\n🔐 Webhook Signature Validation:');
    console.log(`  Has CROWDSPLIT_WEBHOOK_SECRET: ${!!CROWDSPLIT_WEBHOOK_SECRET}`);
    
    const signatureHeader = request.headers.get('x-crowdsplit-signature') || 
                           request.headers.get('stripe-signature') ||
                           request.headers.get('x-signature');
    
    console.log(`  Signature header found: ${!!signatureHeader}`);
    if (signatureHeader) {
      console.log(`  Signature header name: ${['x-crowdsplit-signature', 'stripe-signature', 'x-signature'].find(h => request.headers.get(h))}`);
    }
    
    let isSignatureValid = false;
    let signatureValidationDetails = '';
    
    if (CROWDSPLIT_WEBHOOK_SECRET && signatureHeader && bodyText) {
      try {
        // Stripe-style signature validation
        // Format: t=timestamp,v1=signature
        const elements = signatureHeader.split(',');
        let timestampElement = '';
        let signatureElement = '';
        
        elements.forEach(element => {
          const [key, value] = element.split('=');
          if (key === 't') {
            timestampElement = value;
          } else if (key === 'v1') {
            signatureElement = value;
          }
        });
        
        if (timestampElement && signatureElement) {
          // Create expected signature
          const payload = timestampElement + '.' + bodyText;
          const expectedSignature = crypto
            .createHmac('sha256', CROWDSPLIT_WEBHOOK_SECRET)
            .update(payload, 'utf8')
            .digest('hex');
          
          isSignatureValid = expectedSignature === signatureElement;
          signatureValidationDetails = `Expected: ${expectedSignature.substring(0, 20)}..., Received: ${signatureElement.substring(0, 20)}...`;
          
          console.log(`  Timestamp: ${timestampElement}`);
          console.log(`  Signature validation: ${isSignatureValid ? '✅ VALID' : '❌ INVALID'}`);
          console.log(`  ${signatureValidationDetails}`);
          
          // Check timestamp (optional - within 5 minutes)
          const webhookTimestamp = parseInt(timestampElement);
          const currentTimestamp = Math.floor(Date.now() / 1000);
          const timeDiff = Math.abs(currentTimestamp - webhookTimestamp);
          console.log(`  Timestamp difference: ${timeDiff} seconds (${timeDiff > 300 ? 'STALE' : 'FRESH'})`);
          
        } else {
          // Try simple HMAC validation (alternative format)
          const expectedSignature = crypto
            .createHmac('sha256', CROWDSPLIT_WEBHOOK_SECRET)
            .update(bodyText, 'utf8')
            .digest('hex');
          
          isSignatureValid = expectedSignature === signatureHeader;
          signatureValidationDetails = `Simple HMAC - Expected: ${expectedSignature.substring(0, 20)}..., Received: ${signatureHeader.substring(0, 20)}...`;
          
          console.log(`  Simple HMAC validation: ${isSignatureValid ? '✅ VALID' : '❌ INVALID'}`);
          console.log(`  ${signatureValidationDetails}`);
        }
        
      } catch (signatureError) {
        console.log(`  ❌ Signature validation error: ${signatureError}`);
        signatureValidationDetails = `Error: ${signatureError instanceof Error ? signatureError.message : 'Unknown error'}`;
      }
    } else {
      const missing = [];
      if (!CROWDSPLIT_WEBHOOK_SECRET) missing.push('webhook secret');
      if (!signatureHeader) missing.push('signature header');
      if (!bodyText) missing.push('request body');
      
      console.log(`  ⚠️  Skipping validation - Missing: ${missing.join(', ')}`);
      signatureValidationDetails = `Skipped - Missing: ${missing.join(', ')}`;
    }
    
    // Payment Event Processing Logic
    console.log('\n💳 Payment Event Processing:');
    if (body && typeof body === 'object') {
      const { event, transaction_id, status, type, object } = body;
      
      console.log(`  Event Type: ${event || type || 'unknown'}`);
      console.log(`  Transaction ID: ${transaction_id || body.id || 'none'}`);
      console.log(`  Status: ${status || body.status || 'unknown'}`);
      console.log(`  Object Type: ${object || body.object || 'unknown'}`);
      
      // Simulate payment confirmation processing
      if (event === 'transaction.update' || type === 'payment_intent.succeeded' || status === 'completed') {
        const transactionId = transaction_id || body.id;
        
        if (transactionId) {
          console.log(`\n🔍 Simulating payment lookup for: ${transactionId}`);
          
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
              
              // Simulate status update
              const newStatus = status === 'completed' || type === 'payment_intent.succeeded' ? 'confirmed' : 'pending';
              console.log(`  🔄 Would update status from '${existingPayment.status}' to '${newStatus}'`);
              
              // In debug mode, we don't actually update, just log what would happen
              console.log(`  🧪 [DEBUG MODE] Payment update simulation completed`);
              
            } else {
              console.log(`  ❌ No payment found for transaction: ${transactionId}`);
              
              // Check recent payments for context
              const recentPayments = await prisma.payment.findMany({
                where: { provider: 'CROWDSPLIT' },
                select: { id: true, externalId: true, status: true, createdAt: true },
                take: 3,
                orderBy: { createdAt: 'desc' }
              });
              
              console.log(`  📊 Recent CROWDSPLIT payments (${recentPayments.length}):`);
              recentPayments.forEach(p => {
                console.log(`    - ID: ${p.id}, External: ${p.externalId}, Status: ${p.status}`);
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
          hasSignature: !!signatureHeader,
          signatureValid: isSignatureValid,
          contentType: request.headers.get('content-type'),
          eventType: body?.event || body?.type || 'unknown'
        },
        validation: {
          signature: isSignatureValid ? 'VALID' : 'INVALID',
          webhook_secret_configured: !!CROWDSPLIT_WEBHOOK_SECRET,
          signature_header_present: !!signatureHeader
        },
        simulation: {
          payment_processing: body?.event === 'transaction.update' || body?.type === 'payment_intent.succeeded',
          would_trigger_db_update: (body?.status === 'completed' || body?.type === 'payment_intent.succeeded') && !!body?.transaction_id
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