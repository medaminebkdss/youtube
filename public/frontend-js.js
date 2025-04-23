document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const hashtagInput = document.getElementById('hashtag-input');
    const platformSelect = document.getElementById('platform-select');
    const timeRangeSelect = document.getElementById('time-range');
    const searchButton = document.getElementById('search-btn');
    const resultsTable = document.getElementById('results-table');
    const resultsBody = document.getElementById('results-body');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const noResults = document.getElementById('no-results');
    const exportCsvBtn = document.getElementById('export-csv');
    const exportExcelBtn = document.getElementById('export-excel');
    const resultsTitle = document.getElementById('results-title');

    // Store search results globally for export function
    let searchResults = [];

    // Event listeners
    searchButton.addEventListener('click', performSearch);
    exportCsvBtn.addEventListener('click', () => exportData('csv'));
    exportExcelBtn.addEventListener('click', () => exportData('excel'));

    // Also trigger search on Enter key in input
    hashtagInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Main search function
    async function performSearch() {
        const hashtag = hashtagInput.value.trim();
        if (!hashtag) {
            showError('Please enter a hashtag to search for');
            return;
        }

        // Show loader and hide other elements
        loader.classList.remove('hidden');
        resultsTable.classList.add('hidden');
        errorMessage.classList.add('hidden');
        noResults.classList.add('hidden');
        exportCsvBtn.disabled = true;
        exportExcelBtn.disabled = true;

        const platform = platformSelect.value;
        const timeRange = timeRangeSelect.value;

        try {
            // Make API request to our backend
            const response = await fetch(`/api/search?hashtag=${encodeURIComponent(hashtag)}&platform=${platform}&timeRange=${timeRange}`);
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${await response.text()}`);
            }
            
            const data = await response.json();
            searchResults = data.videos || [];
            
            // Update results title
            resultsTitle.textContent = `Search Results for #${hashtag} on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`;
            
            // Hide loader
            loader.classList.add('hidden');
            
            // Display results or show no-results message
            if (searchResults.length > 0) {
                displayResults(searchResults);
                exportCsvBtn.disabled = false;
                exportExcelBtn.disabled = false;
            } else {
                noResults.classList.remove('hidden');
            }
            
        } catch (error) {
            console.error('Search error:', error);
            showError(error.message || 'Failed to perform search. Please try again later.');
            loader.classList.add('hidden');
        }
    }

    // Display results in the table
    function displayResults(videos) {
        resultsBody.innerHTML = '';
        
        videos.forEach(video => {
            const row = document.createElement('tr');
            
            // Format date
            const uploadDate = new Date(video.uploadDate);
            const formattedDate = uploadDate.toLocaleString();
            
            row.innerHTML = `
                <td>${video.title}</td>
                <td>${video.channelTitle}</td>
                <td>${formatNumber(video.subscriberCount)}</td>
                <td>${formattedDate}</td>
                <td>
                    <a href="${video.url}" target="_blank" class="video-link">
                        <i class="fas fa-external-link-alt"></i> Watch
                    </a>
                </td>
            `;
            
            resultsBody.appendChild(row);
        });
        
        resultsTable.classList.remove('hidden');
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    // Format large numbers (e.g., 1500000 -> 1.5M)
    function formatNumber(num) {
        if (!num) return 'Unknown';
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Export data function (CSV or Excel)
    function exportData(format) {
        if (searchResults.length === 0) return;
        
        if (format === 'csv') {
            const csvContent = generateCSV(searchResults);
            downloadFile(csvContent, 'hashtag-search-results.csv', 'text/csv');
        } else if (format === 'excel') {
            // In a real implementation, we might use a library like SheetJS
            // For now, we'll use CSV which Excel can import
            const csvContent = generateCSV(searchResults);
            downloadFile(csvContent, 'hashtag-search-results.xls', 'application/vnd.ms-excel');
        }
    }

    // Generate CSV from results
    function generateCSV(data) {
        const headers = ['Title', 'Channel', 'Subscribers', 'Upload Date', 'URL'];
        let csvContent = headers.join(',') + '\n';
        
        data.forEach(video => {
            const uploadDate = new Date(video.uploadDate).toLocaleString();
            // Escape quotes in title and channel name
            const title = `"${video.title.replace(/"/g, '""')}"`;
            const channel = `"${video.channelTitle.replace(/"/g, '""')}"`;
            
            const row = [
                title,
                channel,
                video.subscriberCount || 'Unknown',
                uploadDate,
                video.url
            ];
            
            csvContent += row.join(',') + '\n';
        });
        
        return csvContent;
    }

    // Helper function to download files
    function downloadFile(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
});
