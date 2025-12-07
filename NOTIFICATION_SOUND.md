# Message Notification Sound Implementation

## Overview

The notification sound feature automatically plays a sound when a new message arrives from another user.

## How It Works

### Services

1. **AudioNotificationService** (`src/core/services/audio-notification-service.ts`)

   - Handles all audio playback functionality
   - Manages mute state (persisted in localStorage)
   - Falls back to Web Audio API beep if audio file fails

2. **SignalRService** (`src/core/services/signal-r-service.ts`)
   - Calls `audioNotification.playNotificationSound()` when receiving new messages
   - Only plays sound for messages from other users (not your own messages)
   - Exposes methods to control notification sound settings

## Features

- ✅ Plays sound when new message arrives
- ✅ Only for messages from other users
- ✅ Mute preference persists across sessions (localStorage)
- ✅ Fallback Web Audio API beep if file doesn't load
- ✅ Error handling for various browser scenarios

## Usage

### In Components

```typescript
import { SignalRService } from '../../core/services/signal-r-service';

constructor(private signalRService: SignalRService) {}

// Check if sound is muted
isMuted = this.signalRService.isNotificationSoundMuted();

// Toggle sound on/off
toggleNotificationSound() {
  this.signalRService.toggleNotificationSound();
}

// Set mute state explicitly
muteNotifications() {
  this.signalRService.setNotificationSoundMuted(true);
}

enableNotifications() {
  this.signalRService.setNotificationSoundMuted(false);
}
```

## Adding Custom Sound File

To add a custom notification sound:

1. **Place audio file** in `public/assets/sounds/notification.mp3`

   - Supported formats: MP3, WAV, OGG, M4A
   - Recommended: ~1-2 seconds, low file size (< 100KB)

2. **Update audio src** if using different filename:
   ```typescript
   // In audio-notification-service.ts
   this.notificationAudio.src = "/assets/sounds/your-custom-sound.mp3";
   ```

## Browser Compatibility

- Modern browsers with Web Audio API support
- Automatic fallback to synthesized beep tone
- Graceful degradation if audio is not supported

## Mute Storage Key

- **localStorage key**: `notification-sound-muted`
- **Value**: `'true'` or `'false'`

## Logging

Check browser console (F12) for:

- `"Notification sound played successfully"` - Sound file played
- `"Notification tone played via Web Audio API"` - Fallback beep played
- `"Notification sound is muted"` - Sound was muted when trying to play
- Error messages if playback fails

## Events That Trigger Sound

- New message received from another user
- Sound will NOT play for:
  - Your own sent messages
  - If notifications are muted
  - If audio playback fails and Web Audio API is unavailable
