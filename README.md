## Table of Contents

- [Environment Variables (.env)](#environment-variables-env)
- [Discord Bot Setup](#discord-bot-setup)
- [Google API Setup](#google-api-setup)
- [Zoom API Setup](#zoom-api-setup)
- [Final Step](#final-step)

# 📦 Environment Setup Guide

This project uses APIs from Discord, Google, and Zoom. To use these integrations, set up your credentials in a `.env` file.

---

## Environment Variables (.env)

Create a `.env` file in your project root:

```env
# Discord
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
GUILD_ID=your_discord_guild_id

# Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# Zoom
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret
ZOOM_ACCOUNT_ID=your_zoom_account_id
```

## 🟣 Discord Bot Credentials

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).

2. Click **New Application** and give it a name.

3. Navigate to **Bot** > click **Add Bot** > confirm.

4. Under the **Bot** tab:
   - Copy the `DISCORD_TOKEN`.
   - Enable required permissions such as `MESSAGE_CONTENT` and `APPLICATION_COMMANDS`.

5. Under **OAuth2 > General**:
   - Copy the `CLIENT_ID`.

6. To get your `GUILD_ID` for a test server:
   - Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode).
   - Right-click your server in Discord and select **Copy ID**.

📘 Discord Bot Guide: [discordjs.guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html)

## 🟢 Google API Setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).
3. Navigate to **APIs & Services > Credentials**.
4. Click **Create Credentials > OAuth client ID**.
   - Choose **Web Application**.
   - Add your `GOOGLE_REDIRECT_URI` under Authorized redirect URIs.
5. Copy your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Get Refresh Token

1. Visit the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Click the gear icon (top-right).
   - Check **Use your own OAuth credentials**.
   - Enter your client ID and client secret.

3. Select and authorize the following scopes:
https://www.googleapis.com/auth/drive
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/documents

4. Click **Exchange authorization code for tokens**.
5. Copy the refresh token and set it as `GOOGLE_REFRESH_TOKEN` in your `.env`.

📘 Docs: [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

## 🔵 Zoom API Setup

1. Go to the [Zoom App Marketplace](https://marketplace.zoom.us/).
2. Click **Develop > Build App**.
3. Select **Server-to-Server OAuth**.
4. Complete the required app details.
5. Once created, go to the **App Credentials** tab and copy:
   - `ZOOM_API_KEY`
   - `ZOOM_API_SECRET`
   - `ZOOM_ACCOUNT_ID`

📘 Docs: [Zoom Server-to-Server OAuth](https://developers.zoom.us/docs/internal-apps/s2s-oauth/)