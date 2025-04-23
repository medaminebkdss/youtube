# Hashtag Video Search

A web application that allows users to search for videos by hashtag across different social media platforms (YouTube, TikTok, Instagram).

## Features

- Search videos by hashtag
- Filter by platform (YouTube, TikTok, Instagram)
- Filter by time range (last 24 hours, last 7 days, last 30 days)
- View video details including title, channel, subscriber count, and upload date
- Export results to CSV or Excel formats

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- API keys for the platforms you want to use:
  - YouTube Data API key
  - TikTok API key (for future implementation)
  - Instagram API key (for future implementation)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/hashtag-video-search.git
cd hashtag-video-search
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file in the root directory and add your API keys:
```
PORT=3000
YOUTUBE_API_KEY=your_youtube_api_key_here
```

4. Set up the project structure:
```
/hashtag-video-search
  /public
    index.html
    styles.css
    app.js
  server.js
  .env
  package.json
```

5. Start the server
```
npm start
```

6. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `public/index.html`: Main HTML file for the frontend
- `public/styles.css`: CSS styles for the application
- `public/app.js`: Frontend JavaScript for handling user interactions
- `server.js`: Express server that handles API requests and serves static files
- `.env`: Configuration file for environment variables and API keys

## API Endpoints

### GET /api/search
Search for videos by hashtag

**Query Parameters:**
- `hashtag`: The hashtag to search for (without the # symbol)
- `platform`: The platform to search on (youtube, tiktok, instagram)
- `timeRange`: Time range for results (day, week, month)

**Response:**
```json
{
  "videos": [
    {
      "title": "Video Title",
      "channelTitle": "Channel Name",
      "subscriberCount": 1000000,
      "uploadDate": "2023-04-22T10:30:00Z",
      "url": "https://www.youtube.com/watch?v=videoId",
      "views": 5000,
      "likes": 250,
      "comments": 30
    },
    ...
  ]
}
```

## Future Enhancements

- Add support for TikTok and Instagram platforms
- Implement pagination for search results
- Add more filtering options (views, likes, etc.)
- User authentication for saving searches and results
- Enhanced analytics and trend visualization

## Notes on API Limitations

- YouTube Data API has daily quotas. Monitor your usage to avoid exceeding limits.
- TikTok and Instagram APIs have strict access policies. You may need to apply for developer access.
- Some platforms may require additional authentication or partnerships for full access.
