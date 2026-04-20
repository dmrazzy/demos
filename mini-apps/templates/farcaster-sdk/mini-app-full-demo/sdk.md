# Farcaster Mini App SDK Documentation

This document catalogs every instance of the Farcaster SDK usage in the mini-app-full-demo project.

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@farcaster/miniapp-sdk` | ^0.2.1 | Main SDK for Mini App functionality |
| `@farcaster/miniapp-core` | ^0.4.1 | Core types and utilities |
| `@farcaster/miniapp-node` | ^0.1.11 | Node.js utilities for Mini Apps |
| `@farcaster/miniapp-wagmi-connector` | ^1.1.0 | Wagmi connector for wallet integration |
| `@farcaster/auth-kit` | ^0.8.1 | Authentication UI components |
| `@farcaster/auth-client` | (peer) | Authentication client utilities |

---

## SDK Import

```typescript
import { sdk } from "@farcaster/miniapp-sdk";
```

---

## Core Properties & Methods

### 1. `sdk.context`

**File:** `src/components/providers/frame-provider.tsx`

**Description:** Returns the Mini App context containing user information, client details, safe area insets, and notification settings.

**Usage:**
```typescript
const context = await sdk.context;
```

**Context Structure:**
```typescript
interface MiniAppContext {
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
  location?: Record<string, unknown>;
  client: {
    platformType?: 'web' | 'mobile';
    clientFid: number;
    added: boolean;
    safeAreaInsets?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    notificationDetails?: {
      url: string;
      token: string;
    };
  };
  features?: {
    cameraAndMicrophoneAccess?: boolean;
  };
}
```

---

### 2. `sdk.isInMiniApp()`

**File:** `src/components/providers/frame-provider.tsx`

**Description:** Checks if the application is running inside a Farcaster Mini App environment.

**Usage:**
```typescript
const isInMiniApp = await sdk.isInMiniApp();
// Returns: boolean
```

---

### 3. `sdk.getCapabilities()`

**Files:** `src/components/Demo.tsx`, `src/components/actions/get-capabilities.tsx`

**Description:** Returns an array of capabilities supported by the current Farcaster client.

**Usage:**
```typescript
const capabilities = await sdk.getCapabilities();
// Returns: string[]
```

**Example capabilities:**
- `haptics.selectionChanged`
- `haptics.impactOccurred`
- `actions.requestCameraAndMicrophoneAccess`

---

### 4. `sdk.getChains()`

**File:** `src/components/actions/get-chains.tsx`

**Description:** Returns a list of blockchain chains supported by the Farcaster client.

**Usage:**
```typescript
const chains = await sdk.getChains();
// Returns: Chain[]
```

---

## Lifecycle Actions

### 5. `sdk.actions.ready()`

**File:** `src/components/providers/frame-provider.tsx`

**Description:** Signals to the Farcaster client that the Mini App has finished loading and is ready for user interaction.

**Usage:**
```typescript
sdk.actions.ready();
```

---

### 6. `sdk.actions.addMiniApp()`

**File:** `src/components/actions/add-miniapp.tsx`

**Description:** Prompts the user to add the current Mini App to their Farcaster client.

**Usage:**
```typescript
await sdk.actions.addMiniApp();
```

---

### 7. `sdk.actions.close()`

**File:** `src/components/actions/close-miniapp.tsx`

**Description:** Closes the current Mini App.

**Usage:**
```typescript
sdk.actions.close();
```

---

## Authentication

### 8. `sdk.actions.signIn()`

**File:** `src/components/actions/signin.tsx`

**Description:** Initiates Sign In With Farcaster (SIWF) authentication flow.

**Usage:**
```typescript
const nonce = await generateNonce();
const result = await sdk.actions.signIn({ nonce });
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `nonce` | `string` | Unique nonce for signature verification |

**Returns:**
```typescript
interface SignInResult {
  message: string;
  signature: string;
}
```

---

### 9. `sdk.quickAuth.getToken()`

**File:** `src/components/actions/quick-auth.tsx`

**Description:** Quick authentication method that returns a JWT token for the user.

**Usage:**
```typescript
const result = await sdk.quickAuth.getToken();
const token = result.token;
```

**Returns:**
```typescript
{
  token: string; // JWT token
}
```

---

## Navigation Actions

### 10. `sdk.actions.viewProfile()`

**Files:** `src/components/top-bar.tsx`, `src/components/actions/view-profile.tsx`

**Description:** Opens a Farcaster user's profile in the client.

**Usage:**
```typescript
sdk.actions.viewProfile({ fid: 3 });
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `fid` | `number` | Farcaster user ID to view |

---

### 11. `sdk.actions.viewToken()`

**File:** `src/components/actions/view-token.tsx`

**Description:** Opens a token details view in the Farcaster client.

**Usage:**
```typescript
sdk.actions.viewToken({ 
  token: "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" 
});
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | `string` | CAIP-19 asset identifier |

---

### 12. `sdk.actions.viewCast()`

**File:** `src/components/actions/view-cast.tsx`

**Description:** Opens a Farcaster cast (post) in the client.

**Usage:**
```typescript
sdk.actions.viewCast({ 
  hash: "0xfb2e255124ddb549a53fb4b1afdf4fa9f3542f78", 
  close: false 
});
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `hash` | `string` | Cast hash identifier |
| `close` | `boolean` | Whether to close the Mini App after viewing |

---

### 13. `sdk.actions.openMiniApp()`

**File:** `src/components/actions/open-miniapp.tsx`

**Description:** Opens another Mini App from within the current Mini App.

**Usage:**
```typescript
await sdk.actions.openMiniApp({
  url: "https://cooprecords.xyz"
});
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | URL of the Mini App to open |

---

### 14. `sdk.actions.openUrl()`

**File:** `src/components/actions/openurl.tsx`

**Description:** Opens an external URL in the browser.

**Usage:**
```typescript
sdk.actions.openUrl("https://google.com");
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | External URL to open |

---

## Cast Actions

### 15. `sdk.actions.composeCast()`

**File:** `src/components/actions/compose-cast.tsx`

**Description:** Opens the cast composer with pre-filled content.

**Usage:**
```typescript
const result = await sdk.actions.composeCast({
  text: "I just learned how to compose a cast",
  embeds: ["https://miniapps.farcaster.xyz/docs/sdk/actions/compose-cast"],
  channelKey: "farcaster",
  close: false,
  parent: { type: 'cast', hash: '0x...' }
});
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | `string?` | Pre-filled cast text |
| `embeds` | `[] \| [string] \| [string, string]?` | Up to 2 embed URLs |
| `channelKey` | `string?` | Channel to post in |
| `close` | `boolean?` | Close Mini App after composing |
| `parent` | `{ type: 'cast', hash: string }?` | Parent cast for replies |

**Returns:**
```typescript
interface ComposeCastResult {
  cast: {
    hash: string;
    channelKey?: string;
  } | null;
}
```

---

## Token Actions

### 16. `sdk.actions.sendToken()`

**File:** `src/components/actions/send-token.tsx`

**Description:** Initiates a token transfer to a recipient address.

**Usage:**
```typescript
const result = await sdk.actions.sendToken({
  token: "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  amount: "1000000",
  recipientAddress: "0x8342A48694A74044116F330db5050a267b28dD85"
});

if (result.success) {
  console.log("Transaction:", result.send);
} else {
  console.error("Error:", result.error?.message || result.reason);
}
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | `string` | CAIP-19 asset identifier |
| `amount` | `string` | Amount in smallest unit (wei/base units) |
| `recipientAddress` | `string` | Recipient wallet address |

**Returns:**
```typescript
{
  success: boolean;
  send?: TransactionInfo;
  error?: { message: string };
  reason?: string;
}
```

---

### 17. `sdk.actions.swapToken()`

**File:** `src/components/actions/swap-token.tsx`

**Description:** Initiates a token swap between two assets.

**Usage:**
```typescript
const result = await sdk.actions.swapToken({
  sellToken: "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  buyToken: "eip155:8453/native",
  sellAmount: "1000000"
});

if (result.success) {
  console.log("Swap:", result.swap);
} else {
  console.error("Error:", result.error?.message || result.reason);
}
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `sellToken` | `string` | CAIP-19 asset to sell |
| `buyToken` | `string` | CAIP-19 asset to buy |
| `sellAmount` | `string` | Amount to sell in base units |

**Returns:**
```typescript
{
  success: boolean;
  swap?: SwapInfo;
  error?: { message: string };
  reason?: string;
}
```

---

## Permissions

### 18. `sdk.actions.requestCameraAndMicrophoneAccess()`

**File:** `src/components/actions/request-camera-microphone.tsx`

**Description:** Requests camera and microphone permissions from the user.

**Usage:**
```typescript
await sdk.actions.requestCameraAndMicrophoneAccess();
```

**Platform Support:**
| Platform | Support |
|----------|---------|
| iOS | Full support |
| Android | Supported |
| Web | Not supported |

---

## Haptics

### 19. `sdk.haptics.impactOccurred()`

**Files:** `src/components/Demo.tsx`, `src/components/haptic-wrapper.tsx`, `src/components/actions/haptics.tsx`

**Description:** Triggers impact haptic feedback with varying intensity levels.

**Usage:**
```typescript
await sdk.haptics.impactOccurred('light');
await sdk.haptics.impactOccurred('medium');
await sdk.haptics.impactOccurred('heavy');
await sdk.haptics.impactOccurred('soft');
await sdk.haptics.impactOccurred('rigid');
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `style` | `'light' \| 'medium' \| 'heavy' \| 'soft' \| 'rigid'` | Impact intensity |

---

### 20. `sdk.haptics.notificationOccurred()`

**File:** `src/components/actions/haptics.tsx`

**Description:** Triggers notification-style haptic feedback.

**Usage:**
```typescript
await sdk.haptics.notificationOccurred('success');
await sdk.haptics.notificationOccurred('warning');
await sdk.haptics.notificationOccurred('error');
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `'success' \| 'warning' \| 'error'` | Notification type |

---

### 21. `sdk.haptics.selectionChanged()`

**Files:** `src/components/Demo.tsx`, `src/components/haptic-wrapper.tsx`, `src/components/actions/haptics.tsx`

**Description:** Triggers selection change haptic feedback for UI state changes.

**Usage:**
```typescript
await sdk.haptics.selectionChanged();
```

---

## Events

### 22. `sdk.on()` / `sdk.removeListener()`

**File:** `src/components/actions/add-miniapp.tsx`

**Description:** Event listener methods for SDK events.

**Usage:**
```typescript
// Subscribe to events
sdk.on('miniAppAdded', () => {
  console.log("Mini App added successfully!");
});

sdk.on('miniAppRemoved', () => {
  console.log("Mini App was removed");
});

// Cleanup
sdk.removeListener('miniAppAdded', handleMiniAppAdded);
sdk.removeListener('miniAppRemoved', handleMiniAppRemoved);
```

**Available Events:**
| Event | Description |
|-------|-------------|
| `miniAppAdded` | Fired when Mini App is added to client |
| `miniAppRemoved` | Fired when Mini App is removed from client |

---

## Wagmi Connector

### `farcasterMiniApp()`

**Package:** `@farcaster/miniapp-wagmi-connector`

**File:** `src/components/providers/wagmi-provider.tsx`

**Description:** Wagmi connector that enables wallet connection through the Farcaster Mini App environment.

**Usage:**
```typescript
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { createConfig, http, WagmiProvider } from "wagmi";
import { base, optimism } from "wagmi/chains";

export const config = createConfig({
  chains: [base, optimism],
  transports: {
    [base.id]: http(),
    [optimism.id]: http(),
  },
  connectors: [
    farcasterMiniApp(),
  ],
});
```

---

## Auth Client

### `createAppClient()`, `viemConnector()`, `generateNonce()`

**Package:** `@farcaster/auth-client`

**File:** `src/components/actions/signin.tsx`

**Description:** Utilities for SIWF signature verification.

**Usage:**
```typescript
import { createAppClient, generateNonce, viemConnector } from "@farcaster/auth-client";

const nonce = await generateNonce();

const appClient = createAppClient({
  ethereum: viemConnector(),
});

const verifyResult = await appClient.verifySignInMessage({
  message: result.message,
  signature: result.signature as `0x${string}`,
  domain: new URL(window.location.origin).hostname,
  nonce: nonce,
  acceptAuthAddress: true
});
```

---

## Summary Table

| Function | Category | Description |
|----------|----------|-------------|
| `sdk.context` | Core | Get Mini App context |
| `sdk.isInMiniApp()` | Core | Check if running in Mini App |
| `sdk.getCapabilities()` | Core | Get supported capabilities |
| `sdk.getChains()` | Core | Get supported chains |
| `sdk.actions.ready()` | Lifecycle | Signal app is ready |
| `sdk.actions.addMiniApp()` | Lifecycle | Add Mini App to client |
| `sdk.actions.close()` | Lifecycle | Close Mini App |
| `sdk.actions.signIn()` | Auth | Sign In With Farcaster |
| `sdk.quickAuth.getToken()` | Auth | Quick JWT authentication |
| `sdk.actions.viewProfile()` | Navigation | View user profile |
| `sdk.actions.viewToken()` | Navigation | View token details |
| `sdk.actions.viewCast()` | Navigation | View cast |
| `sdk.actions.openMiniApp()` | Navigation | Open another Mini App |
| `sdk.actions.openUrl()` | Navigation | Open external URL |
| `sdk.actions.composeCast()` | Cast | Create new cast |
| `sdk.actions.sendToken()` | Token | Send tokens |
| `sdk.actions.swapToken()` | Token | Swap tokens |
| `sdk.actions.requestCameraAndMicrophoneAccess()` | Permissions | Request camera/mic |
| `sdk.haptics.impactOccurred()` | Haptics | Impact feedback |
| `sdk.haptics.notificationOccurred()` | Haptics | Notification feedback |
| `sdk.haptics.selectionChanged()` | Haptics | Selection feedback |
| `sdk.on()` / `sdk.removeListener()` | Events | Event listeners |
| `farcasterMiniApp()` | Wagmi | Wallet connector |
| `createAppClient()` | Auth | SIWF verification client |
| `generateNonce()` | Auth | Generate auth nonce |
| `viemConnector()` | Auth | Viem connector for auth |
