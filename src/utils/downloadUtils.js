// Utility functions for downloading stories

// Helper function to validate file size
const validateFileSize = (blob, mediaType) => {
  if (blob.size === 0) {
    throw new Error('Downloaded file is empty');
  }

  // Check minimum file size (100 bytes for images, 1KB for videos)
  const minSize = mediaType === 'video' ? 1024 : 100;
  if (blob.size < minSize) {
    throw new Error(`File too small: ${blob.size} bytes (expected at least ${minSize} bytes)`);
  }
};

export const downloadStory = async (story, username) => {
  try {
    if (!story.mediaUrl) {
      throw new Error('No media URL available');
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = story.mediaType === 'video' ? 'mp4' : 'jpg';
    const filename = `${username}_story_${timestamp}.${extension}`;

    console.log(`Starting download for ${story.mediaType}: ${story.mediaUrl}`);

    // For videos, try direct URL first, then fallback to proxy
    let downloadUrl = story.mediaUrl;
    let method = 'direct';
    
    if (story.mediaType === 'video') {
      // For videos, try direct download first to preserve audio
      console.log('Attempting direct video download to preserve audio');
      downloadUrl = story.mediaUrl;
      method = 'direct';
    } else {
      // For images, use Weserv proxy
      downloadUrl = `https://images.weserv.nl/?url=${encodeURIComponent(story.mediaUrl)}`;
      method = 'weserv_proxy';
    }

    let response;
    try {
      response = await fetch(downloadUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': story.mediaType === 'video' ? 'video/mp4,video/*,*/*;q=0.8' : 'image/webp,image/apng,image/*,*/*;q=0.8',
        }
      });
    } catch (corsError) {
      console.log('CORS error with direct download, trying Weserv proxy:', corsError.message);
      
      // Fallback to Weserv proxy for videos if direct download fails
      if (story.mediaType === 'video') {
        downloadUrl = `https://images.weserv.nl/?url=${encodeURIComponent(story.mediaUrl)}`;
        method = 'weserv_proxy';
        
        response = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'Accept': 'video/mp4,video/*,*/*;q=0.8',
          }
        });
      } else {
        throw corsError;
      }
    }

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    validateFileSize(blob, story.mediaType);

    // Check minimum file size (1KB for images, 10KB for videos)
    const minSize = story.mediaType === 'video' ? 10240 : 1024;
    if (blob.size < minSize) {
      throw new Error(`File too small: ${blob.size} bytes (expected at least ${minSize} bytes)`);
    }

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    window.URL.revokeObjectURL(url);

    console.log(`Download completed: ${filename} (${blob.size} bytes) using ${method}`);
    
    // For small images, show a warning but still allow download
    if (story.mediaType === 'image' && blob.size < 1024) {
      console.warn(`Small image file: ${blob.size} bytes - this might be a thumbnail`);
    }
    
    return { success: true, filename, size: blob.size, method };
  } catch (error) {
    console.error('Download error:', error);
    
    // For images, try opening in new tab as fallback
    if (story.mediaType === 'image') {
      console.log('Trying to open image in new tab as fallback');
      try {
        window.open(story.mediaUrl, '_blank');
        return { success: true, filename: 'opened_in_new_tab', method: 'new_tab' };
      } catch (tabError) {
        console.error('Failed to open in new tab:', tabError);
      }
    }
    
    // For videos, try opening in new tab as fallback
    if (story.mediaType === 'video') {
      console.log('Trying to open video in new tab as fallback');
      try {
        window.open(story.mediaUrl, '_blank');
        return { success: true, filename: 'opened_in_new_tab', method: 'new_tab' };
      } catch (tabError) {
        console.error('Failed to open video in new tab:', tabError);
      }
    }
    
    throw new Error(`Failed to download story: ${error.message}`);
  }
};

export const downloadAllStories = async (stories, username) => {
  try {
    const results = [];
    
    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      try {
        // Add delay between downloads to avoid overwhelming the server
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const result = await downloadStory(story, username);
        results.push({ ...result, index: i });
      } catch (error) {
        results.push({ success: false, error: error.message, index: i });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Batch download error:', error);
    throw new Error('Failed to download stories');
  }
};

// Utility to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 