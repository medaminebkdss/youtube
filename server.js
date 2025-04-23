const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API search endpoint
app.get('/api/search', async (req, res) => {
    try {
        const { hashtag, platform, timeRange } = req.query;
        
        if (!hashtag) {
            return res.status(400).json({ error: 'Hashtag is required' });
        }

        let results;
        
        // Based on platform selection, call the appropriate API
        switch (platform) {
            case 'youtube':
                results = await searchYouTube(hashtag, timeRange);
                break;
            case 'tiktok':
                // Placeholder for future implementation
                return res.status(501).json({ error: 'TikTok search is not yet implemented' });
            case 'instagram':
                // Placeholder for future implementation
                return res.status(501).json({ error: 'Instagram search is not yet implemented' });
            default:
                return res.status(400).json({ error: 'Invalid platform selected' });
        }
        
        res.json(results);
    } catch (error) {
        console.error('API error:', error.message);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// YouTube search function
async function searchYouTube(hashtag, timeRange) {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (!API_KEY) {
        throw new Error('YouTube API key is missing');
    }
    
    // Calculate published after date based on time range
    const publishedAfter = getPublishedAfterDate(timeRange);
    
    // YouTube Data API query parameters
    const params = {
        part: 'snippet',
        maxResults: 50,
        q: `#${hashtag}`,
        key: API_KEY,
        type: 'video',
        order: 'date',
        publishedAfter: publishedAfter.toISOString()
    };
    
    // Make request to YouTube API
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', { params });
    
    if (!response.data.items || response.data.items.length === 0) {
        return { videos: [] };
    }
    
    // Process search results
    const videoIds = response.data.items.map(item => item.id.videoId).join(',');
    const channelIds = response.data.items.map(item => item.snippet.channelId).join(',');
    
    // Get additional video details
    const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
            part: 'snippet,statistics',
            id: videoIds,
            key: API_KEY
        }
    });
    
    // Get channel details for subscriber counts
    const channelDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
            part: 'statistics',
            id: channelIds,
            key: API_KEY
        }
    });
    
    // Create a map of channel IDs to subscriber counts
    const channelSubscribers = {};
    if (channelDetailsResponse.data.items) {
        channelDetailsResponse.data.items.forEach(channel => {
            channelSubscribers[channel.id] = parseInt(channel.statistics.subscriberCount, 10);
        });
    }
    
    // Format the results
    const videos = videoDetailsResponse.data.items.map(video => {
        const channelId = video.snippet.channelId;
        
        return {
            title: video.snippet.title,
            channelTitle: video.snippet.channelTitle,
            subscriberCount: channelSubscribers[channelId] || 0,
            uploadDate: video.snippet.publishedAt,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            views: parseInt(video.statistics.viewCount, 10),
            likes: parseInt(video.statistics.likeCount, 10) || 0,
            comments: parseInt(video.statistics.commentCount, 10) || 0
        };
    });
    
    return { videos };
}

// Helper function to calculate published after date
function getPublishedAfterDate(timeRange) {
    const now = new Date();
    
    switch (timeRange) {
        case 'day':
            now.setDate(now.getDate() - 1);
            break;
        case 'week':
            now.setDate(now.getDate() - 7);
            break;
        case 'month':
            now.setDate(now.getDate() - 30);
            break;
        default:
            now.setDate(now.getDate() - 1); // Default to 1 day
    }
    
    return now;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
