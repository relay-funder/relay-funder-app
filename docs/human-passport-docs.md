---
title: "xyz-passport-docs Documentation"
source: "https://docs.passport.xyz/"
scraped: "2026-01-09T20:32:09.245Z"
tokens: 68656
---
# xyz-passport-docs Documentation

> Source: https://docs.passport.xyz/
> Generated: 1/9/2026, 1:32:09 PM

### xyz-passport-docs

#### _building-with-passport_custom-passport.md

> Source: https://docs.passport.xyz/building-with-passport/custom-passport
> Scraped: 1/9/2026, 1:32:03 PM

Custom Passport enables partners to develop a Human Passport dashboard that is customized to the unique needs of their ecosystem. This offering enables several additional features above and beyond what is offered on the standard Passport app, which can enable tailored proof of humanity solutions.

If you’re interested in building with Custom Passport, please reach out to our team:

[Contact the Passport team (opens in a new tab)](https://tally.so/r/3X81KL)

## What’s possible

The custom Passport experience offers lots of customization options related to the look and feel of the experience, the stamp selection and even the scoring weights of stamps. Each of these options are configurable and still come with default values to guide the experience. Learn more about each feature below:

## Custom Passport Requirements

To build a custom dashboard, we need assets, messages, and CTAs that will help to inform your users around the program that is being protected. Also, if you choose to take advantage of the custom scorer or custom Stamps, we will partner with you to identify the proper weights, lists, and repos needed to set up those features on the backend.

### Branded Dashboard

The branded dashboard requires the following assets, messages, and CTAs to set it up:

### Custom Scorer

If you decide that you’d like to remove any Stamps or reweight their credentials to better match your ecosystem’s needs, we will partner with you to come up with an updated set of weights.

You can find the current Passport Stamp and credentialweights in the following link:

[Credential Map and Weights](_building-with-passport_stamps_major-concepts_credential-map-and-weights.md)

Please let us know the following if you’d like to customize the score:

*   Which Stamps and credentials would you like to remove
*   How you would like to reweight each of the individual Stamps

We can then review your request and let you know if it will still provide effective Sybil defense for your program.

### GuestList Stamp

If you would like to create your own Stamp based on a pre-vetted allowlist, please provide us with either the NFT, POAP, or list of addresses that should be provided access to this Stamp.

We will also need you to provide the points that you would like to be awarded with this Stamp.

### DeveloperList Stamp

If you would like to create a Stamp that awards points for developer contribution, we will need you to provide the list of repos that developers will have needed to make commits to, as well as the number of commits you would like to award points for, and the number of points to assign.

For example, you can build a Stamp that awards developers for having made the following level of commitments:

*   1 commit – 1 point
*   5 commits – 2 points (additional, on top of the earlier tier)
*   10 commits – 3 points (same as the above)

### Elevated Rate Limits

Please let us know how many users you expect to participate in this campaign so we can help identify the right rate limit for you!

## The Process

Once you identify that you’d like to take advantage of the Custom Passport offering, we can get started on putting together the above requirements.

As you provide these, we will build out your branded dashboard for you, and will provide you review sessions along the way. We can adjust and optimize your dashboard for you before your campaign goes live.

## Requesting Custom Passport data

If you are just checking scores from your Custom Passport offchain, you can use the [Stamps API v2](_building-with-passport_stamps_passport-api.md) to access your users' data.

If, instead, you're enabling your users to push their Passport onchain and you are using a [custom scorer](_building-with-passport_stamps_custom-passport.md#custom-scorer), you will need to use the [Decoder contract](_building-with-passport_stamps_smart-contracts_contract-reference.md#decoder-contract), and more specifically, the `getScore` (0xdaadd662) method, making sure to pass both your [scorer ID](_building-with-passport_stamps_passport-api_getting-access.md) and the specified wallet address to pull users' custom scores.

[Custom client-side Passport scoring](_building-with-passport_stamps_passport-api-v1_tutorials_client-side-scoring.md)[Introduction](_building-with-passport_stamps_smart-contracts_introduction.md)

#### _building-with-passport_data-services.md

> Source: https://docs.passport.xyz/building-with-passport/data-services
> Scraped: 1/9/2026, 1:32:03 PM

## Passport Data Services

Human Passport’s Data Services provide advanced, ML-driven Sybil detection and wallet analysis, helping partners confidently distinguish genuine users from Sybil attackers.

## Overview

Passport’s Data Services offer batch analysis of wallet addresses, designed specifically for scenarios where you have a predefined list of addresses (such as airdrops, event registrations, or community campaigns). It complements Passport’s real-time verification tools like [Stamps API](_building-with-passport_passport-api.md) and [smart contract-based verification](_building-with-passport_smart-contracts.md).

## Use Cases

Common scenarios where Passport’s Data Services deliver significant value include:

*   **Airdrops and Token Distributions**: Vet wallet addresses before distributing tokens to ensure only legitimate users receive rewards.
*   **Community Campaign Audits**: Identify bot-driven farming in referral campaigns, growth initiatives, or contests.
*   **Sybil Attack Investigations**: Assess and remediate suspected Sybil activities post-event or campaign.

## How It Works

The process is straightforward and collaborative:

### 1\. Submit Your Wallet List

Securely share the wallet addresses you want analyzed.

### 2\. Advanced Analysis

Passport’s data team conducts comprehensive analysis, including:

*   **ML-based Sybil Classification**: Our machine learning models analyze wallet transaction patterns across multiple chains (Ethereum, Arbitrum, Optimism, Base, Polygon, zkSync), assigning a Unique Humanity Score from 0-100.
*   **Sybil Clustering Analysis**: Detect related wallets based on funding patterns, behavior similarities, and transaction clustering.
*   **Low-Activity Wallet Handling**: Special handling and heuristics for wallets with minimal activity, ensuring fair evaluation without compromising security.
*   **Expert Consultation**: Human analysts review findings, validate results, and provide tailored insights and recommendations.

### 3\. Actionable Reports

Receive detailed reports with clear classification, identified Sybil clusters, actionable recommendations, and guidance on implementation.

### 4\. Ongoing Support (Optional)

Continuous monitoring and periodic analyses for long-term campaigns or community management.

## Pricing

*   $0.05 per address analyzed.
*   Bulk discounts available starting at 500,000 addresses.

## Getting Started

Ready to leverage Passport’s Data Services? Fill out our [Data Services partner form (opens in a new tab)](https://tally.so/r/3X81KL). Our team will contact you to discuss your use case, integration details, and next steps.

[→ Contact the Passport Team (opens in a new tab)](https://tally.so/r/3X81KL)

[API reference](_building-with-passport_models_api-reference.md)[How to Contribute](_community_getting-involved.md)

#### _building-with-passport_embed.md

> Source: https://docs.passport.xyz/building-with-passport/embed
> Scraped: 1/9/2026, 1:32:04 PM

## Introduction

Passport Embeds is a premium offering that lets websites integrate Human Passport's [Stamps-based verification](_building-with-passport_stamps.md) directly on their website or app, eliminating the need for users to be redirected elsewhere​. In essence, Passport Embeds provides an on-site component for proof of humanity, ensuring that communities and applications remain Sybil-resistant (protected from fake or duplicate accounts) without adding user friction.

Core Benefits:

*   **Frictionless User Experience:** Users can verify their identity within your app or site (no external redirects), leading to higher conversion and less drop-off​. The verification process is quick and preserves privacy, requiring only a crypto wallet and approved credentials rather than personal data.
*   **Powerful Sybil Protection:** Backed by the Human Passport scoring system, it effectively distinguishes real users from bots. You can gate content or features based on Unique Humanity Scores (for example, only users above a certain score can access an airdrop) to keep out malicious actors​.
*   **Targeted for Web3 Communities:** Ideal for dApps, DAOs, forums, or any platform where one-person-one-account is vital. It enables ecosystems to protect and grow their communities organically by ensuring each participant is unique​.
*   **Key Differentiators:** Passport Embeds is a privacy-preserving alternative to traditional KYC or CAPTCHA. It uses verifiable credentials ("Stamps") to calculate a humanity score, so site owners never receive sensitive personal info – only a score or pass/fail status. Unlike other solutions, Passport Embeds is decentralized and user-first​, meaning users maintain control over their data and can prove their humanity without sacrificing anonymity.

Overall, the Passport Embeds component brings the power of Human Passport's identity verification directly into your application. It's designed for both developers and decision-makers who want to boost security and trust in their platform while keeping the user experience seamless and on-brand.

Want to see Passport Embed in action? Check out our complete sample application:

*   **[Live Demo (opens in a new tab)](https://passport-sample-embed-demo.vercel.app/)** - Try the full implementation
*   **[Source Code (opens in a new tab)](https://github.com/passportxyz/passport-sample-embed-demo)** - Browse the complete codebase
*   **[Tutorial](_building-with-passport_stamps_passport-embed_tutorials_protecting-sensitive-programs-with-passport-embed.md)** - Step-by-step implementation guide

## User flow

The user flow for Passport Embeds is as follows:

1.  The user visits your website or app and encounters a program that's protected by the Passport Embed component.
2.  If the user is not connected to a wallet, the component will prompt them to connect their wallet.
3.  Once connected, the component will fetch the user's Passport score if they have one.
4.  If the user's score is above a specified threshold (20 by default), the component will show a success state and inform you that the user is verified. If not, the component will automatically verify any web3 Stamps that the user qualifies for.
5.  If the user's score is still below the threshold, the component will walk users through pages of different Stamps that they can verify to build up their score. Once they build up a high enough score, they will be notified that the program is unlocked and they can participate.
6.  \[Future optional feature\] Once a user builds up a high enough score, they can mint their Passport onchain to one of Passport's supported networks. Once done, they will be notified that the program is unlocked and they can participate.

## Customizations

The component can be [customized](_building-with-passport_stamps_passport-embed_customization.md) in a number of ways, including:

*   Set the theme to dark or light.
*   Adjust several color, font, and spacing options.
*   Set the component to collapse to a smaller size, and the behavior of surrounding content when it expands.
*   \[Future customization\] Choose which Stamps display, which order those Stamps are displayed, and what each Stamp's weighting is.
*   \[Future customization\] Require users to mint their Passport onchain to one of Passport's supported networks.

## Sample Application

*   **[Live Demo (opens in a new tab)](https://passport-sample-embed-demo.vercel.app/)** - Try the full implementation
*   **[Source Code (opens in a new tab)](https://github.com/passportxyz/passport-sample-embed-demo)** - Browse the complete codebase
*   **[Tutorial](_building-with-passport_stamps_passport-embed_tutorials_protecting-sensitive-programs-with-passport-embed.md)** - Step-by-step implementation guide

[Submission Checklist](_building-with-passport_stamps_create-a-stamp_integrating-a-new-stamp.md)[Getting access](_building-with-passport_embed_getting-access.md)

#### _building-with-passport_embed_component-reference.md

> Source: https://docs.passport.xyz/building-with-passport/embed/component-reference
> Scraped: 1/9/2026, 1:32:00 PM

## Passport Embed -- Component Reference

This section is a technical reference for the PassportScoreWidget React component. It covers all configurable props, their types and meanings, as well as notes on component behavior and usage. Use this as a guide when integrating or troubleshooting the Passport Embed component in your codebase.

You will need to have a valid API key and Scorer ID to use the component. You can get these by following the steps in our [getting access guide](_building-with-passport_embed_getting-access.md).

## Installing the Package

You can install the package using npm or yarn:

or

## Component Import

Make sure you have imported the component from the library:

## Rendering the component

Once imported, you can render the `PassportScoreWidget` component anywhere in your React app where you want the verification UI to appear — for example, in a gated page, modal, or call-to-action section.

Here’s a basic example:

## Props

The PassportScoreWidget accepts the following props:

## Hooks

In addition to the main PassportScoreWidget component, the Passport Embed package provides a set of React hooks for developers who want to work with Unique Humanity Scores programmatically, or build a custom verification UI.

### usePassportScore

Fetches the user's Passport score and verification status for a given wallet address and Scorer ID.

#### Returns

#### Example

Here is an example of how to use the hook without making a request to the Stamps API to confirm the score server-side (not recommended for protecting sensitive programs):

Please refer to our [tutorial](_building-with-passport_stamps_passport-embed_tutorials_protecting-sensitive-programs-with-passport-embed.md) to see an example of how to use this hook with a request to the Stamps API to confirm the score server-side (recommended for protecting sensitive programs).

## Usage Example

Suppose we want to embed the component in a page and allow it to handle wallet connection. We also want it to appear as a small badge that the user can expand. We might use the following props:

To review a more in-depth example, see our [tutorial](_building-with-passport_stamps_passport-embed_tutorials_protecting-sensitive-programs-with-passport-embed.md) or check out our complete [sample application (opens in a new tab)](https://passport-sample-embed-demo.vercel.app/) with [source code (opens in a new tab)](https://github.com/passportxyz/passport-sample-embed-demo).

## Component Behavior

*   **Initial State:** The component will detect if an `address` is provided. If not, it typically shows a prompt or button to connect a wallet (assuming `connectWalletCallback` is given). If an address is already provided, it will immediately attempt to fetch the Passport score for that address (calling `generateSignatureCallback` internally when needed).
*   **Loading & Error Handling:** While the score is being fetched, the component may show a loading indicator. If an error occurs (e.g., network issues or invalid API key), the component will handle it by showing an error message in the UI (and you might see errors in the console for debugging). You don’t need to manually catch errors from the callbacks – the component will display a user-friendly message (“Failed to load score,” etc.) if something goes wrong.
*   **Display of Score:** Once retrieved, the component will display a user's Stamp-based unique humanity score. A partner's score threshold can be set via the Developer Portal. This threshold will be used to identify if a user is passing or failing the verification.
*   **Verify additional stamps:** If the user’s score is below the score threshold, the component will guide them on next steps, which involves verifying additional stamps via the embed component. After the user verifies additional stamps, the component will automatically update the score via the UI.
*   **Collapsing/Expanding:** With `collapseMode` set to `"shift"` or `"overlay"`, the component will start in a minimized state – often an icon or small bar. When clicked, it expands to show the full details (score, message, etc.). If "off" is used, it’s always expanded. The expanded component could be a panel that either pushes content (shift) or overlays above it. The user can likely collapse it back after viewing. This behavior allows the verification UI to stay out of the way until needed, which is especially useful on content-heavy pages.

[Customization](_building-with-passport_embed_customization.md)[Introduction](_building-with-passport_models_introduction.md)

#### _building-with-passport_embed_customization.md

> Source: https://docs.passport.xyz/building-with-passport/embed/customization
> Scraped: 1/9/2026, 1:32:00 PM

The Passport Embed component is fully themeable, allowing you to match its appearance to your application's design system. You can customize colors, fonts, border radius, padding, transition timing, and z-index positioning.

## Collapse Mode

With Passport Embed, you can control the component’s **collapsible behavior** and how it is displayed relative to your page layout.

There are three options for collapse mode:

*   **`"shift"`** (default): the component is embedded in the flow and expanding it will push/shift surrounding content (useful if placing at top of a page, for example).
*   **`"overlay"`**: the component will overlay on top of content when expanded (using CSS `position:absolute` or similar, on top of the page, with an overlay background perhaps – the `overlayZIndex` theme can be used to adjust stacking).
*   **`"off"`**: collapse functionality is disabled; the component is always fully expanded (use this if you want the full component visible at all times in a particular spot).

You can experiment with these modes to see which best fits your UI.

## Using Built-in Themes

Passport Embed provides two built-in themes: `DarkTheme` and `LightTheme`. You can import them from the package and pass them directly to the component’s theme prop. By default, the component will use `DarkTheme`.

If your app supports dynamic theming, you can toggle between these based on the user's preference:

These built-in themes provide a solid foundation and follow best practices for accessibility and contrast.

### Extending or Overriding Theme Properties

You can also override specific theme values by spreading one of the defaults and replacing the properties you'd like to change:

### Full Theme Schema

The PassportcomponentTheme object lets you customize the look and feel of the component.

All fields are optional — if a value is not specified, the defaults from the selected base theme (DarkTheme or LightTheme) will be used.

### Tips & Requirements

*   `colors.*` must be defined using RGB format — for example: "255, 255, 0" (Hex codes and named colors are not supported)
*   Font families must reference fonts that are already loaded on the page, except for the component defaults
*   `overlayZIndex` is only applied when `collapseMode` is set to `overlay`
*   Use `transition.speed` to fine-tune component animation timing (e.g. `0.2s`, `0.5s`)
*   All values are optional — anything you omit will fall back to the base theme

### Example

## Next Step

Once your theme is set, head over to the [Component Reference](_building-with-passport_embed_component-reference.md) to see all other available props, or check out our [sample application (opens in a new tab)](https://passport-sample-embed-demo.vercel.app/) to see customization in action.

[Protecting programs with Embed](_building-with-passport_embed_tutorials_protecting-sensitive-programs-with-passport-embed.md)[Component reference](_building-with-passport_embed_component-reference.md)

#### _building-with-passport_embed_getting-access.md

> Source: https://docs.passport.xyz/building-with-passport/embed/getting-access
> Scraped: 1/9/2026, 1:32:00 PM

## Getting Access: Scorer ID and API Key

Once you have your API key, you need to include it in your integration with Passport Embed. This allows Human Passport to identify your app and verify that you are authorized to access the API.

### Getting Your API Key

1.  **Log in to the developer portal:** Go to [developer.passport.xyz (opens in a new tab)](https://developer.passport.xyz/) and log in to your account by connecting your wallet.
2.  **Navigate to the API Keys section:** After logging in, go to the "API Keys" section.
3.  **Generate an API key:** Click on the "+ Create a Key" button to generate a unique API key for your account. Make sure to create one for the embed component and another for the Stamps API requests.
4.  **Store your API key securely:** Store your API key in a secure place.

### Getting your Scorer ID

A Scorer is an developer element that can be used to organize different use cases. You need to create a Scorer and associated Scorer ID to be able to set up Passport Embed and your Stamps API requests.

1.  **Log in to the Developer Portal:** Go to [developer.passport.xyz (opens in a new tab)](https://developer.passport.xyz/) and log in to your account by connecting your wallet.
2.  **Navigate to the Scorer section:** After logging in, go to the "Scorer" section
3.  **Create a Scorer:** Click on the "+ Create a Scorer" button and input a Scorer name, description, and [score threshold](_building-with-passport_stamps_major-concepts_scoring-thresholds.md) (recommended 20). You will _only need one_ for both the embed component and the Stamps API.
4.  **Find your Scorer ID:** Once created, you can find your Scorer ID from the main Scorers page in the Developer Portal.

### Next step

* [Quick start guide to Passport Embed](_building-with-passport_embed_quick-start-guide.md)
* [Review the Component Reference guide](_building-with-passport_embed_component-reference.md)
* [Try our live demo (opens in a new tab)](https://passport-sample-embed-demo.vercel.app/) to see Passport Embed in action

[Introduction](_building-with-passport_embed_introduction.md)[Quick start](_building-with-passport_embed_quick-start-guide.md)

#### _building-with-passport_embed_quick-start-guide.md

> Source: https://docs.passport.xyz/building-with-passport/embed/quick-start-guide
> Scraped: 1/9/2026, 1:32:00 PM

Get up and running with Passport Embed in just a few minutes. This section provides a beginner-friendly setup for both React and non-React environments, covering the essential configuration and a simple integration example.

## Obtain Your Credentials

If you haven't already, please generate an API key and a Scorer ID by following the steps in our [getting access guide](_building-with-passport_embed_getting-access.md).

## Installing and Importing

Here's the simplest way to render the component in a React app.

**Step 1. Install the NPM package:**

Add the Passport Embed React package to your project:

**Step 2. Import the component in your React code and render it where appropriate.**

First we'll provide you a code example, then we'll break down each prop.

This minimal example renders the Passport component.

At a minimum, you should pass your `apiKey`, the `scorerId`, the user's `address` (if already known), and a `generateSignatureCallback` function (described below) that will be called to sign any required messages.

If you don't already have the user's address, you can optionally pass a `connectWalletCallback` function (described below) to prompt the user to connect their wallet via your connection flow.

You can optionally set a `theme` prop to apply a dark or light theme.

A final note that we provide a React hook called `usePassportScore()` that fetches the user's score and tells you whether they've passed the threshold — so you can reactively show or hide content in your app. But — frontend values can be spoofed, so don’t trust it for sensitive program protection. Instead, use `passingScore` as a signal to trigger a backend verification request via the [Stamps API](_building-with-passport_stamps_passport-api.md). The Stamps API will actually confirm the score server-side, meaning you can confidently unlock protected features based on the user's score.

#### Example signature callback for OAuth Stamps

The Passport Stamps product includes several OAuth-based Stamps (e.g. GitHub, Twitter, Discord) that users can verify to build up their score.

These Stamps require a signature to confirm that the user completing the OAuth verification also controls the wallet address they’re associating with the Stamp.

The following function can be included in your code to prompt the user to sign a challenge message with their wallet, proving wallet ownership and allowing the Passport backend to bind the OAuth identity to the correct address. This function should then be passed to the `generateSignatureCallback` prop:

#### Example connect wallet callback

If you don't already have the user's wallet address, you can pass a `connectWalletCallback` function to prompt the user to connect their wallet.

This is only necessary if:

*   You aren't already managing wallet connection elsewhere in your app, and
*   You're not using a wallet abstraction like Reown AppKit, which automatically provides the connected wallet address via a hook (e.g. `account?.address`).

Here's an example of a simple function that could be passed to the `connectWalletCallback` prop:

## Sample Application

Want to see a complete working example? Check out our sample application that demonstrates all the concepts from this guide:

*   **[Live Demo (opens in a new tab)](https://passport-sample-embed-demo.vercel.app/)** - Interactive example you can test with your wallet
*   **[Source Code (opens in a new tab)](https://github.com/passportxyz/passport-sample-embed-demo)** - Complete implementation with detailed README

[Getting access](_building-with-passport_embed_getting-access.md)[Protecting programs with Embed](_building-with-passport_embed_tutorials_protecting-sensitive-programs-with-passport-embed.md)

#### _building-with-passport_embed_tutorials_protecting-sensitive-programs-with-passport-embed.md

> Source: https://docs.passport.xyz/building-with-passport/embed/tutorials/protecting-sensitive-programs-with-passport-embed
> Scraped: 1/9/2026, 1:32:00 PM

This tutorial walks you through building a complete application that uses Passport Embed to protect sensitive content behind a Unique Humanity Score threshold. You'll learn how to implement wallet connection, display the Passport verification component, and conditionally unlock protected content.

## What You'll Build

By the end of this tutorial, you'll have a Next.js application featuring:

*   **Wallet Connection**: Users can connect their Ethereum wallet using Reown AppKit
*   **Passport Embed Component**: Display the user's Unique Humanity Score and verification interface
*   **Protected Content**: Content that's only accessible when the user meets your score threshold
*   **Secure Verification**: Both client-side and server-side score validation for security

## Prerequisites

Before starting, make sure you have:

*   Node.js 18+ installed
*   Basic familiarity with React and Next.js
*   A Passport API key and Scorer ID ([get access here](_building-with-passport_embed_getting-access.md))
*   A Reown Project ID ([create one here (opens in a new tab)](https://cloud.reown.com/))

## Project Setup

Let's start by creating a new Next.js project and installing the required dependencies.

### Step 1: Initialize the Project

We're using Next.js 14 for its excellent TypeScript support and API routes, which we'll need for secure server-side score verification. The configuration ensures compatibility with our wallet connection and Passport integration libraries.

**Key choices explained:**   `--typescript`: Essential for type safety with web3 libraries
*   `--tailwind`: For utility-first styling that matches Passport's design system
*   `--app=false`: Using Pages Router for simpler API routes
*   `--eslint`: Code quality enforcement for production readiness

### Step 2: Install Dependencies

These packages provide the core functionality for wallet connection, Passport integration, and secure state management:

**Package breakdown:**   `@human.tech/passport-embed`: Passport Embed component and hooks
*   `@reown/appkit`: Multi-wallet connection UI and management
*   `@reown/appkit-adapter-wagmi`: Bridge between Reown and Wagmi React hooks
*   `@tanstack/react-query`: Server state management for async blockchain data
*   `wagmi`: React hooks for Ethereum, handles caching and synchronization

### Step 3: Environment Configuration

Environment variables keep your API keys secure and allow different configurations for development vs. production.

Quick reminder that you can create your API keys and Scorer ID in the [Passport Developer Portal (opens in a new tab)](https://developer.passport.xyz/). You should have **two separate API keys**: one for the Embed component (client-side) and another for the Stamps API (server-side). You can use the **same Scorer ID** for both.

You can also generate your Reown project ID in the [Reown Cloud (opens in a new tab)](https://cloud.reown.com/).

Create a `.env.local` file in your project root:

**Environment variables explained:**   **NEXT\_PUBLIC\_PASSPORT\_API\_KEY**: Client-side Embed API key (accessible in browser)
*   **PASSPORT\_API\_KEY**: Server-side Stamps API key (secure, server-only)
*   **NEXT\_PUBLIC\_PASSPORT\_SCORER\_ID**: Your scorer configuration ID (same for both client and server)
*   **NEXT\_PUBLIC\_REOWN\_PROJECT\_ID**: Wallet connection configuration
*   Variables with `NEXT_PUBLIC_` prefix are accessible in the browser
*   Non-prefixed variables like `PASSPORT_API_KEY` remain server-only for security

## Building the Application

Now let's build our application step by step, starting with wallet configuration and moving through each component.

### Step 4: Configure Wallet Connection

Modern web3 applications need to support various wallet providers (MetaMask, WalletConnect, Coinbase Wallet, etc.) while maintaining a consistent user experience. Reown AppKit provides this abstraction layer and automatically handles wallet state management.

Create `config/wallet.ts` to set up Reown AppKit:

**Key concepts explained:**   **WagmiAdapter**: Creates a bridge between Reown AppKit's UI components and Wagmi's React hooks for blockchain interaction
*   **Networks array**: Defines which blockchains your app supports (we're using Ethereum mainnet)
*   **Metadata**: Shows in wallet connection prompts to build user trust
*   **SSR: true**: Enables server-side rendering compatibility

### Step 5: Set Up App Configuration

Web3 applications have unique state management needs. Blockchain data is asynchronous, can change frequently, and needs efficient caching. React Query handles the caching and synchronization, while Wagmi provides the blockchain-specific hooks.

Update `pages/_app.tsx` to configure React Query and Wagmi:

**Critical setup notes:**   **Provider order matters**: `WagmiProvider` must wrap `QueryClientProvider` because Wagmi hooks depend on React Query internally
*   **QueryClient**: Handles caching and synchronization of blockchain state across your entire application
*   **Config import**: Uses the wallet configuration we set up in Step 4

### Step 6: Create the Main Page Component

This is where the magic happens. We're creating a dual-verification system that provides immediate user feedback through client-side hooks while maintaining security through server-side validation. The UI handles multiple states: disconnected, connecting, verifying, and different score levels.

Replace `pages/index.tsx` with our main application:

### Step 7: Create Server-Side Verification API

While the Passport Embed component provides immediate client-side feedback, you should never trust client-side data for protecting sensitive resources. This API route provides secure server-side verification using the [Stamps API (opens in a new tab)](_building-with-passport_stamps_passport-api_api-reference.md) to ensure scores can't be tampered with.

Create `pages/api/verify-score.ts` for secure score validation:

### Step 8: Add Styling

This step creates a cohesive design system that works well with the Passport Embed component and provides a professional dark theme that matches modern web3 applications. The styling includes specific optimizations for the Passport component and Reown AppKit components.

Create `styles/globals.css`:

**Key styling features:**   **Dark theme**: Professional gray-900 background matching web3 conventions
*   **Inter font**: Clean, readable font that works well for wallet addresses and technical content
*   **Component integration**: Specific overrides ensure the Passport Embed component fits seamlessly
*   **Component consistency**: Unified styling between Reown AppKit and custom components

For advanced customization, see the [Passport Embed Customization Guide](_building-with-passport_embed_customization.md).

## Testing Your Application

Now you can test your application:

Visit `http://localhost:3000` and you should see:

1.  **Header** with wallet connection button
2.  **Main title** explaining the verification process
3.  **Passport Embed component** (after wallet connection)
4.  **Access panel** showing lock/unlock status based on score

## Key Concepts Explained

### Hybrid Verification Approach

This tutorial demonstrates a security-first approach with smart monitoring:

*   **Client-side hook** (`usePassportScore`) provides immediate UI feedback and monitors score changes
*   **Smart triggering** - Server-side verification only occurs when client-side shows a passing score
*   **Server-side API** (`/api/verify-score`) validates scores securely via the Stamps API v2
*   **Conditional rendering** shows different states based on verified scores
*   **Guard conditions** prevent redundant API calls with `!verifiedScore` check

### Score Monitoring Pattern

The implementation uses an intelligent monitoring approach:

This pattern ensures:

*   **Efficient API usage** - No unnecessary server calls
*   **Real-time updates** - Responds immediately when users reach threshold
*   **Security validation** - Server confirms client-side results

### Wallet Integration

The Reown AppKit integration provides:

*   **Multiple wallet support** (MetaMask, WalletConnect, etc.)
*   **ENS name resolution** for better UX
*   **Ethereum address management** with automatic updates

### Score Threshold Logic

The application checks for a minimum score of 20:

*   Scores below 20 show locked state with encouragement to verify more Stamps
*   Scores 20+ unlock exclusive content (Telegram access in this example)
*   Real-time updates as users complete additional verifications

## Next Steps

Congratulations! You've built a complete Passport Embed integration. To extend this further, consider:

*   Adding more sophisticated protected content
*   Creating custom themes to match your brand using the [Customization Guide](_building-with-passport_embed_customization.md)
*   Integrating with your existing authentication system
*   Implementing SIWE (Sign-In with Ethereum) for additional security

[Quick start](_building-with-passport_embed_quick-start-guide.md)[Customization](_building-with-passport_embed_customization.md)

#### _building-with-passport_getting-access.md

> Source: https://docs.passport.xyz/building-with-passport/getting-access
> Scraped: 1/9/2026, 1:32:05 PM

## Getting Access: Scorer ID and API Key

The Stamps API provides programmatic access to a wallet's Passport score. Once you have your API key, you need to include it with each request you make to the API. This allows Human Passport to identify your app and verify that you are authorized to access the API.

### Getting Your API Key

1.  **Log in to the developer portal:** Go to [developer.passport.xyz (opens in a new tab)](https://developer.passport.xyz/) and log in to your account by connecting your wallet.
2.  **Navigate to the API Keys section:** After logging in, go to the "API Keys" section.
3.  **Generate an API key:** Click on the "+ Create a Key" button to generate a unique API key for your account.
4.  **Store your API key securely:** Store your API key in a secure place, as it will be used to access the Stamps API.

### Getting your Scorer ID

A Scorer is an developer element that can be used to organize different use cases. You need to create a Scorer and associated Scorer ID to be able to request user data via the Stamps API. If you are using the Stamps API in multiple use cases, you should set up separate Scorers for each one.

1.  **Log in to the Developer Portal:** Go to [developer.passport.xyz (opens in a new tab)](https://developer.passport.xyz/) and log in to your account by connecting your wallet.
2.  **Navigate to the Scorer section:** After logging in, go to the "Scorer" section
3.  **Create a Scorer:** Click on the "+ Create a Scorer" button and input a Scorer name, description, and [score threshold](_building-with-passport_stamps_major-concepts_scoring-thresholds.md) (recommended 20). You only need to add a score threshold if you plan to use the Passport Embed product, or plan to use the `passing_score` field in the Stamps API response.
4.  **Find your Scorer ID:** Once created, you can find your Scorer ID from the main Scorers page in the Developer Portal.

### Next step

* [Make your first API request](_building-with-passport_stamps_passport-api_quick-start-guide.md)
* [Review the API Reference to learn more about the available endpoints](_building-with-passport_stamps_passport-api_api-reference.md)

[Introduction](_building-with-passport_stamps_passport-api_introduction.md)[Quick start](_building-with-passport_stamps_passport-api_quick-start-guide.md)

#### _building-with-passport_major-concepts_api-pagination.md

> Source: https://docs.passport.xyz/building-with-passport/major-concepts/api-pagination
> Scraped: 1/9/2026, 1:32:05 PM

Some requests are likely to return a large amount of data. You can paginate it by adding `?limit=<x>`, where `x` is the number of elements of the dataset you wish to return in each response, to the end of the request. This instructs the server to only send x "pages" of the response.

For the Stamps endpoint, `x` refers to the number of Stamp objects to return in each response. The full request to the Stamp endpoint, including the pagination instruction and headers, could look as follows:

In this example, the API will return three Stamps in each response.

To help you navigate, the returned data includes values in the `prev` and `next` fields. These are endpoint URLs with pre-filled query parameters you can use to retrieve the previous or next chunk of data. Note that if you request a `limit` of 3, your `next` value is also going to have a `limit` of 3. For example, if the response contains Stamps 4, 5 and 6, the URL in `prev` will return Stamps 1, 2, and 3. The URL in `next` will return Stamps 7, 8, and 9.

This is what a response looks like with the `next` and `prev` fields. Notice these fields values are endpoint URLs.

To retrieve the next page of results you can use the URL provided in the `next` field, in this case:

[Stamp and score expiry](_building-with-passport_stamps_major-concepts_expirations.md)[Educating users](_building-with-passport_stamps_major-concepts_educating-users.md)

#### _building-with-passport_major-concepts_credential-map-and-weights.md

> Source: https://docs.passport.xyz/building-with-passport/major-concepts/credential-map-and-weights
> Scraped: 1/9/2026, 1:32:07 PM

The Stamp-based realtime verification product uses a set of Stamps and underlying weighted credentials to determine the Unique Humanity Score of a user.

## Stamps and credentials

Each Stamp partner or concept has their own Stamp that users can see and interact with see in their Passport. Each Stamp can have one or multiple underlying weighted credentials, which represent an identity verification activity within the Stamp partner's ecosystem.

The weights assigned to each credential represent how strong of a human signal the underlying verification activity represents. The higher the point allocation to a credential, the better the human signal.

## Customizations

If you'd like to customize these credentials, you can do so with [Custom Passport](_building-with-passport_stamps_custom-passport.md)

Custom Passport enables you to customize the Passport Stamp lineup around your ecosystem's unique needs. You can make the following adjustments:

*   Remove Stamps that don't fit your needs
*   Adjust the weights of existing Stamps
*   Create your own allowlist-based or GitHub activity-based Stamps

If you're interested in learning more about how to customize the Passport Stamp lineup, please reach out to us via this [form (opens in a new tab)](https://tally.so/r/3X81KL).

## Credential Map and Weights

The following table will help you understand how to map the different available credentials to their corresponding Stamps and weights. It is sorted based on the Stamp, orderred highest points to least.

_These weights were last updated November 2025 -- See [Stamp Changelog](_building-with-passport_stamps_major-concepts_credential-map-and-weights.md#stamp-changelog) for more details_

## Stamp Changelog

January 2025 launch

We launched several additions, subtractions, and updates to the Passport Stamp lineup that will help enable users who are new to web3, users from more global regions, and low-income users to more easily verify their identity and participate in the Passport-protected programs.

[Scoring thresholds](_building-with-passport_stamps_major-concepts_scoring-thresholds.md)[Deduplicating Stamps](_building-with-passport_stamps_major-concepts_deduplicating-stamps.md)

#### _building-with-passport_major-concepts_data-dictionary.md

> Source: https://docs.passport.xyz/building-with-passport/major-concepts/data-dictionary
> Scraped: 1/9/2026, 1:32:06 PM

`address`String (hexadecimal address)The `string` of 20 bytes that uniquely identify an Ethereum accountIdentifies a specific account to which the payload's data relates.`score`IntegerThe user's score, as calculated by the Stamps API. If you'd like to use your own [score threshold](_building-with-passport_stamps_major-concepts_scoring-thresholds.md), you can compare this score against that threshold to identify which users should be provided access.`passing_score`BooleanPassing score will return either `true` or `false` as its value, depending on whether the user's score exceeded the `threshold` score of `20`, as recommended by the Passport team. You can also choose your own [score threshold](_building-with-passport_stamps_major-concepts_scoring-thresholds.md) and use the `score` value if you'd prefer.If you'd like to use the Passport recommended score threshold, you can use this value to identify which users should be provided access.`last_score_timestamp`String (ISO 8601 datetime)The date and time of the request.Can be used to identify when the snapshot of this data occured.`expiration_timestamp`String (ISO 8601 datetime)The date and time that the next Stamp will expire, which will subsequently reduce the `score`. To see when each specific Stamp expires, please use the [GET /v2/stamps{address}](_building-with-passport_stamps_passport-api_api-reference.md#retrieve-stamps-verified-by-a-single-address) endpoint.You might want to display this score expiration to the user to remind them to return to the Passport app to refresh their score before it expires`threshold`IntegerThe Passport recommended score threshold that the user's score must exceed to be considered passing. The current recommended threshold is `20`. You can also choose your own [score threshold](_building-with-passport_stamps_major-concepts_scoring-thresholds.md) and use the `score` value if you'd prefer.If you'd like to use the Passport recommended score threshold, you can use this value to identify which users should be provided access.`error`StringDescribes any error returned by the server. Refer to the API [status and error codes page](_building-with-passport_stamps_passport-api_status-and-error-codes.md) for more information.Can be used to understand why a request failed.`stamps`ObjectContains simplified credential objects for each [credential](_building-with-passport_stamps_major-concepts_credential-map-and-weights.md) that has been validated by the specified user. This object was introduced on December 29th, 2023, and is not available via the historical score endpoint before this point.The included credential objects within this object are the credentials that the user has verified.`stamps.<credential_name>.score`IntegerFor each credential, you can see the score, that this verified [credential](_building-with-passport_stamps_major-concepts_credential-map-and-weights.md) contributes to your overall unique humanity score, or `score`, above.

If this specific credential is deduped, this score will be zero (0).

Can be used to understand how the overall unique humanity score was calculated.`stamps.<credential_name>.dedup`BooleanIf a specific credential has been [deduplicated](_building-with-passport_stamps_major-concepts_deduplicating-stamps.md) (in other words, if this same credential has been verified by another address), this boolean will come back as `true`.

IF `true`, the credential's score will be zero (0) and the credential will not contribute to the overall score.

This information can be used both to identify why a user's score is lower than expected and to publicly communicate these reasons to the user.`stamps.<credential_name>.expiration_date`String (ISO 8601 datetime)Notes when this specific credential will expire.

If this specific credential is deduped, this expiration date will represent when the credential verified by the other address will expire, rather than when this credential will expire.

This information can be displayed to users to help them understand when their credential will expire.

#### _building-with-passport_major-concepts_status-and-error-codes.md

> Source: https://docs.passport.xyz/building-with-passport/major-concepts/status-and-error-codes
> Scraped: 1/9/2026, 1:32:05 PM

Building with Passport

Stamps

Stamps API v2

Status and error codes

## HTTP Status codes

| Code | Title | Description |
| --- | --- | --- |
| 200 | OK | The request was successful. |
| 400 | Bad request | Bad request |
| 401 | Unauthorized | Your API key is invalid. |
| 404 | Not found | The resource does not exist. |
| 429 | Too Many Requests | The rate limit was exceeded. |
| 500 | Internal Server Error | An error occurred with our API. |

## Error types

All errors are returned in the form of JSON with a detail explaining the error

> Example error response.

| Error Detail | Description |
| --- | --- |
| Invalid nonce | The `nonce` used in the submit Stamps API request could not be verified |
| Address does not match signature | The signer could not be verified |
| Invalid limit | The page limit of the Stamps API request is greater than 1000 |
| Unable to get score for provided Scorer ID | Unable to validate that the Scorer ID belongs to the account holding the API key |
| Unauthorized | `X-API-Key` was not specified in the header or an invalid API key was provided |
| Internal Server Error | Something went wrong on our end |

* * *

If you have questions about the API, please reach out to us in our [developer support channel (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh).

More detailed information about this API's endpoints can be found in the [API reference](_building-with-passport_stamps_api-reference.md).

[Data dictionary](_building-with-passport_stamps_passport-api_data-dictionary.md)[Migrate: v1 to v2](_building-with-passport_stamps_passport-api_migrate.md)

#### _building-with-passport_models.md

> Source: https://docs.passport.xyz/building-with-passport/models
> Scraped: 1/9/2026, 1:32:04 PM

The Models API enables partners to protect programs against Sybils in real-time, regardless of whether they have a Passport account or not.

This API is designed to return the results of model-based detection methods. It can score any EVM addresses against several different models that analyze transaction history against dozens of different data features to identify if that address is likely Human or Sybil.

Ready to get started?

The current [available models](_building-with-passport_models_available-models.md) include the following:

*   Aggregate unique humanity model
*   Ethereum (L1) unique humanity model
*   NFT (L1) unique humanity model
*   Arbitrum unique humanity model
*   Base unique humanity model
*   Optimism unique humanity model
*   Polygon unique humanity model
*   zkSync unique humanity model

This essentially opens up Sybil detection and defense to all EVM wallet addresses, regardless of whether the user has a Passport with verified Stamps or not.

This new API is the perfect compliment to the existing [Stamps API](_building-with-passport_stamps_passport-api.md) as it offers the following benefits:

*   **Score any address:** Any EVM wallet address can be scored, regardless of whether they have a Passport or not.
*   **Reduced user friction:** Users don't need to do anything to be scored by this endpoint.
*   **More difficult for Sybils:** When we make adjustments to our Stamp offering and weights, we are essentially providing a roadmap for Sybils, requiring us to make changes periodically which can add friction for users. The model features are hidden from the public, making it more difficult for Sybils to cheat.
*   **Modular verification:** Using the Models API along with the [Stamp-based verification](_building-with-passport_stamps_passport-api.md) approach made available via the Stamps API can enable you to provide multiple verification options that reduce user friction for the majority of users while offering an additional verification tool for users who don't pass the initial check.
*   **Faster and less impactful iteration cycles:** Sybil behavior changes, and so should Passport. While we know updates to our [Stamp-based verification](_building-with-passport_stamps_passport-api.md) are both required and help improve ease and effectiveness, those changes can cause user friction. The model-based verification enables us to tune our the models more frequently without this friction, allowing us to respond to changes in Sybil behavior more quickly.

## Getting Access

This API is generally available to all developers today, but you will need to utilize an API key that is required to access the Stamp-based Stamps API.

Please visit our [getting access page](_building-with-passport_models_getting-access.md) to learn how to generate an API key.

During the initial beta phase, rate limits will be limited. You can read more in our [API Reference](_building-with-passport_models_api-reference.md).

## Use cases

This new API is designed to complement the existing suite of endpoints to offer a comprehensive approach to protecting and understanding your community's constituents.

Starting with the Models API, you can quickly determine if a wallet is a suspected human or Sybil actor. If they are a suspected Sybil (or if we don't have enough data to score them), you can have them utilize our [Stamp-based verification](_building-with-passport_stamps_passport-api.md) to prove their humanness.

When thinking about applying this new API, there are two primary use cases that it enables:

1.  **[Protecting access](_overview_use-cases.md#protect-access-rewards):** Preventing Sybils and other malicious bots from being able to participate in a variety of different web3 programs.
2.  **Data analysis:** Analyzing a set of wallet addresses against the Passport Model Based Detection score to identify which wallets are likely Humans or Sybils. You can also get in contact with us to have our team perform more in-depth data analysis around a list of wallet addresses by filling out [this form (opens in a new tab)](https://tally.so/r/3X81KL).

## Recommended developer flow: Protect access

Protecting access is Passport's primary [use case](_overview_use-cases.md). There are many different types of programs that can be protected with Passport, including rewards, governance, community access, marketplace, and communication programs.

In this section, we will describe a few different developer flows that can be used to protect access to programs:

*   Single verification using a Model Based Detection score
*   Double verification using a Model Based Detection score and the Unique Humanity Score
*   Double verification using a Model Based Detection score and other verification methods

### Single verification using Models API

This is the lightest-weight verification tool available with the current Passport developer tooling.

If you'd like to quickly verify if potential participants are likely human or sybil based on the model-based evaluation, this is for you.

However, this verification method does not provide a secondary verification option for users, such as crypto beginners. If this is a concern, we recommend that you explore using one of the double verification methods.

**Technical integration details:**   Collect the wallet address from the user
*   Pass the wallet address to the [`GET /v2/models/score/{address}`](_building-with-passport_models_api-reference.md) endpoint, which will deliver the specified model score (0-100).
*   Compare this score against a predetermined [score threshold](_building-with-passport_models_available-models.md), and either grant or deny access depending on that evaluation.

### Double verification using Models API and Unique Humanity score

We've developed a tutorial around this offering: [Double Verification with the Model Based Detection and Stamp-based APIs](_building-with-passport_models_tutorials_double-verification.md)

This verification method will cause the least amount of user friction for the majority of users, while also providing a secondary verification check to users (especially crypto beginners) in case they want to contest an initial check's rejection.

Many users will be able pass the initial Models API check with no user friction, while a portion of them will need to go through the Stamp-based process (in other words, creating a Passport, verifying Stamps, and building up a unique humanity score).

**Technical integration details:**   Collect the wallet address from the user
*   Pass the wallet address to the [`GET /v2/models/score/{address}`](_building-with-passport_models_api-reference.md) endpoint, which will deliver the specified model score (-1 for addresses without enough transaction data, 0-100 for those that do).
*   Compare this model score against a predetermined [score threshold](_building-with-passport_stamps_major-concepts_scoring-thresholds.md), and will either grant or deny access based on that evaluation.
*   Assuming the user didn't pass primary verification, retrieve the user's Stamp-based Unique Humanity Score from the Stamps API v2 using the [`GET /v2/stamps/{scorer_id}/score/{address}`](_building-with-passport_stamps_passport-api_api-reference.md#retrieve-latest-score-for-a-single-address) endpoint.
*   Evaluate the Unique Humanity Score against a predetermined [score threshold](_building-with-passport_stamps_major-concepts_scoring-thresholds.md), and will either grant or deny access based on that evaluation.

### Double verification using Models API and other verification methods

This option will look very similar to the previous double verification method, but can utilize a custom Passport scorer and set of Stamps, or a separate 1st or 3rd-party verification system to verify users who weren't able to pass the initial Models API verification flow.

## Next steps

You can retrieve a model-based score with a simple API request. Try it out using our [API playground tool (opens in a new tab)](https://api.passport.xyz/v2/docs).

One of our recomended flows is to use double verification with both the Models API and the Stamps API. We have provided a [walkthrough tutorial](_building-with-passport_models_tutorials_double-verification.md) to show you how it's done.

Review technical details within the [API Reference](_building-with-passport_models_api-reference.md) to understand what all is available via this API.

Review our page that describes all [available models and recommended score thresholds](_building-with-passport_models_available-models.md).

[Component reference](_building-with-passport_embed_component-reference.md)[Getting access](_building-with-passport_models_getting-access.md)

#### _building-with-passport_models_api-reference.md

> Source: https://docs.passport.xyz/building-with-passport/models/api-reference
> Scraped: 1/9/2026, 1:32:03 PM

The Models API enables developers to retrieve different [model-based unique humanity scores](_building-with-passport_models_available-models.md) in real-time, enabling you to score any EVM wallet address without requiring the users to create and build up a Passport score.

Need a batch or more in-depth Sybil classification and clustering analysis? Learn more about our [Data Services](_building-with-passport_data-services.md).

You can also experiment with the Models API using our [API playground tool (opens in a new tab)](https://api.passport.xyz/v2/docs) and adding your API keys via the 'Authorize' button.

## Rate Limits

These rate limits are completely separate from the existing Stamps API rate limits.

If you'd like to request elevated rate limits, please fill out our [rate limit elevation form (opens in a new tab)](https://docs.google.com/forms/d/e/1FAIpQLSe5B7zXTUQUt_aWdqTiUhjAhz56pS49Q8meuzLSgGxYTZRwAw/viewform).

## Retrieve Model scores

Use this endpoint to request a model-based score for a specified user. You can find all of the available models and recommended score thresholds via our [available models](_building-with-passport_models_available-models.md) page.

*   **Endpoint:** `GET /v2/models/score/{address}`
*   **Base URL:** `https://api.passport.xyz`
*   **Authentication:** API Key – Can be the same [API Key](_building-with-passport_stamps_passport-api_getting-access.md) that is used with the Stamps API

### Parameters

### Score Range and Methodology

The Models API returns scores in the range of -1 to 100:

*   **\-1**: Indicates insufficient data available to generate a score
*   **0-100**: Represents the score range where:
    *   Lower scores indicate higher likelihood of being a Sybil account
    *   Higher scores indicate higher likelihood of being a legitimate human account
    *   The exact interpretation of scores depends on the [specific model](_building-with-passport_models_available-models.md) being used

Scores are calculated based on various on-chain and off-chain data points specific to each model. The aggregate model combines multiple model scores to provide a comprehensive assessment.

### Default example

#### Request

#### Response

### Arbitrum model example

#### Request

#### Response

[Available models and score thresholds](_building-with-passport_models_available-models.md)[Data services](_building-with-passport_data-services.md)

#### _building-with-passport_models_available-models.md

> Source: https://docs.passport.xyz/building-with-passport/models/available-models
> Scraped: 1/9/2026, 1:32:03 PM

At this time, we have deployed a few different models to help verify unique humans. We plan to expand this list of models greatly, first by exploring additional Sybil detection models for several L2 partners, and then looking into other web3 verticals and reputation signals.

We currently offer the following models via the Models API:

*   Aggregate unique humanity score - `aggregate`
*   Ethereum (L1) unique humanity model - `ethereum_activity`
*   NFT (L1) unique humanity model - `nft`
*   Arbitrum unique humanity model - `arbitrum`
*   Base unique humanity model - `base`
*   Optimism unique humanity model - `optimism`
*   Polygon unique humanity model - `polygon`
*   zkSync unique humanity model - `zksync`

Each model will assign a score of -1 for addresses without enough transaction data, and 0 - 100 for those that do. A score of 0 represents likely Sybil, while a score of 100 represents likely human.

For each model, we will provide a table that describes the different score thresholds you can use to gate access or classify addresses. We define the columns of those tables here:

*   **% of qualifying verified humans** - This metric represents the number of Passport users who qualified for the score threshold and scored a 20 or higher with the Stamp-based verification system.
*   **% of verified Sybil penetration** - This metric represents the number of verified Sybils from our list that were able to qualify for the score threshold.

## Aggregate unique humanity model

The aggregate unique humanity model score is the current default for the Models API, as it is broadly relevant to a variety of different ecosystems operating within the EVM ecosystem.

This model integrates individual chain model scores (Ethereum, Arbitrum, Optimism, Polygon, and zkSync) to generate the final aggregate score.

Model version: 2.0 Recommended score threshold: 50+

## ETH (L1) unique humanity model

This model looks at the specified wallet addresses' ETH mainnet transaction history, compares it against 50+ different features, and assigns it a score of -1 for addresses without enough transaction data, and 0 - 100 for those that do.

Recommended score threshold: 50+

## NFT (Ethereum L1) unique humanity model

Similarly to the ETH (L1) unique humanity model, this model looks at the specified wallet addresses' NFT transaction history on Ethereum mainnet, compares it against different features, and assigns it a score of -1 for addresses without enough transaction data, and 0 - 100 for those that do.

Recommended score threshold: 50+

## Arbitrum unique humanity model

This model looks at the specified wallet addresses' Arbitrum transaction history, compares it against different features, and assigns it a score of -1 for addresses without enough transaction data, and 0 - 100 for those that do.

Recommended score threshold: 50+

## Base unique humanity model

This model looks at the specified wallet addresses' Base transaction history, compares it against different features, and assigns it a score of -1 for addresses without enough transaction data, and 0 - 100 for those that do.

Recommended score threshold: 50+

## Optimism unique humanity model

This model looks at the specified wallet addresses' Optimism transaction history, compares it against different features, and assigns it a score of -1 for addresses without enough transaction data, and 0 - 100 for those that do.

Recommended score threshold: 50+

## Polygon unique humanity model

This model looks at the specified wallet addresses' Polygon transaction history, compares it against different features, and assigns it a score of -1 for addresses without enough transaction data, and 0 - 100 for those that do.

Recommended score threshold: 50+

## zkSync unique humanity model

This model looks at the specified wallet addresses' zkSync Era transaction history, compares it against different features, and assigns it a score of -1 for addresses without enough transaction data, and 0 - 100 for those that do.

Recommended score threshold: 50+

## Models coming soon

The Passport team currently doesn't have any new models in development.

If you would like to see a new model added, please fill out this form: [Model Based Detection feedback form (opens in a new tab)](https://docs.google.com/forms/d/e/1FAIpQLSeKUu1flQfdNSYKLBhUk6gNwdypUk5STMNsufkOZ58vWI_g9w/viewform)

## Next Steps

Learn how to use these models and score thresholds by working through our [tutorial](_building-with-passport_models_tutorials_double-verification.md), or reviewing our [API reference](_building-with-passport_models_api-reference.md).

[Double Verification with the Model Based Detection and Stamp-based APIs](_building-with-passport_models_tutorials_double-verification.md)[API reference](_building-with-passport_models_api-reference.md)

#### _building-with-passport_models_getting-access.md

> Source: https://docs.passport.xyz/building-with-passport/models/getting-access
> Scraped: 1/9/2026, 1:32:01 PM

The Models API provides programmatic access to variety of different model-based Sybil detection scores.

Once you have your API key, you need to include it with each request you make to the API. This allows Human Passport to identify your app and verify that you are authorized to access the API.

### Getting Your API Key

1.  **Log in to the developer portal:** Go to [developer.passport.xyz (opens in a new tab)](https://developer.passport.xyz/) and log in to your account by connecting your wallet.
2.  **Navigate to the API Keys section:** After logging in, go to the "API Keys" section.
3.  **Generate an API key:** Click on the "+ Create a Key" button to generate a unique API key for your account.
4.  **Store your API key securely:** Store your API key in a secure place, as it will be used to access the Models API as well as the Stamps API.

### Next step

Review one of the following pages to learn how you can use your API key with the Models API.

* [Review the API Reference](_building-with-passport_models_api-reference.md)
* [Review the tutorial explaining how to use this score](_building-with-passport_models_tutorials_double-verification.md)

[Introduction](_building-with-passport_models_introduction.md)[Double Verification with the Model Based Detection and Stamp-based APIs](_building-with-passport_models_tutorials_double-verification.md)

#### _building-with-passport_models_tutorials_double-verification.md

> Source: https://docs.passport.xyz/building-with-passport/models/tutorials/double-verification
> Scraped: 1/9/2026, 1:32:03 PM

This tutorial will walk you through verifying an EVM account with both the ETH Activity model (model-based detection) and the [Stamp-based method](_building-with-passport_stamps_passport-api.md) in your application.

The ETH activity model is one of the [available machine learning models](_building-with-passport_models_available-models.md) trained on known Sybil and human EVM account data that examines the transaction history for a given Ethereum address and assigns it a trust score. While this tutorial explains how to use the ETH activity model score, you can easily use any of the other available models instead.

Passport exposes an API endpoint that accepts an Ethereum account as a query parameter and returns scores in the range of -1 to 100:

*   **\-1**: Indicates insufficient data available to generate a score (e.g., new wallet with no transaction history)
*   **0-100**: Represents the score range where:
    *   Lower scores indicate higher likelihood of being a Sybil account
    *   Higher scores indicate higher likelihood of being a legitimate human account

The model itself is a black box whose outcome is based on 50+ features. Some applications may be happy to rely on these models alone; however, it is advisable to offer the Stamp-based verification method as a fallback to support those users who might not have had the chance to build up a strong account history, such as crypto beginners or experts who utilize multiple wallets for different activities, or in cases where the model returns a -1 score due to insufficient data.

## Prerequisites

Before we delve into this, it's important to note that there are a few preliminary steps you need to complete in order to use the Model Based Detection and Stamps API. Please ensure that these prerequisites are met before proceeding with the guide.

1.  You have created a Passport Scorer and received a Scorer ID (for the Stamps API)
2.  You have an API key (for both)

If you haven't completed the preliminary steps above please refer to our [getting access guide](_building-with-passport_stamps_passport-api_getting-access.md) first. Once you're done with that, return here and continue with this walkthrough.

## The app

This tutorial will guide you through creating a very simple app using nextjs.

The app will present you with three buttons:

*   `Connect`: use this to connect your Ethereum wallet to the app.
*   `Check Ethereum Activity`: clicking this button will check your Ethereum activity score. If it is above a threshold then you will see a notice of success - you may proceed to access the protected content! If you do not meet the threshold you will be denied access and directed to check your Passport unique humanity score (Stamp-based) instead.
*   `Check Passport score`: clicking this button checks your Passport score on the Stamps API. If your score is above a threshold then you will be allowed to proceed to the protected content!

## Getting started

We'll create an app using `Nextjs`. We can bootstrap using `create-next-app`. This automatically creates all the necessary subdirectories, configuration and boilerplate code required to get us building as quickly as possible.

Start by entering the following command into your terminal:

This will create a new directory called `ethereum-activity-app` and populate it with several sub-directories and files that form the skeleton of our app. `create-next-app` will ask for yes/no responses to a series of configuration questions - answer as follows:

## Adding the Etheruem Activity scorer

The ETH activity scorer is accessed via a public API endpoint passing the user's Ethereum address as a query parameter. To start integrating this into your app, you can add the base URL for the API endpoint as a constant at the top of the script, just below the Passport URI definition.

## Run and test the app

You can start this app now by navigating your terminal to the project directory (`passport-app`) and running `npm run dev`. Then, navigate your browser to `localhost:3000`. You will see a basic app load in the browser, with buttons that enable you to connect your wallet and submit your Passport to the registry. You can go ahead and test that the `Connect` and `Submit Passport` buttons are working as expected.

Your app should look like this:

![Passport app ethereum activity](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fpassport-app-ethereum-activity.63281568.png&w=3840&q=75)

[Getting access](_building-with-passport_models_getting-access.md)[Available models and score thresholds](_building-with-passport_models_available-models.md)

#### _building-with-passport_passport-api.md

> Source: https://docs.passport.xyz/building-with-passport/passport-api
> Scraped: 1/9/2026, 1:32:03 PM

Passport Stamps is an aggregate, real-time verification tool that can enable users to prove their unique humanity using a variety of different verification methods, and for developers to access these humanity proofs via the Stamps API or [smart contracts](_building-with-passport_stamps_smart-contracts.md).

Users can prove their humanity using Passport Stamps by visiting the [Passport App (opens in a new tab)](https://app.passport.xyz/) and completing a verification flow, or by using the [Passport Embed](_building-with-passport_stamps_passport-embed.md) widget on a partner website or dApp.

## Why use the API

The Stamps API offers a simple integration; one that requires just one request to receive users' Stamp-based Unique Humanity Score and associated metadata. This data is retrieved from the centralized Human Passport servers, meaning it is the most up-to-date data available for Human Passport users.

All Passport Stamps user data can be accessed via the Stamps API, whereas only a portion of users' have minted their Passport onchain, making it available via our [smart contracts](_building-with-passport_stamps_smart-contracts.md).

### Example flow

An excellent [use case](_overview_use-cases.md) for Human Passport is to protect access to a reward or governance program. To make this happen, follow these steps:

1.  [Creating a Passport Project/Scorer and API key](_building-with-passport_stamps_passport-api_getting-access.md)
2.  Retrieve a user's Passport score and Stamp data using the [GET /v2/stamps/{scorer\_id}/score/{address}](_building-with-passport_stamps_passport-api_api-reference.md#retrieve-latest-score-for-a-single-address) endpoint.
3.  Find the user's Unique Humanity Score or `passing_score` within the returned data.
4.  Compare the Unique Humanity Score against a [threshold](_building-with-passport_stamps_major-concepts_scoring-thresholds.md) that you set, or utilize the binary `passing_score` field that uses our recommended threshold of 20.

If a user was able to build up a score greater than this threshold, they've effectively proven their humanity and you can grant access to the protected program.

## Available endpoints

Stamps API v2 base URL: [https://api.passport.xyz (opens in a new tab)](https://api.passport.xyz/)

Learn more about each of these endpoints on our [API Reference](_building-with-passport_stamps_passport-api_api-reference.md) page, or experiment with them using our [API playground (opens in a new tab)](https://api.passport.xyz/v2/docs) (requires [API key and Scorer/Project](_building-with-passport_stamps_passport-api_getting-access.md)).

## Next steps

* [Set up an API key and Scorer/Project](_building-with-passport_stamps_passport-api_getting-access.md)
* [Make your first API request](_building-with-passport_stamps_passport-api_quick-start-guide.md)
* [Review the API Reference to get to know the available endpoints](_building-with-passport_stamps_passport-api_api-reference.md)
* [Get support via our Telegram channel (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh)

[Educating users](_building-with-passport_stamps_major-concepts_educating-users.md)[Getting access](_building-with-passport_stamps_passport-api_getting-access.md)

#### _building-with-passport_smart-contracts.md

> Source: https://docs.passport.xyz/building-with-passport/smart-contracts
> Scraped: 1/9/2026, 1:32:05 PM

## Onchain Passports

Human Passport's onchain functionality enables users to store their verified Stamps and scores onchain, and makes this data available via smart contracts.

We also discuss the onchain use cases in the following resources:

* [Quick start: Get to "Hello World" with the smart contracts](_building-with-passport_stamps_smart-contracts_quick-start-guide.md)
* [Tutorial: Building an app using onchain Passport data](_building-with-passport_stamps_smart-contracts_integrating-onchain-stamp-data.md)
* [Reference: Learn about the available smart contracts and typical onchain developer flow](_building-with-passport_stamps_smart-contracts_contract-reference.md)

## Why onchain?

In addition to accessing Human Passport data offchain using the Stamps API, Human Passport has also released a smart contract stack that enables developers to access Passport score and Stamp data directly from the blockchain.

This onchain Passport data enables partners that want to maintain a decentralized, permissionless backend to engage directly with our smart contracts instead of storing and processing Passport data pulled from our API.

## Why not onchain?

Minting Passports onchain is an optional feature for users. Not all users will add their Passports onchain. Also, onchain Passports may not reflect the most up-to-date data for users, since the onchain mint is point-in-time and users could verify more Stamps or Stamps could expire (note that onchain attestations expire).

## Onchain Passport

Passport data can be converted into onchain attestations that are stored and engaged with via the [Ethereum Attestation Service (EAS) (opens in a new tab)](https://attest.sh/) or [Verax (opens in a new tab)](https://ver.ax/), which make that data accessible to developers via smart contracts. This enables quadratic funding, rewards, governance, access control, and other programs to exist entirely onchain with their Passport integration.

A simplified onchain Passport data flow follows this process:

1.  A user decides to [mint their Passport onchain (opens in a new tab)](https://support.passport.xyz/passport-knowledge-base/using-passport/onchain-passport) to one of the available networks via the Passport App.
2.  Passport creates a [Stamp (Passport) (opens in a new tab)](https://optimism.easscan.org/schema/view/0xd7b8c4ffa4c9fd1ecb3f6db8201e916a8d7dba11f161c1b0b5ccf44ceb8e2a39) and [score (opens in a new tab)](https://optimism.easscan.org/schema/view/0x6ab5d34260fca0cfcf0e76e96d439cace6aa7c3c019d7c4580ed52c6845e9c89) attestation, and mints them onchain to EAS and other attestation registries, depending on which network they choose.
3.  A developer utilizes our [smart contract stack](_building-with-passport_smart-contracts_contract-reference.md#how-to-query-for-onchain-passport-data) and users' wallet addresses to request the Passport data from these onchain attestation registries.
4.  The developer uses this Passport data in their web3 programs to satisfy their [use case](_overview_use-cases.md).

Of course, there are some additional complexities to this, including [Stamp expirations](_building-with-passport_stamps_smart-contracts_onchain-expirations.md).

## Available networks

This onchain smart contract stack is currently deployed to the following networks:

Mainnet

*   Arbitrum
*   Base
*   Linea
*   Optimism
*   Scroll
*   Shape
*   ZkSync

Testnet

*   Base Goerli
*   Optimism Sepolia
*   Scroll Sepolia
*   Shape Sepolia
*   ZkSync Sepolia

Please note that you can explore our testnet functionality via the app using [Test Mode](_building-with-passport_stamps_smart-contracts_test-mode.md).

## Available registries

Attestations will be minted to one or two different registries, depending on which network the user chose to push their Passport.

*   All onchain Passports will be minted to EAS, regardless of which network the user selects.
*   If the user selects Linea or Linea Goerli, the full attestation will be written to EAS, and a partial attestation will be written to Verax.

## Why isn't Human Passport onchain by default?

Human Passport is entirely opt-in. Users can still use Human Passport without migrating your data onchain.

While onchain Passports are in their infancy, the offchain Passport is useful as a single source. The offchain infrastructure is also perfectly sufficient for many use cases.

## Next steps

Learn more about onchain Passports:

* [Quick start](_building-with-passport_stamps_smart-contracts_quick-start-guide.md)
* [Tutorial](_building-with-passport_stamps_smart-contracts_integrating-onchain-stamp-data.md)
* [Contract reference](_building-with-passport_stamps_smart-contracts_contract-reference.md)
* [Attestation schema](_building-with-passport_stamps_smart-contracts_attestation-schema.md)

You can also ask questions about onchain Passports in our [developer support channel on Telegram (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh)

[Custom Passport](_building-with-passport_stamps_custom-passport.md)[Quick start](_building-with-passport_stamps_smart-contracts_quick-start-guide.md)

#### _building-with-passport_smart-contracts_attestation-schema.md

> Source: https://docs.passport.xyz/building-with-passport/smart-contracts/attestation-schema
> Scraped: 1/9/2026, 1:32:05 PM

Onchain Passports use Attestations to verify that a particular address owns specific Stamps. Ultimately, an Attestation is just a piece of data with a cryptographic signature.

The data follows a known structure, known as a 'schema'. The schema is critical because it ensures the signing participant knows what they are signing, and provides a uniform data layout that enables users to decode the Attestations.

The schema is _the layout of information being attested_. The signature is the proof that a known, trusted verifier has seen the data and attested that it is truthful.

There is currently a single attestation written when users mint their Passports onchain, the Human Passport attestation.

## Human Passport attestation schema

[Human Attestation Schema on EAS (opens in a new tab)](https://optimism.easscan.org/schema/view/0xda0257756063c891659fed52fd36ef7557f7b45d66f59645fd3c3b263b747254)

The raw schema looks as follows:

You can see an example Human Passport attestation on the Optimism network by visiting the following link:

[Example Human Passport attestation on Optimism (opens in a new tab)](https://optimism.easscan.org/attestation/view/0xb6612e9191aaf5741420f4933a509c60f558b6fd2ee769befe3cc07805690a68)

### Fields

The fields in the Human Passport attestation are as follows:

*   `passing_score` (bool): A boolean flag indicating whether the address's score meets or exceeds the threshold value.
*   `score_decimals` (uint8): The number of decimal places used for score precision. Set to `4`
*   `scorer_id` (uint128): A unique identifier for the scoring algorithm instance.
*   `score` (uint32): The raw numerical score calculated for the address.
*   `threshold` (uint32): The minimum score required to achieve a passing grade. Default is set to `200000`, the recommendation from the Passport team. However, this can be updated by partners who have set a custom threshold using Custom Passport.
*   `stamps` (tuple\[\]): An array of tuples containing verified credentials and their weights, where each tuple contains:
    *   A string representing the stamp provider/type (e.g., "CoinbaseDualVerification2", "HolonymGovIdProvider")
    *   A uint256 representing the weight/score contribution to the overall score

Example raw data:

## Accessing User Attestation Data

To access a user's attestation data, please use the decoder contract, which is documented via the [contract reference](_building-with-passport_smart-contracts_contract-reference.md#decoder-contract)

## Deprecated attestations (as of March 12th, 2025)

### Passport (Stamp) attestation schema

The raw schema looks as follows:

Notice that the types for all these fields are numerical types or raw bytes. This is because the human-readable information is compressed and encoded before being added to the attestation.

You can see an example of a Stamp attestation on the Optimism network by visiting the following link:

[Example Passport (Stamp) attestation on Optimism (opens in a new tab)](https://optimism.easscan.org/attestation/view/0xd53526d72b9e9283a70894ddfba32513b722a939d85c1a6be402416d29cdc0b9)

#### Fields

The fields are as follows:

*   `providers`: a u256 that is actually a bitmap where each position maps to a provider name. The mapping is made available offchain.
*   `hashes`: an ordered array of elements, with each element being 32 raw bytes. Each element in the array is a 32-byte hash that maps to a known Stamp. A provider might have multiple Stamps that each have a hash. The mapping is made available offchain.
*   `issuanceDates`: an ordered array of elements, with each element being 32 raw bytes. Each element represents the UNIX timestamp when the Stamp was verified.
*   `expirationDates`: an ordered array of elements, with each element being 32 raw bytes. Each element represents the UNIX timestamp when the Stamp expires.
*   `providerMapVersion`: an unsigned integer specifying which version of the `providers` mapping the Attestation conforms to. This allows updates as providers are added and removed from the canonical set.

### Score attestation schema

The raw schema looks as follows:

You can see an example of a score attestation on the Optimism network by visiting the following link:

[Example score attestation on Optimism (opens in a new tab)](https://optimism.easscan.org/attestation/view/0x1d7832d2f4e5e71da3d8b0ceee72faf4cd44990057b21a26d9f775b911fe1bfe)

#### Fields

The fields are as follows:

*   `score`: the user's Passport score as an unsigned integer
*   `scorer_id`: the ID number for the specific Scorer instance that issued the `score`
*   `score_decimals`: number of decimals in `score`, similar to how ETH is divided into 1e18 Wei.

[Tutorial](_building-with-passport_stamps_smart-contracts_integrating-onchain-stamp-data.md)[Onchain expirations](_building-with-passport_stamps_smart-contracts_onchain-expirations.md)

#### _building-with-passport_smart-contracts_contract-reference.md

> Source: https://docs.passport.xyz/building-with-passport/smart-contracts/contract-reference
> Scraped: 1/9/2026, 1:32:07 PM

The Passport smart contract stack allows developers to pull Stamp data directly from the blockchain rather than having to make requests to a centralized server. The smart contract stack is built on top of the Ethereum Attestation Service (EAS).

This page will outline the Human Passport smart contract stack and provide all the deployment details you need to integrate onchain Stamp data in your app.

This page is broken into two sections:

* [How Passport adds metadata to the blockchain](_building-with-passport_stamps_smart-contracts_contract-reference.md#how-passport-adds-data-to-the-blockchain)
* [How to query for onchain Passport data](_building-with-passport_stamps_smart-contracts_contract-reference.md#how-to-query-for-onchain-passport-data)

You can always chat in our [Telegram developer support channel (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh) if you have questions about the Passport smart contracts.

## How Passport adds data to the blockchain

We will not cover this in depth, as it is already documented in our [GitHub docs (opens in a new tab)](https://github.com/passportxyz/eas-proxy/blob/main/docs/00-onchain-data.md).

Passport uses a combination of private Passport smart contracts and EAS contracts to create Passport attestations and mint them to the blockchain. This process is triggered when a user opts-in to minting their Passport's score and Stamps onchain via the Passport app, and ends with two attestations being minted on EAS that can be accessed by third-party developers.

During this process, the user is charged a $2 mint fee to write the attestations onchain.

## How to query for onchain Passport data

Human Passport, EAS, and Verax have created several smart contracts that can be used to retrieve users' Passport attestations. There are a couple of different flows you can follow, but we strongly recommend using the Decoder contract.

Available flows:

*   **\[Recommended\]** [Decoder contract flow](_building-with-passport_stamps_smart-contracts_contract-reference.md#decoder-contract)
* [GitcoinResolver >> EAS/Verax flow](_building-with-passport_stamps_smart-contracts_contract-reference.md#alternative-flow)

### Decoder contract

The decoder contract is a greatly simplified version of the alternative flow, and delivers all data you would need to integrate with Passport in a human-readable format.

Here is a rundown of the decoder contract flow:

1.  A request is sent to the `Decoder` contract, passing the user address and method associated with the data you'd like to receive.
2.  The smart contract delivers the data associated with the user and method.
3.  Your integration then either gates access to just those users over a specified score threshold, or displays the Passport data to help prove a users reputation.

#### GitHub links

*   Smart contract: [https://github.com/passportxyz/eas-proxy/blob/main/contracts/GitcoinPassportDecoder.sol (opens in a new tab)](https://github.com/passportxyz/eas-proxy/blob/main/contracts/GitcoinPassportDecoder.sol)
*   Interface contract: [https://github.com/passportxyz/eas-proxy/blob/main/contracts/IGitcoinPassportDecoder.sol (opens in a new tab)](https://github.com/passportxyz/eas-proxy/blob/main/contracts/IGitcoinPassportDecoder.sol)
*   ABI: [https://github.com/passportxyz/eas-proxy/blob/main/deployments/abi/GitcoinPassportDecoder.json (opens in a new tab)](https://github.com/passportxyz/eas-proxy/blob/main/deployments/abi/GitcoinPassportDecoder.json)

#### Decoder contract addresses

The decoder is currently deployed to the following networks:

You can learn more about working with testnets via our guide on [Test Mode](_building-with-passport_stamps_smart-contracts_test-mode.md).

#### Available methods

* * *

### Alternative flow -- Deprecated

This alternative flow represents a subset of the tasks that the decoder contract automatically works thorugh, which is why we don't recommend using it. It is, however, useful to understand.

If you decide to go this route, you will follow this flow:

1.  A request is sent to the `Resolver` contract passing the user address
2.  The `Resolver` contract returns a `UID`
3.  The `UID` is passed to the `EAS` contract
4.  The `EAS` contract returns an encoded `Attestation`
5.  Decode the `Attestation` and extracts the Stamp data

#### GitcoinResolver contract

The `GitcoinResolver` contract is used to request a `UID` for an address.

The Attestations are stored in a mapping, where the Attestation is stored as raw bytes (allowing Attestations with any schema to be included).

In order to ensure the integrity of the data that the contract stores, the resolver smart contract shall only validate and store date from trusted sources:

*   a trusted EAS contract
*   a trusted Attester

#### EAS contract

The `EAS` contract is where you can pass the `UID`received from the `GitcoinResolver` contract to receive an `Attestation`.

#### Alternative flow contract addresses

##### Arbitrum

The Arbitrum chain ID is [42161 (opens in a new tab)](https://chainlist.org/chain/42161).

EAS Schema

##### Base

EAS Schema

##### Linea

The Linea chain ID is [59144 (opens in a new tab)](https://chainlist.org/chain/59144).

Verax schema

EAS Schema

##### Optimism

The Optimism chain ID is [10 (opens in a new tab)](https://chainlist.org/chain/10).

Gitcoin

EAS Schema

##### Optimism Sepolia

The Optimism Sepolia chain ID is [11155420 (opens in a new tab)](https://chainlist.org/chain/11155420).

Gitcoin

EAS Schema

##### Scroll

The Scroll chain ID is [534352 (opens in a new tab)](https://chainlist.org/chain/534352).

Gitcoin

EAS Schema

##### Scroll Sepolia

The Scroll chain ID is [534351 (opens in a new tab)](https://chainlist.org/chain/534351).

Gitcoin

EAS Schema

##### Shape

The Shape chain ID is [360 (opens in a new tab)](https://chainlist.org/chain/360).

Gitcoin

EAS Schema

##### Shape Sepolia

The Shape chain ID is [11011 (opens in a new tab)](https://chainlist.org/chain/11011).

Gitcoin

EAS Schema

##### ZkSync Era

The ZkSync chain ID is [324 (opens in a new tab)](https://chainlist.org/chain/324).

EAS Schema

##### ZkSync Sepolia

The ZkSync chain ID is [300 (opens in a new tab)](https://chainlist.org/chain/300).

#### Attestation Schemas

We discuss the Human Passport attestation schema in our [Attestation schema](_building-with-passport_stamps_smart-contracts_attestation-schema.md) guide.

[Onchain testing](_building-with-passport_stamps_smart-contracts_test-mode.md)[Introduction](_building-with-passport_stamps_create-a-stamp_introduction.md)

#### _building-with-passport_stamps_create-a-stamp.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/create-a-stamp
> Scraped: 1/9/2026, 1:32:04 PM

## What is a Stamp?

Stamps are the key identity verification mechanism of Passport. A Stamp is a collection of one or more [verifiable credentials](_building-with-passport_stamps_create-a-stamp_introduction.md#verifiable-credentials-vcs) from an identity provider that is collected in a Passport. Stamps are provided by a variety of web2 and web3 identity authenticators including Google, BrightID, Holonym, Guild.xyz, ENS, and more. Stamps do not store any personally identifiable information, only the verifiable credentials issued by the identity authenticator.

Passport aggregates Stamps and assigns each Stamp a different weight according to the needs of a particular community. This weight is used to calculate the cost of forgery of an identity, a score which reflects the credibility of a potential participant’s online identity.

The Passport team is highly selective about the new Stamps that are added to the platform. To be considered, you can follow the steps outlined in on this page.

## Stamp assessment criteria

When new Stamps are proposed we evaluate them according to some key criteria:

*   **Strong non-Sybil signal**

    Stamps should represent some strong method for identifying Sybils vs non-Sybils so that we can ensure that each Stamp helps to improve the Sybil-defense that Passport offers. We prioritize new signals that are unique or different to the signals we have already have in Passport. It’s ideal if there’s already data, from internal efforts, indicating the effectiveness of the credentials.

*   **Free** (or very cheap)

    We have heard feedback from end users who are frustrated by the costs of some of the existing Stamps. Where possible we'd like to expand the set of free or very cheap options available to our users.

*   **Easy to use**

    Ensuring that a user can quickly get set up and verified is important to the overall Passport and partner platform's success. We’ll prioritize those Stamps and credentials that can be included in the existing ‘1-click’ verification flow.

*   **Strong partnership**

    We pass Sybil data back and forth in an aggregate and anonymized way with our strongest partners to help all parties improve Sybil defense. We expect future partners to participate in this program as well.

*   **Substantial user base**

    The more users you have, the more users we can start offering Sybil defense to. This also helps grow the Passport ecosystem as each new partner helps grow all partners.

## What types of Stamps would we like to see more of?

We are specifically interested in Stamps that are accessible in areas of the world that are currently under-represented, such as Asia, Africa, and Latin America. This is so people in those regions don't find it more difficult to prove themselves to be real users than people from other areas.

Similarly, we are interested to see more Stamps that are accessible to new-comers to Web3, but still match our key criteria.

## Process

If you believe your Stamp meets the criteria described above, then you should submit your Stamp using [this form (opens in a new tab)](https://docs.google.com/forms/d/e/1FAIpQLSffvrP4JJiPnvCvHDz9B7-lpCJFGQVwWoI0nut8w57hmURwMg/viewform).

We review form submissions periodically and will get back to partners who's Stamps we want to integrate as soon as possible.

If we decide to move forward with your Stamp, the next step is to follow the instructions in [this guide (opens in a new tab)](_stamps_integrating-a-new-stamp.md).

[Contract reference](_building-with-passport_stamps_smart-contracts_contract-reference.md)[Developer Integration Guide](_building-with-passport_stamps_create-a-stamp_integration-guide.md)

#### _building-with-passport_stamps_create-a-stamp_examples_oauth-pattern.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/create-a-stamp/examples/oauth-pattern
> Scraped: 1/9/2026, 1:32:00 PM

This example demonstrates a complete OAuth-based Stamp integration for a fictional platform called "DevCommunity" that verifies developer reputation and activity.

## Example Scenario

**Platform:** DevCommunity (fictional developer community)
**Verification:** User has verified email, 100+ reputation points, and account >30 days old
**OAuth Flow:** Standard OAuth 2.0 with access token exchange

* * *

## Complete File Structure

* * *

## Implementation Files

### 1\. Main Exports (`index.ts`)

### 2\. Frontend Platform (`App-Bindings.tsx`)

### 3\. Configuration (`Providers-config.ts`)

### 4\. Provider Exports (`Providers/index.ts`)

### 5\. Verification Logic (`Providers/devCommunity.ts`)

### 6\. Complete Test Suite (`__tests__/devCommunity.test.ts`)

* * *

## Integration Setup

### Environment Variables

Add these to your `.env` files:

### System Integration

Add these updates to integrate with the core system:

**`platforms/src/platforms.ts`***`types/src/index.d.ts`***`app/config/platformMap.ts`**

### OAuth Application Setup

Configure your OAuth application with:

1.  **Redirect URIs:**   Development: `http://localhost:3000/auth/devcommunity/callback`
    *   Staging: `https://staging.passport.xyz/auth/devcommunity/callback`
    *   Production: `https://passport.xyz/auth/devcommunity/callback`
2.  **Required Scopes:**   `read:user` - Access to basic user information
    *   `read:profile` - Access to profile and reputation data
3.  **Application Settings:**   Application Type: Web Application
    *   Grant Types: Authorization Code
    *   Token Endpoint Auth Method: Client Secret Post

* * *

## Testing Your Integration

Run the test suite to verify your implementation:

Expected test output:

* * *

## Customization Guide

To adapt this example for your platform:

### 1\. Replace Platform Names

*   Change `DevCommunity` to your platform name throughout
*   Update API endpoints to your actual URLs
*   Modify environment variable names

### 2\. Customize Validation Logic

Modify the `validateUser()` method to match your requirements:

### 3\. Update OAuth Configuration

*   Modify OAuth scopes for your platform's requirements
*   Update API endpoints for token exchange and user data
*   Adjust request headers as needed for your API

### 4\. Customize UI Content

Update the `banner` content and `guide` sections in `Providers-config.ts` to match your platform's verification process.

This complete example provides a solid foundation for any OAuth-based Stamp integration with Human Passport.

[Testing & Security](_building-with-passport_stamps_create-a-stamp_testing-and-security.md)[On-Chain Verification Example](_building-with-passport_stamps_create-a-stamp_examples_oauth-pattern.md)

#### _building-with-passport_stamps_create-a-stamp_implementation-patterns.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/create-a-stamp/implementation-patterns
> Scraped: 1/9/2026, 1:32:00 PM

This guide covers the four main implementation patterns for Human Passport Stamps, with detailed code examples and best practices.

## Pattern Selection Guide

* * *

## OAuth Integration Pattern

### Frontend Implementation (App-Bindings.tsx)

### Backend Implementation (Providers/yourProvider.ts)

* * *

## Onchain Verification Pattern

### Frontend Implementation (App-Bindings.tsx)

### Backend Implementation (Providers/yourOnChainProvider.ts)

* * *

## Configuration Template

All patterns use the same `Providers-config.ts` structure:

* * *

## Pattern-Specific Considerations

### OAuth Pattern

*   **Security**: Never log access tokens or user data
*   **Rate Limiting**: Implement exponential backoff for API calls
*   **Token Validation**: Always validate token scopes and expiration
*   **Error Handling**: Provide clear error messages for OAuth failures

### Onchain Pattern

*   **RPC Reliability**: Use multiple RPC endpoints for redundancy
*   **Gas Optimization**: Batch multiple contract calls when possible
*   **Network Support**: Consider multi-chain support if applicable
*   **Anti-Sybil**: Implement transaction history checks to prevent fresh wallet attacks

### Custom API Pattern

*   **Authentication**: Use secure authentication methods (API keys, JWT, etc.)
*   **Data Validation**: Validate all external API responses
*   **Caching**: Cache API responses when appropriate to reduce load
*   **Monitoring**: Implement comprehensive error logging and monitoring

### Wallet Signature Pattern

*   **Message Format**: Use standardized message formats for consistency
*   **Signature Validation**: Properly validate signature format and recovery
*   **Replay Protection**: Include nonces or timestamps to prevent replay attacks
*   **User Experience**: Provide clear explanation of what users are signing

[Developer Integration Guide](_building-with-passport_stamps_create-a-stamp_integration-guide.md)[Testing & Security](_building-with-passport_stamps_create-a-stamp_testing-and-security.md)

#### _building-with-passport_stamps_create-a-stamp_integrating-a-new-stamp.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/create-a-stamp/integrating-a-new-stamp
> Scraped: 1/9/2026, 1:32:00 PM

Creating a new Stamp involved defining verification logic and adding configuration details to our existing Stamp infrastructure.

We have a standardized format for Stamps and this page will help you to understand all the information you need to provide. The process begins by creating your own copy of our GitHub repository. The instructions on this page will walk you through how to change the codebase to support your Stamp and submit the changes back to the Passport team.

* * *

### 1\. Fork the Passport GitHub repository

Whether you want to create an EVM or a non-EVM Stamp, the process begins by forking the Passport GitHub repository. Clone your fork and navigating to the `platforms` directory.

Here is our [GitHub repository (opens in a new tab)](https://github.com/passportxyz/passport).

This is the [`platforms` directory (opens in a new tab)](https://github.com/passportxyz/passport/tree/main/platforms), located at `passport/platforms.`

* * *

### 2\. Create new files

Adding a Stamp requires you to create some new files inside the `platforms/src` directory. Inside `platforms/src` create a new directory and name it according to your Stamp. In the test here we will use the word `example.`

For example, the following would be an appropriate command for a bash user:

Inside `example`, create the following subdirectories and files:

Each of the files you just created has a distinct purpose, as described in the following table:

You will also need to update some information in existing files in `platforms/src` but for now we can focus on adding the right information to these newly created files. For the `App-bindings.ts` file specifically, the instructions are slightly different for EVM and non-EVM Stamps.

#### `App-bindings.ts`

Updating `App-bindings.ts` is slightly different depending upon whether you are creating an EVM Stamp or a non-EVM Stamp.

_**What is an EVM Stamp?**_

Some Stamps rely upon the Ethereum Virtual Machine (EVM) while some rely upon OAuth to determine ownership. If your Stamp represents some web3 native credential such as ownership of a digital asset (for example, ETH, some ERC20 token, NFT or POAP) or onchain activity (for example, certain transaction) that can be verified by querying the blockchain, then your Stamp is an EVM Stamp. If your Stamp relies on ownership of some web2 account that your users login to, then it is a non-EVM Stamp.

#### `EVM Stamps`

Copy the following code into the file, replacing `<EXAMPLE>` with your Stamp name. Note that for EVM Stamps the `AppContext` and `ProviderPayload` types are imported from `"../types"` and the`Platform` class is imported from `"../utils/platform".`

The new Stamp is exported as a class extending the `Platform` class.

#### Non-EVM Stamps

Copy the following code into the file, replacing `<EXAMPLE>` with your Stamp name. Note that for non-EVM Stamps the `PlatformOptions` type is imported from `"../types"` and the `Platform` class is imported from `"../utils/platform".`

The new Stamp is exported as a class extending the `Platform` class.

#### `Providers-config.ts`

Copy the following code into `Providers-config.ts` replacing `<EXAMPLE>` with your Stamp name. This file imports the `PlatformSpec` and `PlatformGroupSpec` from `"../types"` and exports the Stamp details and provider config data.

#### `index.ts`

Copy and paste the following code into `index.ts` replacing `<EXAMPLE>` with your Stamp name. This code is used to export the providers, provider config data and app bindings.

* * *

#### `Providers/example.ts`

This is where the hard work is done, because it is in this file that you will define your custom verification logic. The code will vary between applications depending on precisely what information is being verified. The verification could include communication with API servers, blockchain nodes or RPC providers, smart contracts or other external resources. We can walk through an example here, but bear in mind that you will have to adapt to your specific use case.

Let's look at the Ethereum activity Stamp. This is an EVM Stamp that checks whether a user owns a certain threshold amount of ETH or ERC-20 tokens.

There is a lot going on in this file, but we can break it down to make it easier to digest. The first thing to notice is that this contract requires information from the Ethereum blockchain, which requires access to a node or an RPC ([remote procedure call (opens in a new tab)](https://www.ibm.com/docs/en/aix/7.1?topic=concepts-remote-procedure-call)) provider - these enable requests to be made to Ethereum, roughly equivalent to getting access to an API server in the Web2 world. In the code above, the following line instantiates an RPC provider.

This grabs an RPC endpoint from the environment variables. You can set this to your own node's RPC or use a third party RPC service. Either way, this is your code's entry point to the Ethereum network. This step is common to any verification method that relies on Ethereum blockchain data.

#### `__tests__/example.test.ts`

This is where you will add tests for your verification logic. Precisely how the tests are organized is up to you, as the tests will be specific to the individual Stamp. A standard pattern is to mock endpoints that return a range of responses that could be expected from your real external server and design tests to ensure your verification logic handles them all well. You should mock all possible responses to ensure complete test coverage.

As an example, see the tests for the [ETH transaction credential (opens in a new tab)](https://github.com/passportxyz/passport/blob/main/platforms/src/ETH/__tests__/ethTransactions.test.ts).

### 3\. Update existing files

You have now created all the new files you need to create a new Stamp. The remaining steps all focus on pulling the new information you created into the existing Passport infrastructure, so that Passport can recognize and handle your new Stamp.

You will need to navigate up a level, out of your newly created files and into `platforms/src` to find the relevant files to update.

#### `platforms.ts`

First, you will need to import the newly created platforms from the folders you just created, and export the instances from a single central location. `platforms/src/platforms.ts` acts as that central location. This file already contains the relevant code for the existing platforms, so you just need to follow the syntax for adding your own. The code snippet below shows what code you need to add. Just bear in mind that many lines of code referring to existing platforms have been removed from this example for clarity - your real file will have much more code in it!

Remember to replace `EXAMPLE` with your platform name!

#### `app/context/ceramicContext.tsx`

In this file you will import the Stamp from `@gitcoin/passport-platforms` again. Then create and add the Stamp to the platforms map by adding it to the bottom of the existing list of platforms.

The final thing to do in the `app` package is to save a copy of your Stamp's icon, in `.svg` format, to the `app/public/assets` directory.

The rest of the files only need to be updated **if your app has new environment variables** that need to be added to the infrastructure, app or `iam` packages. If, for example, your Stamp can be verified using the Etherscan or Alchemy keys that are already made available through Passport, then you can skip straight past these updates.

The next few files to update live in the `app` package:

#### `.env-example.env`

First, add the new Stamp's client ID, callback URL and any other environment variables that are necessary for your new Stamp to `.env-example.env`. This is an example file that contains dummy variables to avoid exposing sensitive data on the public Github repository. **Please DO NOT add any real values to .env-example.env** or they will be exposed publicly! Add the relevant fields for your new Stamp and then add DUMMY values that are not the same as your real values!

#### `.env`

Now add the **real** values for your Stamp's environment variables to your local `.env` file.

Net we will update some files in the `iam` package. This is where the IAM authority is configured which is responsible for issuing `verifiableCredentials`. These verifiable credentials are issued based on a successful response from the `verify()` function for each Stamp. You defined your verification logic in a `verify()` function in [this earlier step](_building-with-passport_stamps_create-a-stamp_integrating-a-new-stamp.md#providers-example.ts).

All you need to do in the `iam` package is update the environment variables so that the necessary data for your Stamp is available. In the next section we will configure the `infra` package so that these environment variables, and those created earlier, are instantiated and provided as context to a remote server responsible for doing the actual Stamp issuance.

#### `iam/.env-example.env`

Add your **dummy** environment variables to `.env-example.env`.

#### `iam/.env`

Add your **real** environment variables to `.env`.

Now we can leave the `iam` package and update a few files in the `infra` package. This is where we configure the remote server to issue Stamps based on your Stamp details and verification logic.

#### `infra/review/index.ts`

Here you will add secrets objects for each of the environment variables you added to your `.env` files. This allows your secrets to be transmitted securely to the remote server so your Stamp verification logic can be executed without having to expose any keys or other sensitive information on the public repository.

In this file you will find an instance of the `Fargate` service assigned to the variable `service` . In there, you will find an array named `secrets` nested inside several other objects. You need to add a `secrets` object to this array for each of your environment variables.

This step should then be **repeated identically** for the `staging` and `production` versions of this file. To be clear, update `infra/staging/index.ts`and `infra/production/index.ts` in exactly the same way as you just updated `infra/review/index.ts`.

### 4\. Further customization

You may need additional procedures for your Stamp. You can create a procedures folder inside of the Stamp folder to hold any additional verification, auth, etc. you may need. Every Stamp is slightly different and will require different materials in order to function correctly - since the design space is so large, it's up to you to know what you need for your specific purpose!

### 5\. Build and run the services

You will need to have [Node (v16 LTS) (opens in a new tab)](https://nodejs.org/en/download/), [Yarn (opens in a new tab)](https://classic.yarnpkg.com/en/docs/install/) and [Git (opens in a new tab)](https://git-scm.com/downloads) installed in order to follow these steps.

Now you have updated your local copy of the Human Passport repository, you can build and run it. You can do this by navigating to the top level project directory (`passport`) and running:

### 6\. Raise a Pull Request

Finally, having seen your app running successfully, you can raise a pull request against the Human Passport GitHub repository. This will make the changes you have made to support your app part of the canonical public Stamp repository. However, before this happens your changes will be reviewed by the Passport team who may request changes.

When you raise a pull request, it is important to include the following checklist. This helps you to verify that all the necessary steps have been taken to create your Stamp, and also helps the reviewers of the pull request check your work and merge it faster.

You can use the code snippet above as a template - copy and paste it into your pull request and tick the boxes to show that each item has been completed.

The following is an example of a pull request that uses a similar checklist: [Integrate Phi Stamp in Passport (opens in a new tab)](https://github.com/passportxyz/passport/issues/1233#top)

### 7\. Note on context and cache

It is important to understand the difference between context and cache, and for you to use them appropriately when developing your Stamp. They both refer to holding information in memory.

**`Context`** is used to pass the results of expensive operations performed during the verification process for a specific Stamp between calls to `verify` within each provider. This is the expected way for Stamps to handle their data.

_`Context` should be used wherever possible, in preference to using the `cache`._

The `cache` exists to support unusual or complex authentication mechanisms that cannot work within the`context` logic. The **`cache`** is used to store data between multiple HTTP requests, for example if data stored in the `App-bindings` request needs to be referenced in a `/verify` request. This may occur when objects need to be shared across multiple `Providers`. In this case, the caching _**must**_ be done using the caching mechanism defined in `platforms/src/utils/cache.ts`.

If the cache is used, its payload should be moved to `context` and then the cache should be explicitly cleared.

The following example shows the `cache` mechanism being used correctly.

## Need support?

You can ask questions in our [developer support channel on Telegram (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh).

[On-Chain Verification Example](_building-with-passport_stamps_create-a-stamp_integrating-a-new-stamp.md)[Introduction](_building-with-passport_embed_introduction.md)

#### _building-with-passport_stamps_create-a-stamp_integration-guide.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/create-a-stamp/integration-guide
> Scraped: 1/9/2026, 1:32:00 PM

## Developer Integration Guide

## What is a Stamp?

A Human Passport Stamp is a verifiable credential that proves a user has completed identity verification or demonstrated specific onchain/offchain activity. Each Stamp consists of:

*   **Platform**: The service/protocol providing verification (e.g., Discord, GitHub, Binance)
*   **Provider(s)**: Specific verification types within a platform (e.g., "Discord Account", "GitHub >30 commits")
*   **Verification Logic**: Backend code that validates user claims
*   **UI Integration**: Frontend components for user interaction

## Architecture Overview

**Key Components:**   **App-Bindings**: Frontend platform implementation (user flows, OAuth, wallet connection)
*   **Providers**: Backend verification logic (API calls, onchain checks, credential issuance)
*   **Providers-config**: UI metadata, user guidance, display configuration
*   **Integration**: Registration with core system (platforms.ts, types, app config)

## Integration Patterns

Human Passport supports four main integration patterns:

### 1\. OAuth Integration

**Best for:** Social platforms, web services with OAuth APIs
**Examples:** Discord, Google, GitHub, LinkedIn
**Flow:** User clicks → OAuth popup → Authorization → Token exchange → API verification → Credential issued

### 2\. Onchain Verification

**Best for:** Blockchain-based verification, token ownership, onchain activity
**Examples:** Binance BABT, ETH balance, NFT ownership
**Flow:** User connects wallet → Query blockchain/contract → Verify conditions → Credential issued

### 3\. Custom API Integration

**Best for:** Proprietary verification systems, complex workflows
**Examples:** Guild.xyz, custom KYC providers
**Flow:** Custom authentication → API calls to your service → Verification logic → Credential issued

### 4\. Wallet Signature

**Best for:** Proof of address ownership, simple onchain verification
**Examples:** Message signing, proof of control
**Flow:** User connects wallet → Sign message → Verify signature → Credential issued

## File Structure Requirements

Every Stamp integration requires the following directory structure:

### Required Assets

## Core Development Steps

## Environment Configuration

### Required Environment Variables

All Stamp integrations need appropriate environment variables:

### OAuth Setup

For OAuth integrations, configure your application with these redirect URIs:

*   Development: `http://localhost:3000/auth/yourplatform/callback`
*   Staging: `https://staging.passport.xyz/auth/yourplatform/callback`
*   Production: `https://passport.xyz/auth/yourplatform/callback`

## UI Configuration (Post-Reskin)

The July 2024 reskin introduced new required metadata fields in `PlatformDetails`:

### Required Fields

*   `timeToGet`: Estimated completion time (e.g., "5 minutes", "10 minutes")
*   `price`: Cost information (e.g., "Free", "$5 + gas fees")
*   `guide`: Structured user guidance with two types:
    *   `steps`: Sequential instructions with optional action buttons
    *   `list`: Requirements, warnings, or considerations

### Example Configuration

## Support

For technical questions during development:

*   Review the [troubleshooting guide](_building-with-passport_stamps_create-a-stamp_testing-and-security.md#troubleshooting)
*   Check existing implementations in the repository
*   Contact the Human Passport team for complex integration questions

[Introduction](_building-with-passport_stamps_create-a-stamp_introduction.md)[Implementation Patterns](_building-with-passport_stamps_create-a-stamp_implementation-patterns.md)

#### _building-with-passport_stamps_create-a-stamp_testing-and-security.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/create-a-stamp/testing-and-security
> Scraped: 1/9/2026, 1:32:00 PM

This guide covers comprehensive testing requirements and security best practices for Human Passport Stamp development.

* * *

## Testing Requirements

### Test Suite Structure

Every Stamp must include tests in `__tests__/yourProvider.test.ts`:

### Required Test Cases

#### 1\. Success Scenarios

Test all paths that should result in `valid: true`:

#### 2\. Failure Scenarios

Test all validation rules and edge cases:

#### 3\. Error Handling

Test external API failures and network issues:

#### 4\. Edge Cases

Test boundary conditions and unusual scenarios:

### Running Tests

Test your implementation with these commands:

* * *

## Security Best Practices

### 1\. Data Protection

#### Never Log Sensitive Information

#### Validate All External Data

#### Secure Record Storage

### 2\. API Security

#### Implement Rate Limiting Protection

#### Secure Error Messages

### 3\. OAuth Security

#### Validate OAuth Scopes

#### Secure Token Storage

### 4\. On-Chain Security

#### Multiple RPC Endpoints

#### Contract Call Validation

### 5\. Anti-Sybil Measures

Implement multiple checks to prevent Sybil attacks:

* * *

## Troubleshooting

### Common Issues

#### OAuth Flow Problems

**Issue:** `redirect_uri_mismatch`

*   **Cause:** OAuth redirect URI doesn't match registered URI exactly
*   **Solution:** Ensure exact match including protocol, domain, path, and trailing slashes
*   **Debug:** Log the constructed OAuth URL and compare with registered URIs

**Issue:** `invalid_grant`

*   **Cause:** Authorization code expired, already used, or invalid
*   **Solution:** Implement proper error handling and direct users to restart OAuth flow
*   **Prevention:** Don't cache or reuse authorization codes

**Issue:** Token exchange fails

*   **Cause:** Incorrect client credentials or malformed request
*   **Solution:** Verify environment variables and request format
*   **Debug:** Check API documentation for exact token exchange format

#### Integration Issues

**Issue:** Provider not appearing in UI

*   **Checklist:**   Platform registered in `platforms/src/platforms.ts`
    *   App config added to `app/config/platformMap.ts`
    *   PROVIDER\_ID added to `types/src/index.d.ts`
    *   Feature flag enabled (if applicable)
    *   Environment variables set correctly

**Issue:** Tests failing

*   **Common causes:**   External dependencies not mocked properly
    *   Environment variables not set in test environment
    *   Async/await handling issues
    *   TypeScript type mismatches

**Issue:** Verification always fails

*   **Debug steps:**
    1.  Check API endpoint accessibility
    2.  Verify authentication credentials
    3.  Test API calls manually with curl/Postman
    4.  Check for rate limiting
    5.  Validate request/response format

#### On-Chain Issues

**Issue:** Contract calls failing

*   **Causes:**   Wrong contract address
    *   Incorrect ABI
    *   Network connectivity issues
    *   Invalid method parameters

**Issue:** Balance checks incorrect

*   **Causes:**   Wrong token decimals
    *   Incorrect unit conversion
    *   Contract not implementing standard interface

### Debug Tools

#### Enable Debug Logging

#### Manual API Testing

#### Contract Debugging

* * *

## Security Checklist

Before submitting your PR, verify:

### Code Security

*   No sensitive data logged to console
*   All external API responses validated
*   Proper error handling without internal detail exposure
*   No hardcoded secrets or API keys
*   Secure record data (no PII stored)

### OAuth Security (if applicable)

*   OAuth scopes properly validated
*   Access tokens not stored as instance variables
*   Proper handling of expired/invalid tokens
*   Redirect URI validation implemented

### On-Chain Security (if applicable)

*   Multiple RPC endpoints configured
*   Contract call validation implemented
*   Proper unit conversion (decimals handling)
*   Anti-sybil measures (transaction history checks)

### Testing Security

*   All success scenarios tested
*   All failure scenarios tested
*   Error handling tested
*   Edge cases tested
*   \>80% code coverage achieved

### Anti-Sybil Measures

*   Account age requirements
*   Activity/reputation requirements
*   Email/phone verification checks
*   Transaction history validation (for on-chain)
*   Multiple validation criteria implemented

[Implementation Patterns](_building-with-passport_stamps_create-a-stamp_implementation-patterns.md)[OAuth Integration Example](_building-with-passport_stamps_create-a-stamp_examples_oauth-pattern.md)

#### _building-with-passport_stamps_introduction.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/introduction
> Scraped: 1/9/2026, 1:31:55 PM

Passport Stamps are a way to collect and present data without exposing it or giving up ownership.

Ready to get started?

## What are Stamps?

Passport Stamps is an aggregate, real-time verification tool that can enable users to prove their unique humanity using a variety of different verification methods, and for developers to access these humanity proofs via the [Stamps API](_building-with-passport_stamps_passport-api.md) or [smart contracts](_building-with-passport_stamps_smart-contracts.md).

**Verified Credentials do not contain any personal identifying information!** They simply demonstrate, using a cryptographic signature, that the user gave access to a specific app and that some criteria were met. Learn more about how Human Passport is [privacy preserving (opens in a new tab)](https://passport.human.tech/privacy).

## Use cases

Developers can integrate Passport in a variety of different programs and apps in the web3 ecosystem, as demonstrated by the following use case examples:

*   Sybil resistance for faucets, bundlers and airdrops
*   Gating access to content, events, polls, or communities
*   Priority weighting votes
*   Proving trustworthiness

Passport Stamps is a versatile and valuable tool for managing access, promoting transparency, and establishing trust within different web3 environments.

[Learn more about Passport use cases](_overview_use-cases.md).

## Available developer tools

Passport score and Stamp data can be retrieved in two ways:

*   **[Stamps API v2](_building-with-passport_stamps_passport-api.md):** Retrieves the Stamp-based Unique Humanity Score and associated metadata for a specified address.
*   **[Passport Smart Contracts](_building-with-passport_stamps_smart-contracts.md):** Interacts with a blockchain to retrieve Stamp-based Unique Humanity Scores associated with a specific address.

Passport's Stamps-based product can also be delivered to users in a few different ways:

*   **[Passport App (opens in a new tab)](https://app.passport.xyz/):** The standard Passport app that allows users to manage their Stamps and view their Passport score.
*   **[Passport Embed](_building-with-passport_stamps_passport-embed.md):** A widget that can be embedded on a website or app to allow users to verify their identity.
*   **[Custom Passport](_building-with-passport_custom-passport.md):** A dashboard that can be customized to the unique needs of your ecosystem.

### Stamps API v2

The Stamps API v2 serves as a powerful tool for developers, offering access to Passport scores and Stamps via several REST endpoints.

### Passport Embed

Passport Embeds enables partners to integrate Human Passport's Stamps-based verification directly on their website or dApp, ensuring that users can verify their identity without having to leave the protected user flow.

### Custom Passport

Custom Passport is a premium offering that enables partners to develop a Human Passport dashboard that is customized to the unique needs of their ecosystem. This offering enables several additional features above and beyond what is offered on the standard Passport app, which can enable tailored proof of humanity solutions.

### Onchain Passport

Passport's smart contracts enable you to pull score and Stamp data directly from the blockchain to enable a truly decentralized integration.

## Getting Started

To begin your development journey with Human Passport, follow these steps:

* [Get an API key and scorer ID for the APIs](_building-with-passport_stamps_passport-api_getting-access.md)
* [Use the API playground tool (requires API keys) (opens in a new tab)](https://api.passport.xyz/v2/docs)
* [Get to "Hello World" with Stamps API v2](_building-with-passport_stamps_passport-api_quick-start-guide.md)

By following these steps, you'll be well-equipped to start integrating Passport into your platform.

If you have questions or need support, you can chat with us on our [developer support channel on Telegram (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh).

[Changelog](_overview_changelog.md)[Scoring thresholds](_building-with-passport_stamps_major-concepts_scoring-thresholds.md)

#### _building-with-passport_stamps_major-concepts_deduplicating-stamps.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/major-concepts/deduplicating-stamps
> Scraped: 1/9/2026, 1:31:55 PM

### Why is deduplication necessary?

Stamp deduplication is a crucial feature that prevents users from amplifying their influence over some specific outcome by submitting the same Stamps across multiple Passports.

It is important for users to be able to hold multiple Passports representing different user profiles that might be used to as identification in specific communities. However, without deduplication logic, this could allow users to repeatedly attach the same Stamps to multiple Passports, fooling an app into treating each Passport as a real, verified human.

Deduplication ensures that a user can only associate an individual Stamp to one single identity within a specific context.

### Do you need to handle deduplication in your app?

If your app uses a Passport default Scorer, then deduplication is already handled server-side. When you request a score through the API, we calculate scores after already deduplicating Stamps, meaning you don't have to implement any deduplication logic yourself.

However, if you are using your own custom scoring mechanism based on Stamp data, you will have to implement deduplication for yourself. Each Stamp has a `hash` field that can be used as a unique identifer. You can store hashes and compare them across all your users' Passports to ensure they are not being used multiple times. Our Scorer uses a Last-In-First-Out mechanism to handle duplicates, but you might want to use your own algorithm in your custom Scorer.

### How does Human Passport handle duplicate Stamps?

Passport handles the issue of Stamp duplication by automatically identifying and eliminating duplicate Stamps. This prevents users from using the same credentials to verify their Stamps and identity across multiple Passports. This ensures that each user in an application has a unique and consistent digital identity.

By default, the Stamps API uses a **Last In, First Out (LIFO)** Stamp deduplication method.

This means that, in a given scoring instance, if a Passport holder submits a Stamp that has already been submitted by another user, the _duplicate_ Stamp is ignored and not counted towards the score.

For example, let’s say you build an application that uses the Stamps API to verify the unique humanity of your users. Two Passports, “Passport A” and “Passport B,” present the same Stamp based on the same Twitter account. In this scenario, the Last-in-First-out deduplication method would only count the Stamp instance that was submitted earliest, ignoring the one that was submitted later.

For example, if Passport A submitted the Twitter Stamp first, followed by Passport B, your app would only count the instance of the Twitter Stamp submitted by Passport A. The same rule applies to any subsequent instances of the Stamp.

This LIFO method ensures that each Passport’s score accurately reflects the unique identity of its holder. This prevents duplicate Stamps from skewing the verification process and prevents users from re-using evidence of personhood across multiple Passports within an application.

### Things to note

Stamps are unique to scoring instances. For example, one user uses Passport holder A with one Twitter account in an application that uses scoring instance X, and another user uses the same Twitter account in a distinct Passport in an independent scoring instance Y. In this case, both users will get scored for the Twitter account. As long as the scoring instances are independent, there is no concern for double counting or interference between instances. This allows users to create multiple personas that they use in different contexts but prevents double-counting of their credentials within a context.

The scores assigned to Passports will not change once they are issued. This means that there is no need to recalculate Passport scores or synchronize them again in case of duplicate Stamp submissions. Once a score is assigned to a Passport, it remains fixed and can be relied upon for future verifications, even if a duplicate Stamp is submitted by a new Passport. This makes the scoring process more efficient and streamlined, which is particularly important for large and complex applications that score a high volume of verifiable credentials.

Also note that because Stamp deduplication is achieved using a 'last in, first out' model, it is possible for Passports with identical Stamps to return different scores from different Scorers. The reason is that if the identical passports A and B are submitted to Scorer 1 in the order `A,B`, the returned score could be different to the same Passports submitted to Scorer 2 in the order `B,A`, because different instances of duplicate Stamps would be removed.

### Summary

The LIFO deduplication strategy has several benefits for Passport holders and developers. It ensures that each Passport holder (in other words, Ethereum address) is assessed based on their unique set of Stamps, and that no one receives an unfair advantage due to having the same Stamp as another Passport holder within a given scoring instance. This means that for applications using the Stamps API, there will be no double-counting of Stamps within the app, ensuring a fair and accurate assessment of each user’s unique identity.

[Credential Map and Weights](_building-with-passport_stamps_major-concepts_credential-map-and-weights.md)[Stamp and score expiry](_building-with-passport_stamps_major-concepts_expirations.md)

#### _building-with-passport_stamps_major-concepts_educating-users.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/major-concepts/educating-users
> Scraped: 1/9/2026, 1:31:55 PM

## Platform Integrator concepts

This page is for platforms who integrate with Human Passport and make its sybil-resisting functionality available to their ecosystem partners.

### Audience definitions

First off, some audience definitions:

1.  **Platform Integrator:** An application that integrates with Passport and makes the functionality available to their ecosystem partners.
2.  **Ecosystem partners:** Organizations or apps who use the platforms built by Platform Integrators.
3.  **End-users:** People who are engaging with the ecosystem partner's content or programs within the platform.

We'll use [Snapshot (opens in a new tab)](https://snapshot.org/#/) as an example. Snapshot is an offchain voting platform that allows DAOs, DeFi protocols, or NFT communities to participate in decentralized governance. Within the Snapshot platform, Optimism Collective allows users to vote on proposals using Snapshot's technology.

In this situation, Snapshot would be a platform integrator, Optimism Collective would be an ecosystem partner, and the users submitting and voting on proposals are end-users.

Here are some examples and their Passport use cases:

### What are Sybils and why should you care?

Sybil attacks describe the abuse of a digital network by creating many illegitimate virtual personas. There are several ways that users can become incentivized to create Sybil accounts, for example to receive a reward multiple times, or have additional influence over a vote. They prevent you from efficiently allocating power and/or capital among your community by capturing it for some dishonest person or group. Without some form of Sybil defense, you have no way to tell whether the users showing up to your application really represent individual human users or whether they are actually bots or fake accounts.

### What is Sybil defense?

Sybil defense is a catch-all term for any actions that minimize the effect of Sybils. Typically, Sybil defense involves filtering out users that can't provide sufficient evidence that they are real human individuals. The more effective the Sybil defense, the more confident you can be that your users are real, and the more effectively you can distribute rewards, votes and other forms of capital and agency to your community.

Human Passport is a Sybil defense tool. It provides everything you need to check the personhood of your users without invading their privacy.

Read more about Sybil defense on the [blog (opens in a new tab)](https://www.gitcoin.co/blog/tag/gitcoin-passport).

### How to integrate Human Passport into your platform

The most common way platforms use Human Passport is to use Passport scores or specific combinations of Stamps to control access to some content or function. This can be handled in just a few simple functions in your app.

We have detailed guides demonstrating various Passport integrations. After you have integrated Passport into your app, your users can connect their Ethereum wallet, and the app can make an API call to the Passport server to retrieve the user's Stamps and Passport score.

The score is the sum of weights assigned to the user's Stamps. It is possible to create custom algorithms for scoring Passports from raw Stamp data, but using Passport's server is considered best practice for several reasons:

1.  You benefit from [Stamp weights (opens in a new tab)](https://github.com/passportxyz/passport-scorer/blob/main/api/scorer/settings/gitcoin_passport_weights.py) that have been assigned by Human Passport data scientists.
2.  You do not have to handle complications such as [Stamp deduplication](_building-with-passport_stamps_major-concepts_deduplicating-stamps.md) - the server does this for you.
3.  You can follow our simple [tutorials](_building-with-passport_stamps_passport-api-v1_tutorials.md) to quickly and easily start defending your app from Sybils!

While utilizing the Passport score is a best practice, you could also use Stamp data in addition to the Passport score, or just use Stamp data to gate access. For example, a few specific Stamps might be particularly important to you (maybe you decide that having a Github account for over 180 days is a hard requirement to access your platform). In this case you can access your user's Stamp collection and confirm ownership of individual Stamps.

Finally, you might not necessarily want to automatically gate access based on Passport scores or Stamps. Perhaps you want to display Stamp and score information about each user so platform administrators or end users can make real-time decisions based on the user's trustworthiness or reputation. For example, you might have to determine an honest user from several impersonator accounts. Quick access to Stamp and score data would give you a strong signal about who is the genuine user. There is a guide for displaying Stamp and score data in your app's UI [here](_building-with-passport_stamps_passport-api-v1_tutorials_integrating-stamps-and-scorers.md)!

Read more on [How Passport works](_overview.md).

Start building using our [Integration guides](_building-with-passport_stamps_passport-api-v1_tutorials.md).

### **What does this look like for ecosystem partners?**

It would be helpful to understand the [audience definitions](_building-with-passport_stamps_major-concepts_educating-users.md#audience-definitions) in the introduction of this page when reading this section.

If integrated properly, ecosystem partners utilizing a platform's services will be able to utilize Passport functionality to ensure that their content or programs are minimally affected by Sybils.

For example, an ecosystem partner runs a forum and voting platform in addition to their main application. Integrating Passport across all these platforms gives them confidence that your whole organization is protected to the same standard, with the same configuration.

A Passport integration is straightforward, flexible and configurable to ecosystem partners' needs depending on how a platform integrator builds the integration. You can easily set global configurations that are standard across all platforms and partners, or you could tailor your Sybil defences to each platform, so that you can have stricter controls for more sensitive services.

You can learn more about these benefits by reading our [blog post about our partnership with Guild.xyz (opens in a new tab)](https://www.gitcoin.co/blog/guild-xyz-and-gitcoin-passport-partner).

### What does this look like for end users?

End users benefit from a very straightforward verification process and proof of personhood they can use across web3. Human Passport is a very widely used Sybil defense tool that your users can set up once and then use to identify themselves to all kinds of apps and services.

Your end users can follow this simple guide to set up their Passport:

1.  To get started, you must have an Ethereum wallet.
2.  Then, you can visit the [Passport app (opens in a new tab)](https://app.passport.xyz/).
3.  There, you can sign in with Ethereum and connect Stamps to your Passport in a few clicks.
4.  When they want to utilize a tool that is Passport-gated, you can sign a message and provide access to the platform provider to read your Stamp and score data.

### More customization

Some platforms will find that they have specific needs that are not met by the standard Stamp library. In that case, you can add a new Stamp specifically for your purpose! Creating a Stamp requires some provable action to be captured in the form of a Verifiable Credential. We have created a [step-by-step guide](_building-with-passport_stamps_create-a-stamp_integrating-a-new-stamp.md) to help platforms to create new Stamps.

### Use cases

Human Passport is already protecting many real world applications! There are several use case articles on the [Gitcoin blog (opens in a new tab)](https://www.gitcoin.co/blog/tag/case-studies) where you can read about how various apps have integrated Passport.

Some examples include:

### Where to go from here?

*   Read more about [how Passport works](_overview_why-passport-xyz.md)
*   Get you own Passport at [https://app.passport.xyz (opens in a new tab)](https://app.passport.xyz/)
*   You can join the [Passport Developer Telegram (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh) and ask questions to the developers, users and wider community

[API pagination](_building-with-passport_stamps_major-concepts_api-pagination.md)[Introduction](_building-with-passport_stamps_passport-api_introduction.md)

#### _building-with-passport_stamps_major-concepts_expirations.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/major-concepts/expirations
> Scraped: 1/9/2026, 1:31:55 PM

## Expirations

Stamps and scores eventually become invalid. This is a security feature that provides a degree of confidence that the Stamps and scores you query in your application are still valid.

Without some mechanism for Stamp expiry, a Stamp issued once would remain valid forever, even if the evidence supporting that Stamp or score had long since changed.

For example, a user could mint a Stamp using an account on some Web2 service in the small window between creating the account and it being shut down by the service's compliance team. Without expiry, you would not be able to tell, but with expiry, after some time the user would simply not be able to reverify the Stamp.

The shorter the time between the issuance date and the expiration date, the more security you gain, but the trade off is that the user experience deteriorates because users are forced to reverify frequently.

## Offchain Stamps

Offchain Stamps expire after 90 days. This is handled by the Human Passport server.

Users can bump the expiry date by another 90 days by reverifying your Stamps on the [Passport app (opens in a new tab)](https://app.passport.xyz/).

## Onchain Stamps

Like offchain Stamps, onchain Stamps also expire. For Passport attestations, there is a key in the schema called `Expiration Dates`. An integrator can query this field to see whether the current time is later or earlier than the `expiryDate` and use this to determine whether a Stamp has expired. The `expiryDate` is automatically set to 90 days after the `issuanceDate`. Reverification requires issuing a new Passport attestation.

Onchain scores do not have an explicit expiry date associated with them. Integrators can use the attestation transaction time as a proxy for the issuance date. As a rule of thumb, we recommend expiring scores 90 days after it was created. Offchain Stamps also expire after 90 days.

You can read more detail about onchain Samp and score expiry [here](_building-with-passport_stamps_smart-contracts_onchain-expirations.md).

[Deduplicating Stamps](_building-with-passport_stamps_major-concepts_deduplicating-stamps.md)[API pagination](_building-with-passport_stamps_major-concepts_api-pagination.md)

#### _building-with-passport_stamps_major-concepts_scoring-thresholds.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/major-concepts/scoring-thresholds
> Scraped: 1/9/2026, 1:31:55 PM

A very common [use case](_overview_use-cases.md) for Human Passport is gating access based on Passport scores. In order to do this, application owners have to determine a cutoff for users that are, and are not, allowed to access some content or function. Typically, this cutoff is a certain Passport score above which users are allowed access; otherwise they are blocked. This is known as the **threshold score**.

## Human Passport's Scorer

The `Unique Humanity (binary)` Scorer provided on the Passport app applies a threshold to users' Passport scores. This is how the Scorer is able to return a binary Sybil/non-Sybil response.

The algorithm adds up the weights of each Stamp owned by each user and compares the result to a pre-defined threshold value. Each users score either exceeds that threshold or it doesn't, making it possible to assign them a binary score.

**The threshold used by the Passport app is 20**.

This is designed to be an effective default threshold value for general-purpose use.

Passport data scientists use datasets of known Sybils and known humans to analyze how credentials are used by good and bad actors, and what threshold most effectively separates the two groups. However, it is important to note that it is not a perfect system. Not all Sybils will be eliminated at that threshold. On the other hand, higher thresholds might create excessively high barriers to entry that eliminate honest human users.

## Trade-offs

Choosing a threshold is always a balance between eliminating bad actors on the one hand, and making your application useable for honest humans on the other. A very high threshold will be more effective at eliminating Sybils because the time, effort and possibly money expended to meet the threshold are greater. This means it is less economically viable for bad actors to create large numbers of fake accounts. However, your honest users also have to meet those same criteria. If they are too onerous or difficult, your honest users might be unable or unwilling to participate. Therefore, there is always a balance to strike between widening honest participation and reducing dishonest participation. Where the right balance lies will differ from project to project. The Passport default of 20 is thought to be a good all round starting point.

By implementing your own Scorer, you can tweak the entry requirements to your application more finely. Not only can you change the threshold, but you can upweight or downweight certain Stamps that are particularly strong signals for your specific use-case. You could even have certain Stamps as absolute requirements, or use a combination of required Stamps and an overall score threshold.

Learn more about custom Scorers in our [tutorial](_building-with-passport_stamps_passport-api-v1_tutorials_client-side-scoring.md).

[Introduction](_building-with-passport_stamps_introduction.md)[Credential Map and Weights](_building-with-passport_stamps_major-concepts_credential-map-and-weights.md)

#### _building-with-passport_stamps_passport-api-v1_api-reference.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/passport-api-v1/api-reference
> Scraped: 1/9/2026, 1:31:56 PM

The Stamps API enables developers to retrieve Human Passport scores and Stamp metadata for users who have created a Human Passport.

## Authentication

To access the Stamps API, you will need a [Scorer ID and an API key](_building-with-passport_stamps_passport-api-v1_getting-access.md).

To make a successful request, you will need to include your API key in the "Authorization" header of each API request. The header should have the following format:

Replace `{API_key}` with your API key. For example, if you were using cURL, your request might look something like this:

## Rate limits

Your API key will allow you to make up to a certain number of requests to any of the endpoints included on this page during a certain period of time.

Requests made to the Stamps API v1 and v2 count towards the same rate limit.

You will start off with Tier 1, and will need to [request higher rate limits (opens in a new tab)](https://docs.google.com/forms/d/e/1FAIpQLSeUATg0nTE9ws3qESGBktFcOX0brF19iv2L0BLoiub9pbSMeg/viewform) if necessary.

## Key concepts

There are several key concepts you should be aware of when using the Stamps API:

*   **Timeouts:** The Stamps API endpoints have a timeout of 60 seconds. This means that if a request to one of these endpoints does not receive a response within 60 seconds, the request will be aborted. If your request times out, you should set up retry logic by calling the API again after a short delay, typically increasing the delay for each subsequent retry.
*   **Pagination:** Some requests return a large amount of data. To effectively retrieve this data, you will need to paginate the response. For more information, see [API pagination](_building-with-passport_major-concepts_api-pagination.md).
*   **Data dictionary:** We have put together a [data dictionary](_building-with-passport_major-concepts_data-dictionary.md) that you can use to better understand each field that delivers with the response payloads from the Stamps API endpoints.

## Available endpoints

To get a Passport score from an ETH address, follow these steps:

1.  **Optional:** [Retrieve a signing message](_building-with-passport_stamps_passport-api-v1_api-reference.md#retrieve-a-signing-message)
    `GET /registry/signing-message`
2.  [Submit and retrieve latest score for a single address](_building-with-passport_stamps_passport-api-v1_api-reference.md#submit-and-retrieve-latest-score-for-a-single-address)
    `POST /registry/submit-passport`
3.  [Retrieve previously submitted score for a single address](_building-with-passport_stamps_passport-api-v1_api-reference.md#retrieve-previously-submitted-score-for-a-single-address)
    `GET /registry/score/{scorer_id}/{address}`
4.  [Retrieve previously submitted scores of all submitted addresses](_building-with-passport_stamps_passport-api-v1_api-reference.md#retrieve-previously-submitted-scores-of-all-submitted-addresses)
    `GET /registry/score/{scorer_id}`

Use the following endpoints to receive Stamps data:

* [Retrieve Stamps verified by a single address](_building-with-passport_stamps_passport-api-v1_api-reference.md#retrieve-stamps-verified-by-a-single-address)
    `GET /registry/stamps/{address}`
* [Retrieve all Stamps available in Passport](_building-with-passport_stamps_passport-api-v1_api-reference.md#retrieve-all-stamps-available-in-passport) `GET /registry/stamp-metadata`

Use the following endpoint to receive staking information

* [Retrieve GTC staking amounts](_building-with-passport_stamps_passport-api-v1_api-reference.md#retrieve-gtc-staking-amounts) `GET /registry/gtc-stake/{address}`

### Retrieve a signing message

This optional endpoint returns a message verifying the agreement to submit a wallet address for scoring, and a `nonce` that can be used to verify the authenticity of the signed message.

You don't need to get a signature from this endpoint, but you do need a signature from the wallet you are scoring that proves that the user owns the wallet.

> GET /registry/signing-message

### Submit and retrieve latest score for a single address

This is the primary endpoint that integrators should use.

This endpoint will submit the Passport to the scorer, and return the latest score and Stamp data for a single address. It will always return the most updated score and Stamp data, so resubmitting a user's address will refresh their score.

> POST /registry/submit-passport

#### JSON body parameters

#### Sample responses

The name in the parenthesis represents what [type of Scorer](_building-with-passport_getting-access.md#types-of-scorers) you are using.

### Retrieve previously submitted score for a single address

You must submit a Passport to be scored via the [Submit for scoring](_building-with-passport_stamps_passport-api-v1_api-reference.md#submit-and-retrieve-latest-score-for-a-single-address) endpoint before successfully receiving that score via this endpoints.

Use this endpoint to retrieve the last submitted score for one Ethereum address.

You can use the [multiple address](_building-with-passport_stamps_passport-api-v1_api-reference.md#retrieve-previously-submitted-scores-of-all-submitted-addresses) endpoint if you'd like to retrieve the latest submitted scores for all addresses that have been submitted to the scorer using the POST endpoint.

> GET /registry/score/{scorer\_id}/{address}

> API users may find the scores returned by `registry/score` sometimes differs from the score displayed in the app. If this happens, simply refresh the Passport score by making a POST request to [resubmit/refresh the address's score](_building-with-passport_stamps_passport-api-v1_api-reference.md#submit-and-retrieve-latest-score-for-a-single-address).

### Retrieve previously submitted scores of all submitted addresses

You must submit a Passport to be scored via the [Submit for scoring](_building-with-passport_stamps_passport-api-v1_api-reference.md#submit-and-retrieve-latest-score-for-a-single-address) endpoint first.

Use this endpoint to retrieve the last submitted score for all Ethereum addresses that have been submitted (POST endpoint) to your scorer.

> GET /registry/score/{scorer\_id}

#### Query parameters

You can also add a query to return all the last submitted scores for a given address based on the timeperiod that you submitted their address to the scorer.

The two possible query parameters are `last_score_timestamp_gt` and `last_score_timestamp_gte`.

*   `last_score_timestamp_gt` (standing for 'greater than'): This parameter returns the address' last submitted scores that were submitted to your scorer instance _after_ the specified time.
*   `last_score_timestamp_gt` (standing for 'greater than or equal'): This parameter returns the address' last submitted scores that were submitted to your scorer instance _after or at the same time as_ the specified time.

For example:

### Retrieve Stamps verified by a single address

Use this endpoint to request all Stamps that have been verified by the specified Ethereum address.

If you would like to retrieve the metadata for all available Stamps, please use the [Get Stamps metadata](_building-with-passport_stamps_passport-api-v1_api-reference.md#retrieve-all-stamps-available-in-passport) endpoint.

> GET /registry/stamps/{address}

#### Query parameters

### Retrieve all Stamps available in Passport

Use this endpoint to request all Stamps available on Passport.

If you would like to retrieve just the Stamps that are connected to a specified Ethereum address, please use the [Get Stamps](_building-with-passport_stamps_passport-api-v1_api-reference.md#retrieve-stamps-verified-by-a-single-address) endpoint.

> GET /registry/stamp-metadata

### Retrieve GTC staking amounts

**This endpoint has been deprecated, as it was built around the legacy GTC staking application.**

We are planning on releasing a new version of the GTC staking endpoint. Please fill out the following form to help us prioritize this new endpoint in our roadmap:

[https://forms.gle/VbDBNTvb99emaSUV9 (opens in a new tab)](https://forms.gle/VbDBNTvb99emaSUV9)

* * *

This endpoint returns both self (`stakes`) and community (`xstakeAggregates`) staking amounts for a specified address and round. It also breaks down staking amounts based on round ID.

Our round IDs correspond to the different Gitcoin Grants rounds, and can be found at the following link: [Round IDs (opens in a new tab)](https://github.com/passportxyz/id-staking/blob/8782b2b7138c2b41644a74384d75bca56316317d/packages/react-app/src/components/RoundSelector.jsx#L4-L10)

> GET /registry/gtc-stake/{address}/{round\_id}

If you have questions about the API you can ask them in our [developer support channel (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh).

[Introduction](_building-with-passport_stamps_passport-api-v1_introduction.md)[Data dictionary](_building-with-passport_stamps_passport-api-v1_data-dictionary.md)

#### _building-with-passport_stamps_passport-api-v1_data-dictionary.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/passport-api-v1/data-dictionary
> Scraped: 1/9/2026, 1:31:56 PM

### The Scorer object

### The Stamp object

#### Credentials

A `credential` is a struct returned in the Stamp object. It has its own sub-fields as follows:

### Stamp metadata

### GTC staking

### Other data

[API reference](_building-with-passport_stamps_passport-api-v1_api-reference.md)[Tutorials (v1)](_building-with-passport_stamps_passport-api-v1_tutorials.md)

#### _building-with-passport_stamps_passport-api-v1_introduction.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/passport-api-v1/introduction
> Scraped: 1/9/2026, 1:31:56 PM

Building with Passport

Stamps

Stamps API v1 (deprecated)

Introduction

⚠️

**Please note:**
In November 2024, we soft-launched [Stamps API v2](_building-with-passport_stamps_passport-api.md).

We have not announced any deprecation or retirement timelines for v1 yet, but do strongly recommend using v2 moving forward.

You can learn more about the differences between v1 and v2 via our [migration guide](_building-with-passport_stamps_passport-api_migrate.md).

## Available v1 endpoints

| Endpoint action | Endpoint |
| --- | --- |
| Retrieval of signing messages | `GET /registry/signing-message` |
| Submitting Passports for scoring or refresh | `POST /registry/submit-passport` |
| Retrieval of scores for one address | `GET /registry/score/{scorer_id}/{address}` |
| Retrieval of scores for multiple addresses | `GET /registry/score/{scorer_id}` |
| Retrieval of Stamps linked to Passports | `GET /registry/stamps/{address}` |
| Retrieval of all available Stamps | `GET /registry/stamp-metadata` |
| Retreival of community staking amounts | `GET /registry/gtc-stake/{address}` |

Learn more about each of these endpoints on our [API Reference](_building-with-passport_stamps_passport-api-v1_api-reference.md) page.

## Next steps

Learn more about the Stamps API v1:

* [API reference](_building-with-passport_stamps_passport-api-v1_api-reference.md)
* [Data dictionary](_building-with-passport_stamps_passport-api-v1_data-dictionary.md)

[Migrate: v1 to v2](_building-with-passport_stamps_passport-api_migrate.md)[API reference](_building-with-passport_stamps_passport-api-v1_api-reference.md)

#### _building-with-passport_stamps_passport-api-v1_tutorials.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/passport-api-v1/tutorials
> Scraped: 1/9/2026, 1:31:56 PM

This section includes several tutorials for integrating Human Passport into your apps with v1 of the API.

* [Gating access with Passport scores](_building-with-passport_stamps_passport-api-v1_tutorials_gating-access-with-passport-scores.md)
* [Retrieve Passport data and display it to your UI](_building-with-passport_stamps_passport-api-v1_tutorials_integrating-stamps-and-scorers.md)
* [How to retrieve, handle and display Stamp metadata in a simple app](_building-with-passport_stamps_passport-api-v1_tutorials_working-with-stamp-metadata.md)
* [Requiring a Passport score for airdrop claim](_building-with-passport_stamps_passport-api-v1_tutorials_requiring-a-passport-score-for-airdrop-claim.md)
* [Integrating onchain Stamp data using smart contracts](_building-with-passport_stamps_passport-api-v1_tutorials_integrating-onchain-stamp-data.md)

## Where to start

If you are taking your first steps into building apps with the Stamps API, please make sure to use [Stamps API v2](_building-with-passport_stamps_passport-api.md). All of the below tutorials are still using v1 of the API.

If you need additional support or you have questions about developing with Passport, you can chat in our dedicated developer support channel on [Telegram (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh).

## Tutorials

### Gating access with Passport scores

This tutorial will guide you through building a simple "knowledge hub" app with some specific content that can only be accessed by users with a Passport score above a threshold. Read more about thresholds on the [scoring thresholds](_building-with-passport_stamps_major-concepts_scoring-thresholds.md) page.

The app is built using [Next.js (opens in a new tab)](https://nextjs.org/), [Chakra-ui (opens in a new tab)](https://chakra-ui.com/), and [ethers (opens in a new tab)](https://docs.ethers.org/v5/).

### Integrating Stamps and scores

This tutorial will guide you through building a simple app that shows whether a user is "trusted" or not based upon their Passport score and ownership of specific Stamps. Multiple users can connect to the app and the Stamps they own are displayed in the app's UI.

The app is built using [Next.js (opens in a new tab)](https://nextjs.org/), [Chakra-ui (opens in a new tab)](https://chakra-ui.com/), and [ethers (opens in a new tab)](https://docs.ethers.org/v5/).

### How to retrieve, handle and display Stamp metadata in a simple app

This tutorial will guide you through building a simple app that displays the Stamps that are connected to a specified wallet and Passport.

The app is built using [Next.js (opens in a new tab)](https://nextjs.org/), [Chakra-ui (opens in a new tab)](https://chakra-ui.com/), and [ethers (opens in a new tab)](https://docs.ethers.org/v5/).

### Requiring a Passport score for airdrop claim

This guide demonstrates using Passport scores to shield your airdrop from airdrop farmers and other bad actors.

This app is built using [Next.js (opens in a new tab)](https://nextjs.org/), [RainbowKit (opens in a new tab)](https://www.rainbowkit.com/docs/installation), and [wagmi (opens in a new tab)](https://wagmi.sh/).

### How to integrate onchain Passport data using smart contracts

_Please note that this tutorial is not related to the Stamps API, and instead uses the Passport smart contract stack._

This tutorial will guide you how to show different content to users depending on their Passport data, all pulled from the blockchain.

The app is built using [Next.js (opens in a new tab)](https://nextjs.org/), [Chakra-ui (opens in a new tab)](https://chakra-ui.com/), and [ethers (opens in a new tab)](https://docs.ethers.org/v5/).

[Data dictionary](_building-with-passport_stamps_passport-api-v1_data-dictionary.md)[Protecting access with Passport scores](_building-with-passport_stamps_passport-api-v1_tutorials_gating-access-with-passport-scores.md)

#### _building-with-passport_stamps_passport-api-v1_tutorials_client-side-scoring.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/passport-api-v1/tutorials/client-side-scoring
> Scraped: 1/9/2026, 1:31:58 PM

## Building a custom, client-side scorer

Passport XYZ offers several scoring algorithms that can be executed on the Passport servers, such that a numeric score for a Passport can be requested from the Stamps API. However, this means you are restricted to Passport's algorithm and Passport's opinion about the relative weighting assigned to each individual Stamp. This might not be appropriate for all use cases.

For example, you might have a string preference for certain Stamps that are particularly relevant to your community that you want to weight more strongly in the scoring, or perhaps you have a great idea for a completely new algorithm that you want to implement to gate your app.

This tutorial will walk you through developing a custom scorer for your app.

### Prerequisites

Before we delve into this, it's important to note that there are a few preliminary steps you need to complete. Please ensure that these prerequisites are met before proceeding with the guide.

1.  You have created a Passport Scorer and received a Scorer ID
2.  You have an API key

If you haven't completed the preliminary steps above please refer to our [getting access guide](_building-with-passport_stamps_passport-api-v1_getting-access.md) first. Once you're done with that, return here and continue with this walkthrough.

## Creating a Scorer

### Setting up a basic app

This tutorial will build on the [Stamp Collector app](_building-with-passport_stamps_passport-api-v1_tutorials_working-with-stamp-metadata.md) tutorial. You should revisit that tutorial to build the foundations upon which this tutorial will build. You will use that app as a starting point and add scoring functionality on top. Follow the steps below to get started.

You can start the app now by navigating your terminal to the project root directory and running `npm run dev`. Then, navigate your browser to `localhost:3000`. You will see the app load in the browser, with buttons that enable you to connect your wallet and check your Stamps. You can go ahead and test that the `Connect Wallet` and `Show Stamps` buttons are working as expected.

The rest of the tutorial will build upon this basic app by adding functions and UI code to `app/page.tsx`.

### Stamps

The app queries the Stamps APIs `registry/stamps` endpoint to retrieve all the Stamps owned by the connected user. The `getStamps()` function parses the full response and extracts the `icon`, `id`, and `stamp` data into a `Stamp` object with the following structure:

This information is stored in a state variable, `stampArray`. This is all the information you need from the Stamps API.

### Scorers

The Passport XYZ scoring algorithm is a simple sum of weights assigned to each Stamp. The weights are provided in a file on the [Passport Github (opens in a new tab)](https://github.com/passportxyz/passport-scorer/blob/main/api/scorer/settings/gitcoin_passport_weights.py). Each weight is a decimal number associated with a specific Stamp name. The scoring algorithm simply iterates over the Stamp names for the Stamps owned by an address, retrieves the associated weights, and adds them together. The result is the user's Passport score.

#### The Passport Scorer

You can re-implement the Passport scoring algorithm easily in your app. Start by adding a file containing the Passport XYZ Stamp weights to your `app` directory. Copy the contents of [this file (opens in a new tab)](https://github.com/passportxyz/passport-docs/tree/main/utils/data/weights.ts) and paste it into a new file `app/stamp-weights.ts`.

Now, import the data into your app by adding the following import statement to `app.ts`:

You can also add two state variables: one to store the Passport score and one to toggle displaying the score in the UI:

Now, you can create a function to calculate the score. Name the function `calculateGitcoinScore()` to differentiate from a custom scorer you will create later. Inside, iterate over the `Stamps` in `stampArray`. Extract the name (the `stamp` field) from each `Stamp` and use it to look up the weight in `GITCOIN_PASSPORT_WEIGHTS`. Then add those together and log it to the console.

Also add a button to invoke the new function (this can be added immediately after the current button definitions in the UI code, near line 127):

Now add a simple `Score` component:

Finally, conditionally render your `Score` component if `showScore` is toggled ON. Add the following immediately below `{showStamps && <StampCollection />}` near line 144.

Now when you click the `Get Score` button in your UI, the sentence `Your score is X` is displayed under your Stamp collection! You can check this against the score given to you by the Passport XYZ app!

#### Custom weights

You can experiment with different weights simply by updating the values in `stamp-weights.ts`. As a simple demonstration, choose one of the Stamps you own and increase its value in `stamp-weights.ts` by 10. Next time you click `Get Score` your Passport Score will have increased by 10 too. You can experiment with weighting models that best serve your app. For example if you value web3 Stamps most strongly, you might increase their weighting relative to web2 Stamps. You can even set some Stamps to zero if you feel they are not relevant for controlling access to your content.

#### Custom algorithms

You can also implement your own scoring algorithm. To do this, simply create a new function similar to `calculateGitcoinScore` but implement some new logic in the function body. In this tutorial you will siumply replace the summation of weights with the mean. Later, you might design some complex model to implement.

You will repeat the steps from the `calculateGitcoinScore()`. Start by adding new state variables:

## Deduplication

Please note that scoring on the Passport server includes Stamp deduplication. This means the server automatically detects when the same instance of a Stamp has been submitted more than once to a specific Scorer instance and ignores any duplicates.

_**While it is out of scope for this tutorial, you should implement your own deduplication to accompany a custom scorer.**_

This requires logging the hashes of Stamps and checking that each hash is unique to each individual user.

## Next Steps

Now you know how Passport calculates its scores and have seen how to update the logic, you can be creative in implementing algorithms that best serve your community's needs.

[Requiring a Passport score for airdrop claim](_building-with-passport_stamps_passport-api-v1_tutorials_requiring-a-passport-score-for-airdrop-claim.md)[Custom Passport](_building-with-passport_stamps_custom-passport.md)

#### _building-with-passport_stamps_passport-api-v1_tutorials_gating-access-with-passport-scores.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/passport-api-v1/tutorials/gating-access-with-passport-scores
> Scraped: 1/9/2026, 1:31:56 PM

## Gating access with Passport scores

In this guide, you'll learn how to gate an application using Passport XYZ. Specifically, you will:

*   Fetch a score using the Stamps API
*   Examine best practices for retrieving Passport scores
*   Implement gating so that some content is only available to users with scores above a threshold
*   Redirect users to instructions for improving their Passport scores

This tutorial is a more detailed version of a video tutorial put together by Nader Dabit. Check out his video and related sample code at the following links:

### Prerequisites

To follow this tutorial, you'll need [Next.js (opens in a new tab)](https://nextjs.org/), [Node (opens in a new tab)](https://nodejs.org/en), and [Chakra-UI (opens in a new tab)](https://chakra-ui.com/) installed on your machine. We will also be using the [Stamps API v1](_building-with-passport_stamps_passport-api-v1.md).

Before we delve into this, it's important to note that there are a few preliminary steps you need to complete. Please ensure that these prerequisites are met before proceeding with the guide.

1.  You have created a Passport Scorer and received a Scorer ID
2.  You have an API key

If you haven't completed the preliminary steps above please refer to our [getting access guide](_building-with-passport_stamps_passport-api-v1_getting-access.md) first. Once you're done with that, return here and continue with this walkthrough.

### App outline

The app we will build will be an educational site where users can learn about web3 and DAOs, and then if - and only if - their Passport score is above a threshold, they can uncover the secret information required to join our example Passport DAO.

You can find the code from this tutorial in this [GitHub repo (opens in a new tab)](https://github.com/passportxyz/passport-scorer/tree/main/examples/passport-gated-content-app).

The app will work as follows:

*   When the user visits the sample app, they have access to three tabs - one to welcome them and two containing learning material about Web3 and DAOs.
*   A fourth tab will contain information about how the user can join your DAO.
*   The user will connect their wallet and Passport XYZ to the app. Their score will be calculated automatically.
*   If their score meets a threshold, the fourth tab will contain instructions and links that will enable them to join the DAO.
*   If the score does not meet the threshold, we'll withold the instructions and instead the tab will contain instructions for increasing their Passport score.

This simple example demonstrates the principles you would use to gate a real app using Passport XYZ.

The app will be built using [Next.js (opens in a new tab)](https://nextjs.org/) and will make use of several of the Scorer API endpoints.

### Setting up the app

We'll create an app using [Next.js (opens in a new tab)](https://nextjs.org/). We can bootstrap using `create-next-app`. This automatically creates all the necessary subdirectories, configuration and boilerplate code required to get us building as quickly as possible.

Start by entering the following command into your terminal:

This will create a new directory called `passport-app` and populate it with several sub-directories and files that form the skeleton of our app. `create-next-app` will ask for yes/no responses to a series of configuration questions - answer as follows:

### Building the App

Now that the app is set up, you can begin building. The code that controls what is rendered in the browser is contained in `src/app/page.tsx`. When you created your project, `create-next-app` saved a version of `page.tsx` with some default code. You can delete all the code in `page.tsx` and replace it with this boilerplate:

Notice that you are importing components from three sources: `ethers`, `@chakra-ui/react` and a local file `'tab-contents'`. The local file does not exist yet so you'll need to create it. Create a file called `tab-contents.tsx` in `src/app`. This is where you define the layout of four tabs on your web page and write the content that each tab should contain. You can paste the following code into your `tab-contents.tsx` and save the file.

You can now run the app to see what the bare bones of your project look like in the browser. Run the following command in your terminal:

Navigate your browser to `localhost:3000` to see the app up and running. You should see a welcome message on the `Home` tab and be able to click through the other tabs to read about Web3 and DAOs. However, notice that this is currently a straightforward static site with no opportunities for connecting an Ethereum wallet or interacting with Passport XYZ. These are the areas we will focus on for the remainder of the tutorial.

### Connecting a Wallet

Ethereum wallet connections are handled using `ethers`. In this section you will call some functions from `ethers` that allow your users to connect to the app using their Ethereum wallet. This is essential because this allows users to sign messages to approve the use of their address in Stamps API requests.

First, you already know that the user address is going to be an important piece of data that will be passed in several requests using the Stamps API. This means you probably want to keep track of it in the app's state. To do this, you can add the following state variable definition immediately below `export default function Passport () {`

This creates a variable `address` and a function `setAddress` you can use to update the value of `address`.

### Checking for existing connections

Your user might have opened your app with their wallet already connected. In this case, the process is slightly different. You do not need the pop-up window in MetaMask for the user to approve the connection, but you do need to grab the address and add it to the app's state. Since the user has already connected, this process does not require any user action - it can be automatic. To make it automatic, you need to use a `useEffect` hook. `useEffect` allows you to execute the connection logic when the `Passport()` component is added to the page. The logic you want to execute is:

1.  connect to the `provider`
2.  grab the user address
3.  add the user address to the app state
4.  handle any errors

You can achieve this by adding the following function to your app, next to your `connect()` function.

Well done - your users can now connect their Ethereum wallet to your app. If they are already connected, their address will be added to your app's state automatically when the app is started. You can check that this is all working properly by running the app (`npm run dev`) and connecting your wallet.

### Connecting to Passport XYZ

To use Passport XYZ, a user has to submit their Passport to the registry. This is a database of Passports linked to an Ethereum address that have been submitted for scoring. Part of the data that is passed along with a request to add a Passport to the registry is the `Scorer-Id` which is used to link your app to a specific instance of the `Scorer` you created earlier. This data together links your user's address to a specific collection of Stamps and an instance of a Scorer to use to calculate a Passport score. Therefore, this is a necessary step for integrating Passport into your app if you want to use Passport XYZ's default Scorer and calculate the score server-side. The weights applied to each Stamp can be found in the [Passport Github (opens in a new tab)](https://github.com/passportxyz/passport-scorer/blob/main/api/scorer/settings/gitcoin_passport_weights.py).

You can skip the Passport submission and retrieve the raw Stamp data to apply your own scoring algorithm.

The way Passport submission works is to first retrieve a message using the Stamps API's `signing-message` method. The user then signs this message using their Ethereum wallet, and sends the signed message back to the server using the Stamps API's `submit-passport` method.

The boilerplate code already assigns the necessary API endpoints to the variables `SIGNING_MESSAGE_URI` and `SUBMIT_PASSPORT_URI`. The following code snippet shows how to write two functions: one to grab the message to sign (`getSigningMessage`), and one to take that message, sign it, and return it (`submitPassport`). Successfully executing this logic adds the user's address to the Passport registry and triggers the server to calculate a score based on the Stamps present in the owner's Passport. A step-by-step explanation of each function is provided in comments in the code snippet.

Paste the following code into your application below your `checkConnection()` function.

These functions contain all the logic required for a user to submit their Passport to the registry. However, this is an action that needs to be triggered by the user. We can add another button to the UI that executes the Passport submission when it is clicked. Add the following code to the UI, immediately below the `connect` button, inside the `<Flex>` tags:

You can run the app and check that this works by connecting and submitting your Passport.

### Getting a Passport score

Your app will show different content depending on the user's Passport score. This means you need to retrieve the user's score and keep track of it in your app's state. First, create a new state variable for tracking your user's score. You can place this immediately below your existing state variable, `address`:

The Passport score is retrieved from the `/registry/score/` API endpoint, passing the `SCORER_ID` you set earlier and the user's address. The `SCORER_ID` is already loaded from the environment variables, and the user's address is in the app's state as `address`. You also need to pass your API key in the request header. The boilerplate code already handled formatting the headers and assigning them to the constant `headers`. This means all the ingredients are available for retrieving the Passport score. The function below puts the ingredients together and wraps in some error handling code. You can paste this new `checkPassport()` function into `page.tsx` immediately below your `submitPassport()` function.

Notice that there is some additional code included in this snippet for rounding the score to two decimal place precision and converting it to a `string` type before passing it to `setScore` so that it is captured in the app state.

Great! Now you have coded all the logic required to connect a wallet, submit a Passport to the registry and retrieve a Passport score. The `getScore()` function isn't actually invoked anywhere yet, though. If you want to check this function works correctly, you can add the following button immediately below the other two buttons you added earlier:

Clicking this button, after connecting a wallet and submitting a Passport to the registry, will print the following to the console (you can access your console by pressing `CTRL + SHIFT + I`):

#### Notes on best practices for scoring

It is recommended to use the Passport XYZ default Scorer. For now, this is the only option for server-side score calculations, but you can choose whether you wish the server to return an integer value (0-100) or return a Boolean (0 or 1). This is selected when you create the instance of the Scorer at [developer.passport.xyz (opens in a new tab)](https://www.developer.passport.xyz/).

If you choose to return an integer value, you can make your own choice about what threshold score to use to gate your content. In this tutorial, you are receiving an integer value from the Scorer API and thresholding it in the app. The threshold is hardcoded into the app with a value of 20. This is thought to be a pretty good general purpose threshold, but you can choose to raise the threshold if you want to be more stringent, or lower it to be more lenient. Picking the right threshold is application-specific and might require some experimentation to get it just right.

If you choose to return a binary value, the Passport server will still calculate the Passport score using the exact same algorithm, but it will threshold it server-side and return a 0 if the user's score is below the built-in threshold of 15, or a 1 if the user's score exceeds this threshold.

You can also choose to calculate your own Passport score by retrieving raw Stamp data and applying some custom algorithm on them. This provides a lot of flexibility to app builders. However, the major reason server-side calculation is recommended is because Stamp deduplication is included in the score calculation. This means the Passport server ensures that each specific user tamp can only be counted _once_ by your Scorer instance. If you implement your own scoring algorithm, you need to account for Stamp deduplication yourself.

### Gating access using the score

Now that you have a way to retrieve the user's Passport score you can use it to adjust the content they can access on your site. Specifically, you want to show different content in the "Join the DAO" tab depending on whether the user's Passport score is above some threshold.

To start, let's take a look at the content we want to differentiate. Earlier you created a file called `tab-contents.tsx` that contains all the content that renders inside each tab, and a `TabLayout` component that controls where that content is displayed. We can update this code so that `TabLayout` renders a different component depending on the user's Passport score. As a first step, update the `JoinTheDao` component so that it takes an argument `isAboveThreshold`. This will be a Boolean (`true`/`false`) that will be set to `true` if the user's score is above some threshold, and `false` otherwise. You can use this as a signal to render one set of content or another. To start, use the following code to render a new component `Content AboveThreshold` if `isAboveThreshold` evaluates to `true` and `ContentBelowThreshold` if `isAboveThreshold` evaluates to `false` (you will define these new components in the next step).

Update the `JoinTheDao` component in `tab-contents.tsx` as follows:

Now you have a component, `JoinTheDao` that conditionally renders one of two content types depending on the value of `isAboveThreshold` which you will tie to the value of the user's Passport later. You now need to define two components that define the content to render in each `isAboveThreshold` case.

Add the following to `tab-contents.tsx`:

At this point you have implemented conditional rendering of two components depending on the value of a Boolean whose value switches based on the user's Passport score. There are a few remaining steps to implement in `page.tsx` to connect up these content components with the user's Passport. First, you are passing `isAboveThreshold` as an argument to the `JoinTheDao` component, but it does not exist yet in your app.

In `page.tsx`, add another state variable below `setScore` as follows:

Now this state variable exists, you need to pass it to the `JoinTheDao` component. You can do this by updating the `<TabLayout>` tag in the UI code. The tag can be updated so that it looks as follows:

Now, back in `tab-contents.tsx`, update the `TabLayout` component definition so that it takes `isAboveThreshold` and propagates it into the `JoinTheDao` sub-component. The `TabLayout` definition should look as follows:

### Displaying the score

Almost there! One final thing - it would be helpful for the user to know their current score so they know how much more progress they need to make to get access to the gated content. To do this, you need to render the score from your app's state in the browser. In this example, you will only show the user their score if it is _below_ the threshold. This helps the user to determine how much they need to improve their score to access your gated content.

First, lets add the `score` as an argument to pass to `TabLayout` and propagate it from there into the `JoinTheDao` component and then from there into the `ContentBelowThreshold` component. Your `TabLayout` in `tab-contents.tsx` should look as follows:

Then you need to pass `score` to `JoinTheDao` so that the first line of the `JoinTheDao` definition looks as follows:

Then update the `ContentBelowThreshold` component so that it takes `score` as an argument. Then you can add some simple Typescript before the return statement that creates a default string that will be used to warn the user that they don't have a Passport yet _if_ the value of `score` is equal to its unset value. However, if `score` has had a value set, it warns the user that their score is not high enough, reporting the actual score in the text. Your final `ContentBelowThreshold` component should look as follows:

Finally, you need to pass the value of `score` to the `TabLayout` component in the UI. Back in `page,tsx`, update `<TabLayout ...>` as follows:

🎉🎉🎉 Congratulations! 🎉🎉🎉

You now have a fully functional app! Your user can enter the app, connect their wallet and Passport. If their Passport score is above a threshold, they can see some secret content that shows them how to join a special DAO. If their Passport score is below the threshold they are shown their score and instructed to go get more Stamps.

Time to test out your app - start the app using `npm run dev` and click to connect your wallet and Passport!

Here's what your user sees if their Passport score is greater than 20:

["The app giving access to secret content to users that pass your eligibility gate"](_building-with-passport_stamps_passport-api-v1_tutorials_public_app-success.png.md)

Here is what your user sees if their Passport Score is lower than 20:

![App failure screen](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fapp-failure.c795d6cd.png&w=3840&q=75)

### Summary

This tutorial walked you through building a basic Passport-gated application. You used Next.js to create a simple educational page about Web3 and DAOs, with a special section that invited users to join a secret Passport DAO - but only if their Passport score is above your threshold! By following this tutorial you learned:

*   How to create a Scorer instance and a Stamps API key
*   How to use instantiate a `provider` and call its API
*   How to connect a user's Ethereum wallet to your application and store their address in your app's state
*   How to submit a Passport to the Passport XYZ registry using the Stamps API
*   How to retrieve a user's Passport score using the Stamps API
*   How to use the score to conditionally render some content ("Passport gating")

### Further Reading

For more on Passport XYZ, you can keep browsing this website, or you can join the [Passport Developer Telegram (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh). Having completed this tutorial, a great next step would be to try our "Integrating Stamps and Scorers" tutorial where you can learn how to handle individual Stamp data as well as Passport scores.

[Tutorials (v1)](_building-with-passport_stamps_passport-api-v1_tutorials.md)[Integrating Stamps and Scorers](_building-with-passport_stamps_passport-api-v1_tutorials_integrating-stamps-and-scorers.md)

#### _building-with-passport_stamps_passport-api-v1_tutorials_integrating-stamps-and-scorers.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/passport-api-v1/tutorials/integrating-stamps-and-scorers
> Scraped: 1/9/2026, 1:31:56 PM

Passport XYZ can be used to automatically gate applications, but it can also be used as a powerful tool for supporting human decision makers by providing trust information in the app's UI. Instead of blocking access using a score threshold, Passport XYZ can display trust information about users connected to an app to other users, enabling better informed interactions.

## Why would you want a Scorer integration?

There are several apps designed for allocating funding within DAOs. A common model is to divide contributors into teams. The team is funded with a certain budget, and the funds are later distributed to the participants according to the number of reward tokens they are allocated. Individual team members come together to perform some task and later allocate tokens to each other to determine how the funds are released.

However, there have been examples of impersonators joining teams, pretending to be one of the legitimate contributors and getting allocated tokens. This is a way attackers can steal from honest participants. Without some additional information, it is hard to know that you are allocating tokens to a real contributor and not an impersonator.

A Passport XYZ Scorer integration is a solution to this problem. By showing the Passport score and Stamps for each user in the app, it is easier to identify the honest participant from their dishonest double. When faced with two instances of one contributor that you want to allocate tokens to, you might check to see which one has a certain community-specific Stamp in their Passport as evidence that they are the real team member.

Note, however, that it is possible for someone to be an impersonator and _also_ have a high Passport score. This is why a Scorer integration is more about giving additional evidence, or context, to choices than it is about automated, binary decision making.

You can find the code from this tutorial in this [GitHub repo (opens in a new tab)](https://github.com/passportxyz/passport-scorer/tree/main/examples/check-trusted-user-app):

Let's see how an integration like this is built using the Stamps API.

### Prerequisites

Before we delve into this, it's important to note that there are a few preliminary steps you need to complete. Please ensure that these prerequisites are met before proceeding with the guide.

1.  You have created a Passport Scorer and received a Scorer ID
2.  You have an API key

If you haven't completed the preliminary steps above please refer to our [getting access guide](_building-with-passport_stamps_passport-api-v1_getting-access.md) first. Once you're done with that, return here and continue with this walkthrough.

## Integrating a Scorer

### Setting up a basic app

We'll create an app using `Nextjs`. We can bootstrap using `create-next-app`. This automatically creates all the necessary subdirectories, configuration and boilerplate code required to get us building as quickly as possible.

Start by entering the following command into your terminal:

This will create a new directory called `passport-app` and populate it with several sub-directories and files that form the skeleton of our app. `create-next-app` will ask for yes/no responses to a series of configuration questions - answer as follows:

### Checking a Passport

In this tutorial you will learn how to create a more advanced Scorer integration that will determine whether connected users are trusted or untrusted according to a combination of their score and ownership of specific stamps.

The boilerplate code already provides buttons the users can click to connect their wallet and submit their Passport to the registry. We won't cover these functions again in this tutorial, so please note that a wallet connection and submitted Passport are required for calls to the Scorer API to return useful responses.

### **Retrieving a score**

We want to display a user's trust status in the app's UI. Their trust status will be determined by their Passport score and ownership of specific Stamps. The weights applied to each Stamp can be found in the [Passport Github (opens in a new tab)](https://github.com/passportxyz/passport-scorer/blob/main/api/scorer/settings/gitcoin_passport_weights.py).

The first step is to retrieve their Passport score by calling the `/registry/score/${SCORER_ID}/${address}` API endpoint.

The following function requests a user's Passport score from that endpoint. If no score exists it prints a warning to the console.

### **Retrieving Stamps**

### **Handling Stamp data**

There is a lot of information contained in the object returned from `/registry/stamps` - for most use-cases only a subset of the data is useful. We might, for example, only be interested in the Stamp `provider`, and not the granular details of the credential expiry, proof etc. We can parse this information out of each item in the array.

Let's just try to parse out the useful information first. We'll do this in a separate function, so let's replace our `console.log()` statement with a some simple code that parses out the `provider` for each of the user's stamps as a `string` and adds it to an `Array`. We'll print this array to the console to check we only have the `provider` strings.

Clicking the `Check Stamps` button will now display the following in the console:

Now, for our actual app we want to **return the array** to use elsewhere instead of just printing it to the console, so **replace** `console.log(stampProviderArray)` with `return stampProviderArray`.\*

### Tracking the Stamps and score in state

The two functions, `getPassportScore()` and `getPassportStamps()` return data that we want to keep track of in our app so that we can use it to make decisions about the trustworthiness of a user. This means we need a way to track this data in the app's state and functions that access that state to make some calculations.

We can start by wrapping the two functions in an outer `checkPassport()` function that calls both `getPassportScore()` and `getPassportStamps`:

Instead of creating lots of state variables for each user, we can define an interface that can hold all the relevant information we want to track about each user. Add the following interface to the boilerplate code outside of the `Passport()` component:

The `UserStruct` interface has fields for the user's address, score and Stamp providers as well as a unique identifier. Notice that we also defined the type of the `stampProviders` field to be an array of `Stamp` - this is a new struct we haven't defined yet. We need instances of `Stamp` to contain the name of each Stamp provider with a unique identifier. Add the following interface to the code just above the `UserStruct`:

In our `checkPassport()` function, we can pass the responses from `getPassportScore()` and `getPassportStamps()` into a new instance of `UserStruct`. We can then add each instance to a state variable array. First, add a state variable `userInfo` as an array that will take instances of `UserStruct`.

Now, we can update `checkPassport()` to create a new `UserStruct` from the values returned from the Stamps API calls, plus the user address and a unique ID calculated by adding 1 to the current length of the `userInfo` array. This new `UserStruct` is added to the `userInfo` array using the `setUserInfo` method.

Remember, before constructing the `UserStruct` we have to parse the Stamp providers into an array of `Stamps` that can be passed to the `UserStruct`'s `stampProviders` field.

We also want to add a condition to prevent repeatedly adding the same user to the `userInfo` array, so we can wrap the call to `setUserInfo` in a simple `if` statement to check whether the user already exists.

Now each user's Stamps and score are tracked in custom structs in our application's state.

### **Using the Stamp and score data**

Now we can use the state data to make decisions about each user. Maybe we just want a quick way to tell whether a connected user meets some specific requirements. Let's create a simple example where we display a list of connected addresses that are trusted because their Passport meets some requirements. This means the users of our app can see a real-time list of addresses that meet the eligibility criteria and can use this to help pick out the honest users.

Let's set some arbitrary requirements. If the user has a Lens Stamp **and** an ENS Stamp **and** a Github Stamp, **and** their Passport score is greater than 20, then they are considered trusted and their address is displayed in the browser.

So far, we have set up a state variable to collect all the connected users. We want a subset of those users that meet our eligibility requirements. We can achieve this by calling `filter` on the `userInfo` array. We'll filter on our trust criteria by checking the `stampProviders` and `score` fields of each `UserStruct` in `userInfo` and return the filtered array:

We can now keep track of this filtered array in our app's state too. Create a new state variable, `TrustedUsers`. Its type should be an array of `UserStruct`s.

Now we can update the app's state by passing `checkTrustedUsers()` to `setTrustedUsers()`.

**Don't** actually add this call to `setTrustedUsers()` to the app just yet - we'll include it inside another function in the next section.

### Displaying trusted users in the UI

For our demo app, we simply want to display the trusted users in the UI. In real world applications the user data might be used in more complex ways. For example, you might build in a small warning pop up when you call some function passing an address that does not appear in `TrustedUsers`.

Let's just add a button that will toggle displaying the trusted users on or off.

We'll create a small function that sets a `boolean` to control the display that will be part of the app's state.

Add the new state variable, initialized to `false`:

Now add `updateShowTrusted` that resets `TrustedUsers` and sets `ShowTrusted` to `true`. This is where we want to call the `setTrustedUsers()` function.

Now, we want to make sure all this logic is executed as soon as a user connects their wallet. The API calls, data handling, and state management is all handled by a single call to our `checkPassport()` function. So, to make this happen automatically on connection, we can simply invoke the `checkPassport()` function inside our `connect()` and `checkConnection()` functions.

The `connect()` and `checkConnection()` functions should end up as follows:

Now, in our UI, we can add a button that calls this function. This button can replace the `Check Stamps` button we created earlier.

Let's also add a way to show which specific Stamps the connected user owns. We might not always need to know this, so we'll hide it behind a checkbox - this way a user can see at a glance whether the user is trusted but also get more granular information if they need it.

We can start by defining a function, just like `updateShowTrusted` that acts like a boolean switch, but this time it will toggle displaying the connected user's Stamps.

And, again, we need to add a new state variable to track the state of this switch:

And add a checkbox to the UI that calls `updateShowStamp` when it is checked (you can add this after the `Button` elements inside the`<Stack> </Stack>` tags):

The final step is to update the UI code so that the data is actually displayed when the appropriate buttons and checkbox are activated.

Immediately below the block of UI code wrapped in `Stack` tags, we can add the following `div` element:

This element contains two conditional rendering statements. They check whether `showTrusted` is `true` and if so, they render a title and the contents of `trustedUsers` (our filtered list of users that pass the trust criteria) to the browser.

Immediately after that `div` element, we can add the following code which displays the user's Stamps if the `Show Stamps` checkbox is activated:

Now, if you run your app locally using `npm run dev` you will be able to connect your wallet, submit your Passport and check whether you pass the trust criteria. If you do, your address will be rendered to the screen. If you check the `Show Stamps` box, all your Stamps will be shown in the browser.

![]()public/trusted-user-app.png)

### Multiple users

Now we've seen our app work properly for our own wallet, we can check that it works for multiple users. To keep it simple, we will do this by populating our `userInfo` state variable with some dummy user data. This simulates the situation where multiple users have connected to the app.

Adding some data to the definition of `userInfo` as follows:

Now when the app starts, it will instantiate the `userInfo` state variable with these dummy users already inside. When we connect, our address will be added to the array. There are two addresses in the `userInfo` defined in the snippet above that will pass the default trust criteria.

We can do a quick sanity check and run the app and click `Check Users` - we will see those two addresses listed.

With our current rendering logic, the `Show Stamps` checkbox will list all the Stamps from all the users in one large list - we won't actually be able to tell who has which Stamp. To solve this, we can simply add the first few characters of each user address to each Stamp so we can map Stamps to owners. To do this, replace the final lines (where we define a `SimpleGrid` element) in the UI code with the following:

Now, when we follow through our connect -> submit -> check users -> show Stamps flow, we will see something like the following:

![Trusted user app part 2](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ftrusted-user-app-2.af1f06dd.png&w=3840&q=75)

## Summary

We have built a simple app that allows users to connect their wallets and trusted addresses that meet the score and Stamp criteria are displayed in the browser!

Of course the app we created here has the bare minimum functionality required to demonstrate score and Stamp management, but the concepts explained here can be used to create more complex apps that use the Stamp and score criteria to support human decision making or more complex automated processes.

[Protecting access with Passport scores](_building-with-passport_stamps_passport-api-v1_tutorials_gating-access-with-passport-scores.md)[Working with Stamp metadata](_building-with-passport_stamps_passport-api-v1_tutorials_working-with-stamp-metadata.md)

#### _building-with-passport_stamps_passport-api-v1_tutorials_requiring-a-passport-score-for-airdrop-claim.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/passport-api-v1/tutorials/requiring-a-passport-score-for-airdrop-claim
> Scraped: 1/9/2026, 1:31:59 PM

## Requiring a Passport score for airdrop claim

Airdrops are a prevalent token distribution method, attracting 'airdrop farmers' who generate numerous accounts to amass tokens. This guide demonstrates using Passport scores to shield your airdrop from such harmful practices.

This guide will cover the following topics:

*   Fetching Passport scores from the Stamps API
*   Using Passport scores to regulate access to an airdrop

You can find the code from this tutorial in this [GitHub repo (opens in a new tab)](https://github.com/passportxyz/passport-scorer/tree/main/examples/airdrop):

You can also check out a [working version of this app (opens in a new tab)](https://airdrop-five.vercel.app/).

### Prerequisites

Before we delve into this, it's important to note that there are a few preliminary steps you need to complete. Please ensure that these prerequisites are met before proceeding with the guide.

1.  You have created a Passport Scorer and received a Scorer ID
2.  You have an API key

If you haven't completed the preliminary steps above please refer to our [getting access guide](_building-with-passport_stamps_passport-api-v1_getting-access.md) first. Once you're done with that, return here and continue with this walkthrough.

### App Overview

We will be rebuilding many of the components and API endpoints of the [airdrop example app (opens in a new tab)](https://github.com/passportxyz/passport-scorer/tree/main/examples/airdrop).

Below is a diagram showing a high-level overview of how the app functions and interacts with the Stamps API.

![Passport airdrop](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FPassport%20Airdrop.cc6a2f60.png&w=3840&q=75)

The basic flow is as follows:

1.  Define eligibility criteria for the airdrop, such as app interaction, Discord membership, or holding a specific token quantity. This serves as the main criteria for receiving the airdrop while a Passport score serves as an additional security measure.
2.  Retrieve the user's Passport score.
3.  Confirm the score exceeds a threshold indicative of legitimate user behavior.
4.  Add the user's address into the airdrop database.

Now that we understand what we will be building let's jump into some code.

We will be building everything within the context of a [Next.js (opens in a new tab)](https://nextjs.org/) app. We will also use [RainbowKit (opens in a new tab)](https://www.rainbowkit.com/docs/installation) and [wagmi (opens in a new tab)](https://wagmi.sh/) for wallet connection and blockchain helper methods.

You can run one of the following commands to initialize a Next.js app with RainbowKit and wagmi preinstalled.

Create a `.env.local` file at the root of your directory and add your API key and Scorer ID to it. Make sure the env variable for your Scorer ID is `NEXT_PUBLIC_SCORER_ID`; this will ensure the variable is accessible to the frontend.

Now that we have our app scaffolded let's start building out the basic front-end and backend components we will need.

### 1\. Fetch and sign a message and nonce

Passport allows a message and nonce to be submitted when scoring a Passport. This allows us to request permission from the user and send their approval along with our score request.

We set up an API endpoint that our front-end can make requests to. We do this so we can keep our `SCORER_API_KEY` from being exposed.

### 2\. Submit a user's address for scoring

Before we can fetch a user's Passport score we must submit their address for scoring.

We again set up an API endpoint that our front end can make requests to. We do this so we can keep our `SCORER_API_KEY` from being exposed.

Now that we have a secure endpoint set up, we can make a request to it from our front-end. We do this right after we verify the signed message in the same `onSuccess` function from step 1.

We are now ready to fetch the user's Passport score.

### 3\. Fetch a user's Passport score

Now that we've submitted the user's Passport for scoring we can poll for their score. Once again we will create an endpoint for our front-end to query to avoid exposing our `SCORER_API_KEY`.

We now have a secure endpoint for our front-end to query. We make the request to it inside the same `onSuccess` method.

We've completed the first three steps and have a user's Passport score. We now need to use this score to determine if they are an airdrop farmer or a legitimate user.

### 4\. Ensure the user's score is above the threshold

We want to ensure that our user's Unique Humanity score is greater than 20. This gives us the best chance of filtering out airdrop farmers while still allowing legitimate users to claim their tokens.

Leveraging Passport makes this process straightforward. We simply verify that the user's score surpasses the threshold of 20, if it does, they are permitted to claim the airdrop.

### 5\. Allow the user to claim their airdrop

This can be handled in a number of ways.

1.  We can add the user's address and score to a database, then after we've collected all the addresses, we can calculate the Merkle root which we set in our airdrop distribution contract.
2.  We can allow the user to directly claim their tokens once we have verified they have met the minimum criteria and their Passport score is above our threshold. This would require us to distribute a unique signature for each user that allows them to call the `claim` function on our airdrop contract.

We will be using the first method.

All we need to do now is store the user's address and score in our database. We can use whatever database we want, SQLite, Postgres, MongoDB, etc.

Once we have our list of addresses that have met the minimum criteria for eligibility, we calculate the Merkle root of that list.

Now we can set this root on our Merkle Distributor smart contract and eligible users can claim their token distributions.

#### Conclusion

In this guide we've done the following:

1.  Submitted a user's address to the Stamps API for scoring
2.  Fetched their Passport score
3.  Used their score to determine if they are eligible for the airdrop
4.  Stored this information for later use in a Merkle distributor or other airdrop distribution method

Adding Passport protection to your airdrop serves as a last line of defense against airdrop farmers and helps real users receive the most benefit while punishing bad actors.

[Working with Stamp metadata](_building-with-passport_stamps_passport-api-v1_tutorials_working-with-stamp-metadata.md)[Custom client-side Passport scoring](_building-with-passport_stamps_passport-api-v1_tutorials_client-side-scoring.md)

#### _building-with-passport_stamps_passport-api-v1_tutorials_working-with-stamp-metadata.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/passport-api-v1/tutorials/working-with-stamp-metadata
> Scraped: 1/9/2026, 1:31:59 PM

![Stamp logo examples](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fstamp-logo-examples.9e636519.png&w=2048&q=75)

Passport XYZ Stamps show that a user has achieved certain milestones on-chain or through some web2 service. It is common for these Stamps to be used to generate a score on the Passport server to indicate a user's trustworthiness. It is also possible to retrieve the actual Stamps instead of the score. This enables developers to use their own algorithms to generate scores, or to make decisions based on ownership of specific Stamps or groups of Stamps.

In many cases app developers can serve their users better with additional information about the Stamps outside of just the verifiable credential and Stamp name. A simple example is access to a standardized icon image so that the Stamp can be displayed consistently across many applications.

For this reason, there are two ways to access Stamp metadata using the [Stamps API](_building-with-passport_stamps_passport-api-v1_tutorials_working-with-stamp-metadata.md#api-endpoints).

### Prerequisites

Before we delve into this, it's important to note that there are a few preliminary steps you need to complete. Please ensure that these prerequisites are met before proceeding with the guide.

1.  You have created a Passport Scorer and received a Scorer ID
2.  You have an API key

If you haven't completed the preliminary steps above please refer to our [getting access guide](_building-with-passport_stamps_passport-api-v1_getting-access.md) first. Once you're done with that, return here and continue with this walkthrough.

### API endpoints

There are two API endpoints that can be used to query Stamp metadata.

If you want to see the metadata for **all** available Stamps (the full set of possible Stamps, not only those that a user actually owns) you can use:

You can also retrieve the Stamps owned by a particular address and instruct the API to return the metadata for each Stamp along with the Stamps themselves. To do this, use:

You can test this out using an HTTP tool such as curl. You will need to replace `{your-api-key}` with your API key in the request header, as well as `{your-address}` with your wallet address in order to access these endpoints.

### Metadata structure

The metadata for every Stamp follows this basic format:

The `/registry/stamp_metadata` endpoint simply returns an array of these metadata objects.

For the `/registry/stamps/{address}?_include_metadata=true` endpoint, these metadata objects are bundled into the credential data object. For an individual Stamp, the complete data object looks as follows:

When you use this Stamp object in your app, you will extract only the data you actually need.

### Setting up a basic app

We'll create an app using [Nextjs (opens in a new tab)](http://nextjs.org/). We can bootstrap using `create-next-app`. This automatically creates all the necessary subdirectories, configuration and boilerplate code required to get us building as quickly as possible.

Start by entering the following command into your terminal:

This will create a new directory called `passport-app` and populate it with several sub-directories and files that form the skeleton of our app. `create-next-app` will ask for yes/no responses to a series of configuration questions - answer as follows:

### Retrieving Stamps

First of all, you can define an `interface` type that you will use to organize the useful Stamp data that you will use in your app. Paste the following type definition immediately after the definition of `headers`, above where you define the `Passport()` function.

This `Stamp` type had fields for the Stamp `id` (a unique number used to make arrays of this type iterable), a `name` which corresponds to the specific credential the Stamp relates to (not the provider, who can issue many credentials), and an `icon` which is a URL linking to an image to be used to represent the Stamp provider.

### Using the Stamp metadata

At this point your code is able to connect a wallet and retrieve Stamp data for the connected user. However, your app is not _doing anything_ with the data other than holding it in state. So, in this section you will write some code for displaying the Stamp data in a "Stamp collection" that the user can browse.

Start with the simplest part - adding a simple Boolean state variable to toggle displaying the Stamps on and off. Paste the following beneath your `stampArray` state variable:

We can use this state variable to ensure that nothing is displayed until the user clicks `Show Stamps` and adds Stamp data from the Stamps API to the app's state. Add a call to `setShowStamps(true)` to `getStamps()` immediately below `setStampArray`, above the `return` statement.

Now, you an create a component that renders the Stamp data in an aesthetic way. The code snippet below uses a combination of Chakra-UI's `SimpleGrid` and `Image` components to display the icon for each Stamp. The way this is done is using `map` to create an instance of the `Image` component for each Stamp in `stampArray`, passing the URL from the Stamp's `icon` field as the image source. You can also add a fallback image that can be displayed in case a particular image fails to load.

There is one annoyance with this component: there is only one unique icon for each stamp _provider_, not every individual Stamp. This means that providers with multiple stamps will be represented by multiple instances of the same image, with no way to tell them apart.

To fix this, you can wrap the new `Image` component in an outer `Tooltip` component which you import from Chakra-UI. This will allow the user to hover their cursor over the Stamps to see the Stamp name in a small text box beneath the image. The text to display comes from the Stamp's `name` field which was retrieved from the API.

The final component should look as follows, and you can paste it into the `Passport()` app immediately above the definition of `styles`.

The final thing to add is a call to `StampCollection` in the app's UI. You can add the following to `page.tsx` immediately before the closing tag for `ChakraProvider`.

This renders the `StampCollection` component when `ShowStamps` evaluates to `true`.

### Run the app

You can now run the app and check that it works as expected. To do this, navigate to your project folder and run the following:

The app will start and you can access in your browser at `http://localhost:3000`.

When you connect your app and click `Show Stamps` your app will look as follows (assuming you actually have some Stamps associated with your address). The tooltip feature is demonstrated for a Github stamp.

![Stamp collector app showing stamps](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fstamp-collector-app-showing-stamps.c5e46453.png&w=3840&q=75)

### Summary

This walk-through guide demonstrated how to retrieve and handle Stamp metadata. You learned how to build a simple app that displays Stamp data to the browser, making use of information in the metadata. Now you understand the basics, you can incorporate Stamp metadata into your own apps!

[Integrating Stamps and Scorers](_building-with-passport_stamps_passport-api-v1_tutorials_integrating-stamps-and-scorers.md)[Requiring a Passport score for airdrop claim](_building-with-passport_stamps_passport-api-v1_tutorials_requiring-a-passport-score-for-airdrop-claim.md)

#### _building-with-passport_stamps_passport-api_api-reference.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/passport-api/api-reference
> Scraped: 1/9/2026, 1:31:56 PM

The Stamps API enables developers to retrieve Human Passport scores and Stamp metadata for users who have created a Passport.

You can also experiment with the Stamps API using our [API playground tool (opens in a new tab)](https://api.passport.xyz/v2/docs) and adding your API keys via the 'Authorize' button.

In the examples below, replace the following placeholder values with your actual data:

*   `{scorer_id}` - Your Scorer ID from the developer portal
*   `{address}` - The Ethereum address you want to score
*   `{API_key}` - Your API key from the developer portal

## Authentication

To access the Stamps API, you will need a [Scorer ID and an API key](_building-with-passport_stamps_passport-api_getting-access.md).

To make a successful request, you will need to include your API key in the "Authorization" header of each API request. The header should have the following format:

Replace `{API_key}` with your API key. For example, if you were using cURL, your request might look something like this:

## Rate limits

Your API key will allow you to make up to a certain number of requests to any of the endpoints included on this page during a certain period of time.

Requests made to the Stamps API v1 and v2 count towards the same rate limit.

Access starts with Tier 1. If you need an elevation, please [request higher rate limits (opens in a new tab)](https://docs.google.com/forms/d/e/1FAIpQLSeUATg0nTE9ws3qESGBktFcOX0brF19iv2L0BLoiub9pbSMeg/viewform).

## Key concepts

There are several key concepts you should be aware of when using the Stamps API:

*   **Timeouts:** The Stamps API endpoints have a timeout of 60 seconds. This means that if a request to one of these endpoints does not receive a response within 60 seconds, the request will be aborted. If your request times out, you should set up retry logic by calling the API again after a short delay, typically increasing the delay for each subsequent retry.
*   **Pagination:** Some requests return a large amount of data. To effectively retrieve this data, you will need to paginate the response. For more information, see [API pagination](_building-with-passport_stamps_major-concepts_api-pagination.md).
*   **Data dictionary:** For definitions of the data types used in Stamps API v2, see the [Data dictionary](_building-with-passport_stamps_major-concepts_data-dictionary.md) page.

## Available endpoints

Stamps API v2 base URL: [https://api.passport.xyz (opens in a new tab)](https://api.passport.xyz/)

### Retrieve latest score for a single address

This is the primary endpoint that integrators should use.

This endpoint will return the latest score and Stamp data for a single address.

> GET /v2/stamps/{scorer\_id}/score/{address}

Learn more about the [data dictionary](_building-with-passport_stamps_major-concepts_data-dictionary.md).

### Retrieve historical score for a single address

This endpoint will return the last requested historical score and Stamp data for a single address before a specified time.

For example, if you requested a score on 2024-12-01 using the `GET /v2/stamps/{scorer_id}/score/{address}` endpoint, then use this historical score endpoint to request the score for the same address on 2024-12-05, you will receive the score and Stamp data for 2024-12-01 for that address. If you have not requested a score for a specified address using the `GET /v2/stamps/{scorer_id}/score/{address}` endpoint, you will not be able to receive a historical score for that address.

> GET /v2/stamps/{scorer\_id}/score/{address}/history

#### Query parameters

### Retrieve Stamps verified by a single address

Use this endpoint to request all Stamps that have been verified by the specified Ethereum address.

If you would like to retrieve the metadata for all available Stamps, please use the [Get Stamps metadata](_building-with-passport_stamps_passport-api_api-reference.md#retrieve-all-stamps-available-in-passport) endpoint.

> GET /v2/stamps/{address}

#### Query parameters

### Retrieve all Stamps available in Passport

Use this endpoint to request all Stamps available on Passport.

If you would like to retrieve just the Stamps that are connected to a specified Ethereum address, please use the [Get Stamps](_building-with-passport_stamps_passport-api_api-reference.md#retrieve-stamps-verified-by-a-single-address) endpoint.

> GET /v2/stamps/metadata

* * *

If you have questions about the API, please reach out to us in our [developer support channel (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh).

[Quick start](_building-with-passport_stamps_passport-api_quick-start-guide.md)[Data dictionary](_building-with-passport_stamps_passport-api_data-dictionary.md)

#### _building-with-passport_stamps_passport-api_migrate.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/passport-api/migrate
> Scraped: 1/9/2026, 1:31:56 PM

Migrating to Stamps API V2 is designed to be straightforward. This guide outlines the key changes and provides step-by-step instructions to help you update your integration smoothly.

But first, why should you migrate?

*   Retrieve user scores with a single, intuitive GET request.
*   Utilize new endpoints to access historical scores and Stamp data.
*   Gain access to more data to proactively prevent and resolve misunderstandings.
*   Retrieve both binary and numeric scores within the same payload
*   Benefit from a more unified API endpoint URI structure.

If you'd prefer to learn by doing, please visit our [API playground (opens in a new tab)](https://api.passport.xyz/v2/docs) to see the changes in action. If you'd prefer to learn via our reference docs, please visit our [API reference](_building-with-passport_stamps_passport-api_api-reference.md).

## Key changes to address

1.  [The base URL](_building-with-passport_stamps_passport-api_migrate.md#the-base-url)
2.  [Simplified score retrieval](_building-with-passport_stamps_passport-api_migrate.md#simplified-score-retrieval)
3.  [Updated endpoint URIs](_building-with-passport_stamps_passport-api_migrate.md#updated-endpoint-uris)
4.  [Accessing historical data](_building-with-passport_stamps_passport-api_migrate.md#accessing-historical-data)
5.  [Unified Scorer types](_building-with-passport_stamps_passport-api_migrate.md#unified-scorer-types)
6.  [Additional Stamp data in score payload](_building-with-passport_stamps_passport-api_migrate.md#additional-stamp-data-in-score-payload)

## The base URL

In August 2024, the Passport workstream spun out of Gitcoin, creating Passport XYZ.

We have been working on separating our infrastructure from Gitcoin, and the API base URL is finally getting its update.

*   Previous Base URL: [https://api.passport.gitcoin.co (opens in a new tab)](https://api.passport.gitcoin.co/)
*   New Base URL: [https://api.passport.xyz (opens in a new tab)](https://api.passport.xyz/)

**Action Required:** Update all instances of the base URL in your application to the new URL.

## Simplified score retrieval

### Background

In V1, retrieving a user's score involved:

*   Submitting the Passport for scoring using a POST request.
*   Retrieving the score using a GET request.

This process was counterintuitive and could lead to confusion and stale scores if only the GET endpoint was used.

### What's new in v2

*   **Single GET Request:** Retrieve the latest score and Stamp data with one GET request.
*   **No POST Required:** Eliminates the need to submit the Passport for scoring.

### Endpoint changes

*   **From V1:** `POST /registry/submit-passport`
*   **To V2:** `GET /v2/stamps/{scorer_id}/score/{address}`

**Action Required:** Replace any `POST /registry/submit-passport` requests with GET requests to the new endpoint.

## Updated endpoint URIs

We've adopted a more consistent, object-oriented design for our API endpoints.

### Endpoint mapping

## Accessing historical data

### New Feature in V2

*   **Endpoint:** GET /v2/stamps/{scorer\_id}/score/{address}/history
*   **Functionality:** Retrieve a user's score and Stamp data from a specific date and time.

Note: Access to this endpoint requires your API key to be allowlisted.

**Action Required for use:**   **Request Access:** Fill out the [access request form (opens in a new tab)](https://forms.gle/4GyicBfhtHW29eEu8) to have your API key allowlisted.
*   **Update Implementation:** Incorporate the new endpoint into your application if you need historical data.

## Unified Scorer types

### Background

In V1, you had to choose between two Scorer types:

*   Unique Humanity
*   Unique Humanity: Binary

This differentiation added complexity and could lead to confusion.

### What's New in V2

*   **Unified Scoring:** Both numeric and binary scores are included in all payloads.
*   **Simplified Choices:** No need to choose a Scorer type; you can use the score that best fits your application.

### Example v2 Payload

**Action Required:** Adjust your application's logic to handle the new payload structure and use the appropriate score type.

## Additional Stamp data in score payload

### Deduplication field

To prevent multiple Passports from verifying the same credential (enhancing security against Sybil attacks), Stamps are [deduplicated](_building-with-passport_stamps_major-concepts_deduplicating-stamps.md) across addresses.

*   **New Field:** `dedup`
*   **Purpose:** Indicates whether a Stamp has been deduplicated and thus does not contribute to the score.

#### Example

In the above example, you'll notice that the Discord Stamp is [deduplicated](_building-with-passport_stamps_major-concepts_deduplicating-stamps.md), meaning another address has also verified this same credential. As a result, the user received a 0 score for that Stamp. You will also note that a different expiration date returns when `dedup=true`. This date represents when the credential verified by the other address will expire, rather than when this credential will expire.

You will also see that the ENS Stamp was not deduplicated, meaning the 0.408 score was included in the user's overall unique humanity score.

**Action Required:**   **Handle Deduplication:** Update your application to interpret the dedup field and inform users if their Stamps are affected.
*   **User Communication:** Consider displaying warnings to users about deduplicated Stamps.

### Stamp expiration date

*   **New Field:** `expiration_date` for each credential.
*   **Purpose:** Indicates when each specific Stamp will expire.

**Action required:**   **Monitor Expirations:** Use the `expiration_date` to notify users about upcoming Stamp expirations.
*   **Update Logic:** Ensure your application considers Stamp expiration dates in its functionality.

## Next Steps Checklist

1.  Update Base URL to [https://api.passport.xyz (opens in a new tab)](https://api.passport.xyz/).
2.  Modify all API endpoint URIs to the new V2 structure.
3.  Replace POST requests with GET requests for score retrieval.
4.  Update your data models and logic to accommodate new fields (`passing_score`, `dedup`, `expiration_date`).
5.  If needed, submit the access request form for the historical endpoint and build it into your integration.
6.  Thoroughly test your application to ensure all changes work as expected.

If you have questions or need support, you can chat with us on our [developer support channel on Telegram (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh).

[Status and error codes](_building-with-passport_stamps_passport-api_status-and-error-codes.md)[Introduction](_building-with-passport_stamps_passport-api-v1_introduction.md)

#### _building-with-passport_stamps_passport-api_quick-start-guide.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/passport-api/quick-start-guide
> Scraped: 1/9/2026, 1:31:55 PM

This page will help you make your first API request using the Stamps API v2.

You can also experiment with the Stamps API using our [API playground tool (opens in a new tab)](https://api.passport.xyz/v2/docs) and adding your API keys via the 'Authorize' button.

## API basics

Please make sure you have an [API key and Scorer ID](_building-with-passport_stamps_passport-api_getting-access.md) before working through this guide.

The base URL for the API methods we'll be using is `https://api.passport.xyz`. There are several API endpoints that can be accessed by extending this base URL.

You can browse more specific API details in the [API reference](_building-with-passport_stamps_passport-api_api-reference.md).

## How to retrieve a score

There is one basic step to retrieve a user's Passport score and Stamp data. All you have to do is make a request to the following GET endpoint:

This endpoint requires a `scorer_id` and an `address` to be passed as path parameters. You can see an example of this in the following cURL request, using a scorer ID, `100`; an address, `0x2C1E111d7C3adc823B5fA3af3f07EB62831C3c5`; and a placeholder (`{your-api-key}`) that you need to replace with your API key:

An example response might look as follows:

This response indicates that the address was successfully able to prove their humanity with Passport since their score is above the recommended threshold of 20.

It's worthwhile to note that you can manually set your own [score threshold](_building-with-passport_stamps_major-concepts_scoring-thresholds.md) within your code base based on your ecosystem's unique needs, but a score threshold of 20 is recommended for optimal results.

### Next Steps

* [Review the API Reference to learn more about the available endpoints](_building-with-passport_stamps_passport-api_api-reference.md)
* [Get support via our Telegram channel (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh)

[Getting access](_building-with-passport_stamps_passport-api_getting-access.md)[API reference](_building-with-passport_stamps_passport-api_api-reference.md)

#### _building-with-passport_stamps_smart-contracts_integrating-onchain-stamp-data.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/smart-contracts/integrating-onchain-stamp-data
> Scraped: 1/9/2026, 1:31:59 PM

In this tutorial, you'll learn how to show different content to users depending on their Passport data. Here, the Stamp data will be retrieved from the blockchain.

Specifically, you will:

*   Fetch user Stamp data from the blockchain using the Human Passport smart contract stack
*   Use Stamp data to generate your own Passport score, using Passport's Stamp weights.
*   Conditionally display a user's Passport data depending on their onchain data.
*   Redirect users to instructions for improving their Passport scores and getting their Stamps onchain.

You can learn more about Passport's available smart contracts and the typical developer flow via our [contract reference page](_building-with-passport_stamps_contract-reference.md).

### Prerequisites

To follow this tutorial, you'll need [Next.js (opens in a new tab)](https://nextjs.org/), [Node (opens in a new tab)](https://nodejs.org/en), and [Chakra-UI (opens in a new tab)](https://chakra-ui.com/) installed on your machine. You will be using the Optimism Sepolia test network - you will need to import this network into your wallet. Some familiarity with smart contracts is recommended.

This app uses a blockchain, rather than Passport's database server, as a backend. This means you **do not need an API key or Scorer ID,** but you do need to have a browser wallet that can connect to the Optimism Sepolia test network.

### App outline

The app we will build will be a webpage where users can connect their wallet to check their onchain credentials.

You can find the code from this tutorial in this [GitHub repo (opens in a new tab)](https://github.com/passportxyz/passport-scorer/tree/main/examples/onchain-stamps-app).

The app will work as follows:

*   When the user visits the sample app, they have access to several tabs - one to welcome them and then more where they can check their onchain data. The second tab shows whether there is any onchain data for the connected user. The third shows what Stamps the user has. The final tab shows the user's Passport score.
*   The user will connect their wallet and Human Passport to the app. Their Stamp data and Passport score will be retrieved from the blockchain and displayed in the UI.
*   If the user does not have any Stamps, the tabs contain information about how to create a Passport, add Stamps and migrate them onchain.

This simple example demonstrates the principles you would use to gate a real app using Human Passport onchain.

### Smart contract logic

The Human Passport smart contracts build on top of [EAS (Ethereum Attestation Service) (opens in a new tab)](https://attest.sh/), using Attestations as the foundational building blocks. You can read the [contract reference](_building-with-passport_stamps_contract-reference.md) page for a primer on how the contracts work.

The `decoder` contract exposes an API that allows you to simply pass in an address and retrieve the decoded Stamp and score data, rather than having to retrieve raw `Attestations` and decode client-side.

### Setting up the app

We'll create an app using [Next.js (opens in a new tab)](https://nextjs.org/). We can bootstrap using `create-next-app`. This automatically creates all the necessary subdirectories, configuration and boilerplate code required to get us building as quickly as possible.

Start by entering the following command into your terminal:

This will create a new directory called `passport-app` and populate it with several sub-directories and files that form the skeleton of our app. `create-next-app` will ask for yes/no responses to a series of configuration questions - answer as follows:

### Building the App

Now that the app is set up, you can begin building. The code that controls what is rendered in the browser is contained in `src/app/page.tsx`. When you created your project, `create-next-app` saved a version of `page.tsx` with some default code. You can delete all the code in `page.tsx` and replace it with this boilerplate:

**Note** that you can swap out the contract addresses if you want to run an app on a different network. You can check all the deployed contract addresses on the [contract reference page](_building-with-passport_stamps_contract-reference.md)

There are some parts of this boilerplate code that might look unfamiliar even if you have been through the other [tutorials](_building-with-passport_tutorials.md) on this site. This is because there is some specific setup required to use smart contracts on the backend.

First, the `provider` field is being assigned as a global variable. The `provider` is a connection to the blockchain. In this app, the connection is made by inheriting network configuration from your wallet. If you are using Metamask with default settings, your connection will be via Infura to whichever network your wallet is connected to. If you have a wallet pointing to your own node's RPC provider, it will use that. The reason `provider` is assigned to a global variable is so that it can be captured during the wallet connection but later it can be passed as an argument when you create instances of the smart contracts.

The `chainID` for the network you are connected to is requested from the `provider` too and the value is stored in the app's state. This is used in the UI to warn the user if they are connected to a network other than Optimism Sepolia. There are two statuses presented in the UI - one that confirms that the user is connected and one that either confirms the wallet is connected to Optimism Sepolia or warns the user they are connected to the wrong network.

Second, there are two contract addresses defined immediately below the import statements:

The `decoderContractAddress` is the address on the Optimism Sepolia blockchain where the `decoder` contract is stored. The data in `abis.ts` is a formatted set of function signatures that allow the contract bytecode to be decoded and instantiated in your app (an ABI - Application Binary Interface).

The elements imported from `tab-contents` are components used to build the UI. This file should also be located in the `src/app` folder, called `tab-contents.tsx`, and should be populated with the code located in [this GitHub file (opens in a new tab)](https://github.com/passportxyz/passport-scorer/blob/main/examples/onchain-stamps-app/src/app/tab-contents.tsx).

Otherwise, the `create-next-app` boilerplate code is quite standard. There is a `connect()` function that instantiates the `provider` by grabbing network configuration from your browser wallet (make sure you are connected to Optimism Sepolia) and a `checkConnection()` function wrapped in `useEffect` that automatically triggers a connection when the page is first loaded.

### Getting Passport data

Getting Passport data requires instantiating the `decoder` contract and calling its `getPassport` function. The `ethers` library provides everything we need to instantiate the contract. Create a contract using `new ethers.Contract()` passing the contract address, ABI and the provider object as arguments. One complication is that the ABI is divided up into sections specific to each chain where the contract has been deployed, so you actually need to pass a specifier with the hex-encoded chain ID too. Here are the hex-encoded chain IDs for each chain:

*   Arbitrum: `0xa4b1`
*   BaseGoerli: `0x1a433`
*   Ethereum: `0x1`
*   Linea: `0xe704`
*   Optimism: `0x1a4`
*   Optimism Sepolia: `0xaa37dc`
*   Scroll: `0x82750`
*   Scroll Sepolia: `0x8274f`
*   ZkSync: `0x144`
*   ZkSync Sepolia: `0x12c`

Once the contract instance exists, you can simply call `getPassport` passing in the user address, which is stored in your app's state. If the function call returns some Stamp data, you can set the `hasStampData` flag to `true` and return the data.

### Extracting Stamps

The next step is to write a function to extract the Stamp names from `passportData` into an array. The following code snippet contains that function - you can paste it into your app:

### Retrieving a score

Passport scores are calculated by summing weights assigned to each specific Stamp. Passport has defined a list of Stamp weights that are used when scoring is done by the smart contract. The contract exposes a public function, `getScore()` that returns the Passport score for a given user. You can call the function in the same way as for `getPassportInfo()`.

Now you have implemented all the logic required to retrieve and decode onchain Stamps and calculate a score in your app!

### Executing the functions

Now you have all your app functions defined, you need to determine when and how they are executed. You can write a simple wrapper function that calls `getPassportInfo()` and `getScore()` and uses the returned values to update the appropriate state variables.

Now, all you have to do is call `queryPassport()` to execute all the necessary logic to retrieve `stamps` and `score`.

### Stamps and scores in the UI

The boilerplate code includes a basic UI that pulls in components from `tab-contents.tsx`. This will render five tabs to the webpage, each containing different information. This component can take your `stamp` and `score` data and render differently depending on their values. This is already handled in the boilerplate UI. What is not yet implemented is a way to trigger the `queryPassport()` function. You can add a button for this. Right below the existing `Button` component, inside the `Flex` tags, you can add the following:

You can browse the contents of `tab-contents.tsx` to see how the `stamp` and `score` data is used to render content. Conceptually, this is what's happening in each tab:

*   **Home**: a general introduction that renders identically for any user
*   **About onchain Stamps**: Information about onchain Stamps that renders identically for any user
*   **Are your Stamps onchain?**: If the user has onchain Stamps, has connected their wallet and queried their Passport, the app will render a congratulatory message and confirm that they have onchain Stamps. If the user has _not_ queried their Passport or they don't have any onchain Stamps they see some sad emojis and a message informing them that they have either forgotten to connect or they don't have any onchain Stamps. They are directed to the Passport app to migrate their Stamps.
*   **Browse your Stamps**: If the user has onchain Stamps, has connected their wallet and queried their Passport, the app will render each Stamp in the browser. If the user has _not_ queried their Passport or they don't have any onchain Stamps they see some sad emojis and a message informing them that they have either forgotten to connect or they don't have any onchain Stamps. They are directed to the Passport app to migrate their Stamps.
*   **See your score**: If the user has onchain Stamps, has connected their wallet and queried their Passport, the app will render their Passport score. If the user has _not_ queried their Passport or they don't have any onchain Stamps they see some sad emojis and a message informing them that they have either forgotten to connect or they don't have any onchain Stamps. They are directed to the Passport app to migrate their Stamps.

### Run the app

Well done - your app is ready to use! You can run it locally using

`npm run dev`

You can navigate to `localhost:3000` to try it out!

The app looks as follows:

![Onchain stamp explorer 1](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fonchain-stamp-explorer-1.90917dc8.png&w=3840&q=75)

![Onchain stamp explorer 2](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fonchain-stamp-explorer-2.977817c3.png&w=3840&q=75)

![Onchain stamp explorer 3](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fonchain-stamp-explorer-3.fc846470.png&w=3840&q=75)

### Summary

Congratulations - you have built an app that retrieves user Stamp data from the blockchain, calculates a Passport score and uses that information to conditionally render content to your webpage.

Now you can use the principle demonstrated here to build creatively and integrate onchain Stamps into

[Quick start](_building-with-passport_stamps_smart-contracts_quick-start-guide.md)[Attestation schema](_building-with-passport_stamps_smart-contracts_attestation-schema.md)

#### _building-with-passport_stamps_smart-contracts_onchain-expirations.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/smart-contracts/onchain-expirations
> Scraped: 1/9/2026, 1:31:58 PM

## Onchain expirations

Passport Stamps do not stay valid forever. There is an expiration date after which a Stamp must be reverified in order to keep it valid. This is true for onchain and offchain Stamps.

## Passport attestations

For Passport attestations, there is a key in the schema called `Expiration Dates`. The value associated with this key is an array of hex-encoded dates, each corresponding to a specific Stamp. There is also an equivalent key, `IssuanceDate` whose values encode the date when a particular Stamp was verified.

New attestations can be issued with updated `IssuanceDate` and `expirationDate` values through the Passport app.

Here's an example of a [Passport attestation (opens in a new tab)](https://optimism.easscan.org/attestation/view/0x6eefab4afe1610e21c8d7e7cd1d4f4d70fd753fc2bfe6b04ad4bd01dec86c81a)

## Score attestations

Onchain scores do not have an explicit expiry date associated with them. If you are an integrator, you could use the attestation transaction time as a proxy for the issuance date if the age of the score is important for your application. As a rule of thumb, we recommend expiring scores 90 days after it was created. Offchain Stamps also expire after 90 days.

Here's an example of a [score attestation (opens in a new tab)](https://optimism.easscan.org/attestation/view/0x5beb4300ff732dce2bdec86fb97df3a23787c9f1ff90c06bff6bc86dea74aa6c).

[Attestation schema](_building-with-passport_stamps_smart-contracts_attestation-schema.md)[Onchain testing](_building-with-passport_stamps_smart-contracts_test-mode.md)

#### _building-with-passport_stamps_smart-contracts_quick-start-guide.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/smart-contracts/quick-start-guide
> Scraped: 1/9/2026, 1:31:58 PM

The Human Passport smart contracts are deployed on several chains, covering both testnets and live networks. There are several contracts that interact with each other to provide the Human Passport backend and API.

This quick start will illustrate different ways that you can quickly test pulling data from the Passport `decoder` contract.

## Retrieving data from Block Explorers

You can use a block explorer to find the Passport smart contracts and query their API directly in the browser, without having to write any code at all.

1.  Navigate to the `decoder` contract on a [network](_building-with-passport_stamps_smart-contracts_contract-reference.md#contract-addresses) supported by onchain Passport. In this example, we'll use the [`decoder` deployed to the Optimism Sepolia network (opens in a new tab)](https://sepolia-optimism.etherscan.io/address/0xe53C60F8069C2f0c3a84F9B3DB5cf56f3100ba56).
2.  Make sure the `Read as Proxy` tab is open. This is where you can view the methods exposed by the contract.
3.  Open the `getPassport()` or `getScore()` method.
4.  Enter a ETH wallet address, click `Query`, and view the results.

Available methods:

*   The `getPassport` method will provide the Stamps owned by the given address in the browser.
*   The `getScore` method will provide the user's score as a 4 digit number. Divide this by 100 to get the user's unique humanity score.
*   There are also several lower level functions that give access to encoded data and intermediate values.

Here's what a response from `getPassport` function on the block explorer looks like:

![Basescan screenshot](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbasescan.fc6ae160.png&w=3840&q=75)

## Retrieving data programmatically

You can also query the API programmatically from the terminal or in an app.

The steps are:

*   1.  instantiate a web3 provider
*   1.  instantiate the decoder contract
*   1.  call the contract functions

Here's a minimal example of how to call the `getPassport()` and `getScore()` methods using `Web3js` in a Javascript app:

## Instantiate a web3 provider

The provider is your entry point to the blockchain. Ultimately it is the address for a node that exposes a set of methods that allows you to interact with the blockchain. If you run your own node, you can use it as your provider. It is also common to use third party "RPC" providers. This is equivalent to using someone else's node. If you are not sure what to use as your provider, your wallet will expose the URLs it is using, and you can copy them into your Javascript application as shown below.

To use an RPC provider:

To use a local node (in this case, Geth using IPC):

Now you have a variable, `web3` representing your web3 connection. You can use this to interact with contracts on the blockchain.

**Note** please ensure your web3 provider is connected to the correct network.

## Instantiate the decoder contract

Instantiating a contract allows you to interact with a contract deployed on the blockhain as if it were a Javascript object. This requires you to pass the contract ABI (application Binary Interface) and the address on the blockchain where the contract is deployed. The contract ABI can usually be found by querying the contract address on a block explorer, or alternatively it is usually available on a project's Github if the project is open source. The Passport decoder contract ABI can be found on both block explorers and the [Passport Github (opens in a new tab)](https://github.com/passportxyz/eas-proxy/blob/main/deployments/abi/GitcoinPassportDecoder.json).

The `contract` variable is a Javascript object exposing the contract methods.

## Call the contract methods

You can use the contract methods just like Javascript object methods, i.e. `contract.method(args)`. To call the decoder contract's `getPassport()` method:

To call the contract's `getScore()` method:

## Summary

This quick start guide demonstrated how to grab information from the Human Passport decoder contract. You have the option to query the contract using the block explorer UI or programatically using a library such as `web3js`. There are equivalent libraries in other languages too, such as [`web3py` (opens in a new tab)](https://web3py.readthedocs.io/en/stable/) for Python, [`web3` (opens in a new tab)](https://pkg.go.dev/github.com/gochain/web3) for Go, and `ethers` for [Rust (opens in a new tab)](https://github.com/gakonst/ethers-rs) and [Javascript (opens in a new tab)](https://docs.ethers.org/v5/).

## Next steps

Explore our [contract reference page](_building-with-passport_stamps_smart-contracts_contract-reference.md) to find all the details about the various Human Passport contract deployments. Then you could try our more advanced [smart contract app tutorial](_building-with-passport_stamps_smart-contracts_integrating-onchain-stamp-data.md).

If you have more questions you can chat in our [developer support channel on Telegram (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh).

[Introduction](_building-with-passport_stamps_smart-contracts_introduction.md)[Tutorial](_building-with-passport_stamps_smart-contracts_integrating-onchain-stamp-data.md)

#### _building-with-passport_stamps_smart-contracts_test-mode.md

> Source: https://docs.passport.xyz/building-with-passport/stamps/smart-contracts/test-mode
> Scraped: 1/9/2026, 1:31:58 PM

## Testing Onchain Passport

As developers, we often want to test our apps and integrations on testnets, where there is nothing of real world value at stake, before we go live on a live public mainnet. You can always deploy the Human Passport smart contracts to your own local ephemeral blockchain, but it is also recommended to test your integration on a public testnet too, as this more realistically simulates a mainnet environment.

For this reason, the Passport team deployed the Passport smart contracts on public testnets, including OP Sepolia and Linea Goerli.

## Test mode in the Passport app

The Passport app can be run in test mode by visitng URL and following the steps below:

[https://app.passport.xyz#/testing/dashboard (opens in a new tab)](https://app.passport.xyz/#/testing/dashboard)

This enables you to write Passport data and scores to the Human Passport smart contracts on several testnets, meaning you can experiment and get comfortable with the flows before trying it out on Mainnet.

When you sign in to the Passport app, you first have to enable Test Mode. There is a button for this at the top of the page. Enabling Test Mode requires an additional signature from your Ethereum account.

Once Test Mode is enabled, you can click on `Bring Passport onchain` towards the bottom of the Passport app to view the supported testnets in a panel that pops out from the right-hand side of the page. The app switches over to whichever network you select by clicking on the preferred network in the panel in the app's UI.

Other than the network selection panel, the behavior of the test app is identical to the real, "live" Passport app.

## Test mode for developers

Test mode also gives developers the ability to read and write to Passport smart contracts and also develop and test Passport integrations into their own smart contracts. On test networks, this can be done without spending any real ETH on gas fees and without putting any assets at risk from exploits.

Since the Passport contracts are deployed on public testnets as can be used by anyone, there are proper Passport data and many integrations on these testnets that offer a much more realistic test environment than local, ephemeral blockchains and the Passport contracts are already deployed there and managed by the passport team, easing your development process.

To work in Test Mode, developers simply have to switch their development environments onto one of the supported test networks and use the appropriate contract addresses for that network.

## Which networks are supported?

The available test networks are:

* [Optimism Sepolia (opens in a new tab)](https://sepolia-optimism.etherscan.io/)
* [Linea Goerli (opens in a new tab)](https://docs.linea.build/)

## Testing on mainnet forks

The Passport smart contracts may sometimes be upgraded after being deployed. If you are testing on a mainnet fork, you must make sure you fork the blockchain at a block _after_ the latest contract deployment. Otherwise, the contracts stored in your forked blockchains state will be out of date. The block where the latest version of the contract is deployed is known as the `latest stable block` and you can find out what it is by looking at the contract deployment details on the appropriate block explorer for the network you want to fork. Then, fork the blockchain at a block greater to or equal to the `latest stable block`.

For example, the latest stable block for OP mainnet is 115525426. Your test network must fork off OP mainnet at a block >= 115525426.

[Onchain expirations](_building-with-passport_stamps_smart-contracts_onchain-expirations.md)[Contract reference](_building-with-passport_stamps_smart-contracts_contract-reference.md)

#### _overview_active-integrations.md

> Source: https://docs.passport.xyz/overview/active-integrations
> Scraped: 1/9/2026, 1:31:55 PM

## Active Passport integrations

This page contains a condensed list of active integrations that have produced guides detailing how to leverage Passport within each ecosystem.

To find a complete list of ecosystem partners, please visit the following page:

## Guild.xyz

[Guild.xyz (opens in a new tab)](https://guild.xyz/explorer) is a the infrastructure for platformless access management. Create portable memberships, social structures around on- & off-chain requirements and build unique user journeys across apps.

It's a great tool to gate access to Discord roles, Telegram channels, and more.

You can use a certain Passport score threshold as a requirement to gain access to your community tools.

## Snapshot

Snapshot is a voting platform that allows DAOs, DeFi protocols, or NFT communities to vote easily and without gas fees.

Snapshot enables you to use Passport in two different ways: Gate access to submitting proposals, and gate access to voting.

Learn more at the following link:

## Discourse

Discourse is an open source Internet forum system that is used as a governance tool for many web3 organizations.

You've got a few different opportunities to use Passport to assign roles and gate access!

There are actually two different plugins that you can use with Discourse! We are more impressed with the level of documentation provided by Dappy.lol though.

## Collab.land

Collab.Land is a community management tool that supports a wide range of projects, including DAOs, NFT communities, brands, and creators of all sizes.

As with any community management tool, roles are critical for providing different levels of access. The Collab.Land integration allows you to gate access to roles to just those users who can prove their humanity on Passport!

Learn more here:

## Missing something?

While we do list our full list of integration partners on our [ecosystem page (opens in a new tab)](https://passport.human.tech/ecosystem), we want to continue to build out this page with links to partners who have instructions on how to use Passport within their ecosystem.

If we missed a partner, please feel free to submit an issue or open up a pull request by clicking the "Edit this page" button in the right sidebar!

[Use Cases](_overview_use-cases.md)[Key Terms](_overview_key-terms.md)

#### _overview_changelog.md

> Source: https://docs.passport.xyz/overview/changelog
> Scraped: 1/9/2026, 1:31:55 PM

## Changelog

We are also maintaining a separate [Stamp changelog](_building-with-passport_stamps_major-concepts_credential-map-and-weights.md#stamp-changelog), which tracks updates to our Stamps and credentials within the Passport Stamps product.

## September 9th, 2025

We launched a new product called Passport Embed in beta, which enables partners to integrate Human Passport's Stamps-based verification directly on their website or dApp, ensuring that users can verify their identity without having to leave the protected user flow.

You can learn more about Passport Embed via our [Passport Embed documentation](_building-with-passport_stamps_passport-embed.md).

## June 18th, 2025

Today we renamed the Passport API to the Stamps API to better align with our new product architecture, which consists of Passport Stamps ([Stamps API](_building-with-passport_stamps_passport-api.md)), Passport Models ([Models API](_building-with-passport_models.md)), and [data services](_building-with-passport_data-services.md).

## May 19th, 2025

We launched a major update to our developer documentation.

This launch includes a significant overhaul of our product architecture, including the addition of Passport Embeds, and better organizing products into the Passport Stamps, Passport Models, and Data Services groupings. This update coincides with a major update to the Passport website, which also launched earlier this month.

With any major update to our documentation, we recommend that you review the updated documentation to ensure that you are using the latest features and best practices. We'd also love to hear your feedback! Please feel free to [submit an issue to our GitHub repo (opens in a new tab)](https://github.com/passportxyz/passport-docs/issues/new/choose) if you see anything that doesn't make sense, or any broken redirects.

## May 15th, 2025

We launched a new Stamp to the Passport Stamps product.

The new Stamp is called Proof of Clean Hands, and it checks to see if a given address and associated government ID is listed on any sanctions lists, including but not limited to the OFAC sanctions list, all US sanctions lists, and specific UN lists.

you can learn more about this Stamp via our [Proof of Clean Hands documentation (opens in a new tab)](https://support.passport.xyz/passport-knowledge-base/stamps/how-do-i-add-passport-stamps/the-proof-of-clean-hands-stamp). If a user has verified this Stamp, you will be able to see that they verified this Stamp via the [Stamps API](_building-with-passport_stamps_passport-api.md) and [smart contracts](_building-with-passport_stamps_smart-contracts.md).

## May 12th, 2025

We launched a new version of our Models API aggregate model, as well as a new Base model.

The new models are available via the `GET /v2/models` endpoint, with the aggregate model being the default and the Base model being available via the `model` query parameter.

You can learn more about the models in the [Models API documentation](_building-with-passport_models.md).

## March 12th, 2025

We made several updates to Onchain Passport based on developer feedback.

*   We have reduced the number of onchain attestations that we write for users from two to just one.
*   We have updated the [Onchain Passport attestation schema](_building-with-passport_smart-contracts_attestation-schema.md) to be more developer-friendly.
*   We have deprecated the hash that was returned with the decoder contract's `getPassport` method.
*   We've introduced a new method, `getScore` (0xdaadd662), which accepts a scorer ID (communityID) and user address, and returns the current score of a user for that scorer. This can be used by partners who are using [custom scores](_building-with-passport_stamps_custom-passport.md). At this time, there is no way to request Stamp-specific Custom Passport data from onchain.

## Context

We produced the Changelog as part of the March 12th, 2025 release of Passport. We may backfill several product updates in the future.

[Key Terms](_overview_key-terms.md)[Introduction](_building-with-passport_stamps_introduction.md)

#### _overview_key-terms.md

> Source: https://docs.passport.xyz/overview/key-terms
> Scraped: 1/9/2026, 1:31:55 PM

### Passports

The example below shows the JSON data format for a Human Passport. This is an example of a Decentralized Identifier (DID), as defined in the [W3c documentation (opens in a new tab)](https://w3c.github.io/did-core/#a-simple-example). Each passport contains a field named `stamps`. This is a array where your Stamps are stored.

To see what each Stamp looks like, scroll down to the Stamps section. When you add Stamps to your Passport, they are pushed into this array. The entire Passport (DID) object is stored on the Ceramic network and associated with your Ethereum address.

### Passport Protocol

The "Passport Protocol" refers to the infrastructure that enables web3 citizens to create their own Passport, prove their decentralized identity and access Passport-gated projects. It is all the tooling that enables developers to build Passport gating into their apps.

Web3 citizens interface with the Passport Protocol through the Passport holder dApp at [app.passport.xyz (opens in a new tab)](https://app.passport.xyz/). Developers can use the [Stamps API](_building-with-passport_stamps_passport-api.md) to easily integrate Human Passport into their apps.

### Passport-Gating

"Passport gating" means integrating the Passport Protocol into an app for the purpose of screening accounts to keep out bots, bad actors, or simply real people who don't meet a certain [threshold](_building-with-passport_stamps_major-concepts_scoring-thresholds.md) of trustworthiness.

**Usage:**   "I like how this project gated its community with Human Passport. I'm going to ask the project owner for their gating algorithm, so I can use it for inspiration."
*   "Some examples of Passport-gated dApps include: Snapshot, Bankless Academy, and Gitcoin Grants."
*   "Because this community is gated with Human Passport, it is able to ask for pieces of proof of not just identity via services like BrightID, but also reputation via services like POAP."

See our [tutorials](_building-with-passport_stamps_passport-api-v1_tutorials.md) to learn how to gate your project.

### Stamps

Stamps are the key identity verification mechanism of Human Passport. A Stamp is a collection of one or more [verifiable credentials](_overview_key-terms.md#verifiable-credentials-vcs) from an identity provider that is collected in a Passport. Stamps are provided by a variety of web2 and web3 identity authenticators including Google, Facebook, BrightID, ENS, and Proof of Humanity. Custom Stamps for particular communities are under development. Stamps do not store any personally identifiable information, only the verifiable credentials issued by the identity authenticator.

Human Passport aggregates Stamps and assigns each Stamp a different weight according to the needs of a particular community. This weight is used to calculate the cost of forgery of an identity, a score which reflects the credibility of a potential participant's online identity. For example, a community for developers could assign a greater weight to a Github Stamp, resulting in higher scores for those who have Github Stamps.

The code snippet below shows a single Stamp. This particular Stamp proves ownership of a Discord account. The Stamps array in the Human Passport object contains multiple instances of this data structure representing each different passport Stamp. All the Stamps conform to this specific format inherited from [https://www.w3.org/2018/credentials/v1 (opens in a new tab)](https://www.w3.org/2018/credentials/v1).

### Verifiable credentials (VCs)

Each Stamp is composed of one or more "verifiable credential". These credentials are individual pieces of evidence that can be tested in order to issue a Stamp. For example, the Github Stamp includes VCs for several different properties of a user's Github account, including the Github OAuth (can the user sign in to the account) and the number of followers, forks and stars the user has accumulated. Together, these VCs comprise the Github Passport Stamp.

### Ethereum

Ethereum is a blockchain network. It is secured using a proof-of-stake based consensus mechanism and contains an embedded computer that allows apps to be built on top of it. Discrete units of executable code living on the Ethereum blockchain are known as smart contracts. Read more on Ethereum at [ethereum.org (opens in a new tab)](https://ethereum.org/).

### Ethereum address

Ethereum users interact with the network using an account. An account is really a pair of keys. One key is known as the 'private key' which is used to sign and send transactions. The other is the 'public key', which is used to create a unique address used to identify a particular user. In Human Passport, users' Ethereum addresses are used to identify which Stamps they own. Their private keys are used to demonstrate ownership of that address.

### Hash

A hash is the result of applying a hash function to some data. A hash function takes some data and returns a unique string of characters of fixed length (the hash). The hash function is deterministic, meaning the same data will always return the same hash, but it is extremely difficult to recover the original data from the hash. This makes the hash useful for efficiently validating data.

### Duplication of Stamps

The Passport itself does not require a unique underlying account to issue a VC. This means that any number of wallets can create Passports that link to the same underlying identity. While it is fine for an honest user to have multiple Passports, for example to maintain different user profiles (for example "home" and "work") it is not acceptable to use the same credential multiple times to influence a single outcome. Passport is built to support contextual identity so you can maintain Passports that you use within specific communities. It's also important for recoverability that Stamps are not bound to a single Ethereum address - otherwise losing access to your wallet means losing the ability to prove your identity using the Stamps that had previously been tied to it.

To enable users to maintain distinct personas is different communities, but simultaneously prevent dishonest multiplication of Stamps we have added a `hash` field to the Passport Stamps.

This `hash` is a unique identifier that is generated for all VCs issued by the Passport server. It allows a Stamp to be uniquely identified, so a particular app can check that it has only been used once, while preserving anonymity.

As a developer, you don't need to implement any logic for deduplicating Stamps if you use the default scorer. The deduplication is done server-side. However, if you are building a custom scorer you may want to store the hashes and deduplicate Stamps yourself to prevent users from submitting the same set of Stamps in multiple Passports.

More details about Passport deduplication can be found on our [Deduplicating Stamps](_building-with-passport_stamps_major-concepts_deduplicating-stamps.md) page.

### Streams

Passport identity data is stored as a decentralized data stream on Ceramic. Streams are individual instances of state on the Ceramic network. They are mutable and can only be altered after receiving a transaction signed by the account that owns it. These data streams are what allow Passport data to be interoperable and portable across multiple chains and dApps.

### Scorer

A Scorer is an instance of a scoring algorithm. The Stamps API that offers a straightforward way for developers to interact with the Passport Protocol, including adding Passports to a registry and calculating the Passport score using a scoring algorithm.

The Scorer assigns a score to a Passport by summing weights assigned to individual Stamps. Please note that the weights assigned to individual Stamps can change over time in order to provide the best Sybil defence. You can also implement your own scoring algorithm using Stamp data.

### Pagination (API)

Some API requests might return large amounts of data. For example, the data returned from `/registry/stamps` returns information about every individual Stamp owned by a given address, possibly including all the associated metadata too. It can be convenient to break this data up into more manageable pieces. The way to do this is using API pagination.

By adding a query to the API request, you can receive chunks of the data. Take, for example, the following request to the Stamp registry:

This request could return a large amount of data if the given address owns a lot of Stamps. In this case, it could be useful to paginate the response, which means the API will return a subset of the total data. You can do this by adding `&limit=x` to the API request, where `x` is the number of elements (in this example, Stamp objects) to return in each response.

More detail, including an explanation of how to navigate paginated responses, is provided in the [API reference](_building-with-passport_stamps_passport-api_api-reference.md).

### Sybil

A Sybil is a fake user. Many applications require confidence that each of their users represents a real human individual rather than a bot or an impersonator. However, users can try to create multiple personas that they use to access a service, gaining more than their fair share or reward or influence. Each of these dishonest personas is known as a Sybil. Take voting for example; if a user can create ten accounts and convince a platform that they are all valid, then they have multiplied their influence over the outcome of the vote by 10x. Human Passport is an anti-Sybil tool because it makes it harder for attackers to convince platforms that these Sybil accounts represent genuine users.

[Active Integrations](_overview_active-integrations.md)[Changelog](_overview_changelog.md)

#### _overview_use-cases.md

> Source: https://docs.passport.xyz/overview/use-cases
> Scraped: 1/9/2026, 1:31:55 PM

Human Passport's developer platform enables several key use cases:

*   _Protect access_ to rewards, governance, communication channels, marketplaces, and developer tools.
*   _Demonstrate trustworthiness_ to enable users to make better decisions about their online interaction
*   _Weigh user activities based on Passport score_
*   _Improve Passport’s user experience_

## Passport use cases

![Protecting assets](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fprotect-rewardspng.30ab1b7c.png&w=3840&q=75)

### Protect access: Rewards

#### Sub use cases

*   Quadratic funding matching donation pools
*   NFTs
*   Airdrops
*   Faucets
*   Quests
*   Special access

#### Description

One of the primary reasons why Sybils exist is to take advantage of community rewards programs. Whether you’re offering NFTs, airdrops, faucets, or other incentives programs, you want to make sure that your rewards are going to just those humans that deserve it.

By protecting access to Passport holders that have a score over a certain [threshold](_major-concepts_scoring-thresholds.md), you are ensuring that your community rewards programs are properly distributed.

#### Active integrators

* [Gitcoin Grants (opens in a new tab)](https://www.gitcoin.co/grants-stack)
* [Bankless Academy (opens in a new tab)](https://www.gitcoin.co/blog/bankless-academy-a-gitcoin-passport-case-study)
* [CyberConnect (opens in a new tab)](https://www.gitcoin.co/blog/gitcoin-passoort-cyberconnect-case-study)
* [Galxe (opens in a new tab)](https://www.gitcoin.co/blog/gitcoin-passport-galxe)
* [Shapeshift (opens in a new tab)](https://www.gitcoin.co/blog/protecting-shapeshifts-op-rewards-program-a-case-study)
* [Linea (opens in a new tab)](https://www.gitcoin.co/blog/lineas-human-first-campaign-using-gitcoin-passport)

![Protecting governance](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fprotect-governance.d8942c66.png&w=3840&q=75)

### Protect access: Governance

#### Sub use cases

*   Submitting proposals
*   Voting

#### Description

Running a DAO is hard enough without Sybils submitting proposals and influencing a vote in their favor. You can prevent this by protecting access to your governance platforms using Passport.

#### Active integrators

* [Discourse (opens in a new tab)](https://passport.human.tech/blog/how-to-protect-your-discourse-forum-from-bots-and-sybils-with-human-passport)
*   Snapshot

![Protecting communications](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fprotect-communication.27b8c485.png&w=3840&q=75)

### Protect access: Communications

#### Sub use cases

*   Provide specific roles and permissions
*   Block unwanted inbounds

#### Description

Tired of low-quality inbounds or contributions to a communication channel? Protect access to certain channels, roles, or actions within your communications platform to ensure your users have high-quality interactions.

#### Active integrators

* [Discourse (opens in a new tab)](https://passport.human.tech/blog/how-to-protect-your-discourse-forum-from-bots-and-sybils-with-human-passport)
* [Guild (opens in a new tab)](https://www.gitcoin.co/blog/guild-xyz-and-gitcoin-passport-partner)
*   Collab.land
*   Metaforo

![Protecting a marketplace](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fprotect-marketplace.1058442f.png&w=3840&q=75)

### Protect access: Marketplace

#### Sub use cases

*   NFTs
*   Concert tickets
*   Other products and services

#### Description

You’ve got a marketplace that is free and open for users to create and sell content. However, you’ve recently had a string of Sybils creating low-quality projects, or trying to unfairly buy all of the inventory for high-quality projects. Let Passport help to protect these. #PassportCanFixThat

![Proving reputation](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fprove-reputation.e1686092.png&w=3840&q=75)

### Prove reputation

#### Sub use cases

*   Demonstrate user trustworthiness
*   Prove user activity on web2/3

There are many situations where a user would benefit from being able to judge for themselves whether another user is trustworthy or not. By displaying Passport scores and verified Stamps, you can help your users make better decisions about who they interact with on the web.

#### Active integrators

* [{R}elinked (opens in a new tab)](https://www.gitcoin.co/blog/building-reputation-on-r-elinkd)
*   Rarimo
*   Sismo

![Weighing activities](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fweigh-activities.e465003a.png&w=3840&q=75)

### Weigh user activities according to score

#### Description

You have functionality where users help to select which content or ideas are prioritized on your platform. Let the proven humans with a strong Passport score have a heavier weight in deciding this content.

#### Active integrators

*   Gitcoin Grants

![Improving UX](https://docs.passport.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimprove%20experience.fe316cb4.png&w=3840&q=75)

### Improve the Passport experience

#### Description

Passport is the premier solution for Sybil defense. Help us further our goals by building solutions that help to improve the user experience for people using or building on top of Passport.

### Other community programs

We’re very interested in unique use cases that utilize the Passport developer products.

Please feel free to reach out to us on our [Passport Developer Telegram (opens in a new tab)](https://t.me/+Mcp9RsRV7tVmYjZh) to bounce new ideas off us! We will also help promote your unique ideas through our marketing channels.

## Use cases by audience

[Why Human Passport?](_overview_why-human-passport.md)[Active Integrations](_overview_active-integrations.md)

#### _overview_why-human-passport.md

> Source: https://docs.passport.xyz/overview/why-human-passport
> Scraped: 1/9/2026, 1:31:55 PM

**Human Passport is a Sybil resistance protocol and identity aggregation dApp built on the Ceramic Network. Users can collect various identity attestations, called "Stamps", from web2 and web3 authenticators all in one place.**

Many systems, like Gitcoin Grants, assume each participant is a unique human, and offer rewards for these participants. This makes them vulnerable to Sybil attacks, where a bad actor creates a large number of pseudonymous identities to subvert the service’s reputation system, gain a disproportionate amount of influence, and direct rewards towards extractors.

Credible identity verification and reputation mechanisms are essential to combat this. Applications liked BrightID, ENS, and POAP each help suggest whether an account is associated with a real human, but they are only truly powerful when they compose with each other.

Projects need a way to evaluate these disparate "identity providers" altogether.

**That's where Human Passport comes in.**

We originally created Passport for Gitcoin's needs: to [defend Gitcoin's Grants program from Sybil attacks (opens in a new tab)](https://youtu.be/v1Dm7FI2AdU) so that only real people can help decide which projects receive funds from a shared matching pool.

One thing we have learned from defending the Gitcoin Grants program is this: Sybil defense is complicated and resource intensive. Yet it is essential for any web3 project that hopes to have longevity, because users will not stick around if your project is filled with scammers.

As we developed years of in-house expertise in Sybil defense, we saw a responsibility to help other web3 projects protect their communities from bots and bad actors.

**Because we believe that private identity verification is a public good, we decided to turn Passport into its own product.**

With dozens of identity providers using Passport to protect their communities, Passport is on track to become the leading, open-source identity verification protocol in the world.

[Home](index.md)[Use Cases](_overview_use-cases.md)

#### index.md

> Source: https://docs.passport.xyz/
> Scraped: 1/9/2026, 1:31:51 PM

Human Passport is an identity verification application and Sybil resistance protocol.

Developers can utilize the different Human Passport products and services to build a unique humanity solution for their app or project, enabling more trustworthy and fair participation in their community. Less Sybils and bad actors means higher quality engagements and long-term success.

These developer docs describe the different Human Passport developer products and services that you can use to protect your community.

## Developer Products and Services

### Passport Stamps

Passport Stamps is the core product of Human Passport, and the primary way to verify a user's identity and trustworthiness.

With Passport Stamps, users can choose how they prove their unique humanity by verifying different Stamps, or verifiable credentials, which represent high human signal activities throughout web3 and web2. Users can choose to verify with KYC, biometrics, web3 activity, web of trust, and web2 activity Stamps to build up a score, which can then be used by builders to protect access or classify addresses.

Passport Stamps data is made available via the [Stamps API](_building-with-passport_stamps_passport-api.md). Users can optionally push their Passport Stamps data onchain, which can be accessed by developers using our [smart contracts](_building-with-passport_stamps_smart-contracts.md).

The core Passport Stamps and Passport Embed offerings are free, but additional [customizations](_building-with-passport_stamps_custom-passport.md) can be added to your integration to reduce user friction and brand the unique human verification experience.

You can also apply to [become a Stamp provider](_building-with-passport_stamps_create-a-stamp.md).

* * *

### Passport Embed

Passport Embed is an embeddable React component that enables you to add Passport's Stamps-based verification directly on your website or dApp, ensuring that users can verify their identity without having to leave the protected user flow.

* * *

### Passport Models

Passport Models is a real-time verification product that enables you to classify any EVM address as Sybil or human, without requiring users to have a Passport Stamps account. It offers reduced user friction and provides a quick way to verify addresses.

The model scores made available by the [Models API](_building-with-passport_models.md) are generated using Human Passport's machine learning models that analyze address onchain activity on ETH L1 and several L2s, and compares that activity against the activity of massive lists of known Sybils and humans.

Passport Models can be used as a quick primary verification method for your community to pass high-quality users. It can also be used alongside Passport Stamps, enabling an frictionless experience to those that pass the Models check, and a secondary verification option with the Stamp-based verification system.

* * *

### Data services

Human Passport also offers data services to partners who need to better understand whether a list of addresses is Sybil or human.

These data services include the following types of analyses for each address provided:

*   Sybil classification using Passport Models
*   Sybil clustering analysis
*   Diamond hands analysis
*   Custom analysis requested by specific partners

As part of these engagements, the Passport data team will provide actionable recommendations, as well as embed with your team to make sure you know how to use the data services effectively.

* * *

## Get involved

[Why Human Passport?](_overview_why-human-passport.md)

