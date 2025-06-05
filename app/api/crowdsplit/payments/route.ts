import { checkAuth } from '@/lib/api/auth';
import { response, handleError } from '@/lib/api/response';
import { crowdsplitService } from '@/lib/crowdsplit/service';
import { CrowdsplitCreatePaymentPostRequest } from '@/lib/crowdsplit/api/types';
import { db } from '@/server/db';
import { ApiNotFoundError, ApiParameterError, ApiUpstreamError } from '@/lib/api/error';

const debug = process.env.NODE_ENV !== 'production';

export async function POST(req: Request) {
  try {
    const session = await checkAuth(['user']);
    
    let paymentData: CrowdsplitCreatePaymentPostRequest;
    try {
      paymentData = await req.json();
    } catch (err) {
      throw new ApiParameterError('Invalid JSON body');
    }

    // Validate required fields
    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new ApiParameterError('Invalid amount: must be a positive number');
    }

    if (!paymentData.paymentMethod) {
      throw new ApiParameterError('Missing payment method');
    }

    if (!['CARD', 'CRYPTO'].includes(paymentData.paymentMethod)) {
      throw new ApiParameterError('Invalid payment method: must be CARD or CRYPTO');
    }

    if (paymentData.paymentMethod === 'CRYPTO' && !paymentData.currency) {
      throw new ApiParameterError('Currency is required for crypto payments');
    }

    debug && console.log('[PAYMENT] Processing payment request:', {
      paymentMethod: paymentData.paymentMethod,
      amount: paymentData.amount,
      currency: paymentData.currency,
      userAddress: session.user.address
    });

    // Find the user in our database
    const user = await db.user.findUnique({
      where: { address: session.user.address },
    });

    if (!user) {
      throw new ApiNotFoundError('User not found');
    }

    // Create payment via CrowdSplit API
    let crowdsplitPayment;
    try {
      crowdsplitPayment = await crowdsplitService.createPayment(paymentData);
    } catch (error) {
      debug && console.error('[PAYMENT] CrowdSplit API error:', error);
      
      const apiError = error as any;
      
      // If we have the original API response, use its message
      if (apiError.apiResponse?.msg) {
        throw new ApiParameterError(apiError.apiResponse.msg);
      }
      
      // If it's a 422 error, it's likely a validation issue
      if (apiError.statusCode === 422) {
        throw new ApiParameterError(apiError.message || 'Invalid payment request. Please check your payment details and try again.');
      }
      
      // For other errors, bubble up the actual message
      if (apiError.message) {
        throw new ApiUpstreamError(apiError.message);
      }
      
      throw new ApiUpstreamError('Failed to create payment with CrowdSplit');
    }

    if (!crowdsplitPayment?.id) {
      throw new ApiUpstreamError('Invalid response from CrowdSplit API: missing payment ID');
    }
    
    // Extract additional fields from payment data
    const { campaignId, isAnonymous, ...rest } = paymentData as any;
    
    if (!campaignId) {
      debug && console.warn('[PAYMENT] No campaignId provided in payment request - payment tracking may be incomplete');
    }

    // Determine the actual token based on payment method
    // CrowdSplit wraps both Stripe (USD) and Bridge.xyz (crypto)
    const actualToken = paymentData.paymentMethod === 'CARD' ? 'USD' : paymentData.currency;

    debug && console.log('[PAYMENT] Creating payment record:', {
      crowdsplitPaymentId: crowdsplitPayment.id,
      actualToken,
      campaignId: campaignId || 'none',
      isAnonymous: isAnonymous || false
    });

    const paymentRecord = await db.payment.create({
      data: {
        user: { connect: { id: user.id } },
        amount: (paymentData.amount / 100).toString(), // Convert from cents to dollars
        token: actualToken, // USD for cards, USDC/CELO for crypto
        provider: 'CROWDSPLIT', // CrowdSplit wraps both Stripe and Bridge.xyz
        status: 'pending',
        type: 'BUY', // Default type for donations
        externalId: crowdsplitPayment.id, // This is the transaction ID from CrowdSplit
        isAnonymous: isAnonymous || false,
        metadata: {
          crowdsplitPaymentData: paymentData,
          createdVia: 'crowdsplit-api',
          paymentMethod: paymentData.paymentMethod, // CARD or CRYPTO
          underlyingProvider: paymentData.paymentMethod === 'CARD' ? 'stripe' : 'bridge',
          transactionId: crowdsplitPayment.id,
          createdAt: new Date().toISOString(),
        },
        // Connect to campaign if provided
        ...(campaignId && { campaign: { connect: { id: campaignId } } }),
      },
    });

    debug && console.log(`[PAYMENT] ✅ Created payment record ID ${paymentRecord.id} for CrowdSplit transaction ${crowdsplitPayment.id} (${paymentData.paymentMethod} via ${paymentData.paymentMethod === 'CARD' ? 'Stripe' : 'Bridge.xyz'})`);

    return response({ 
      success: true, 
      id: crowdsplitPayment.id,
      paymentRecordId: paymentRecord.id,
      status: 'pending',
      paymentMethod: paymentData.paymentMethod,
      amount: paymentData.amount,
      currency: actualToken
    });
  } catch (error: unknown) {
    debug && console.error('[PAYMENT] ❌ Error creating payment:', error);
    return handleError(error);
  }
}
