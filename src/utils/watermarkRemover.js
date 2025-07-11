// Watermark Removal Utility
// This utility handles watermark detection and removal from PDFs, filenames, and cover images

export class WatermarkRemover {
  constructor() {
    // Common watermark patterns to detect and remove
    this.watermarkPatterns = [
      // Common watermark text patterns
      /watermark/gi,
      /sample/gi,
      /preview/gi,
      /demo/gi,
      /trial/gi,
      /evaluation/gi,
      /copyright/gi,
      /©/g,
      /®/g,
      /™/g,
      
      // Website watermarks
      /www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
      /https?:\/\/[a-zA-Z0-9.-]+/gi,
      /[a-zA-Z0-9.-]+\.com/gi,
      /[a-zA-Z0-9.-]+\.org/gi,
      /[a-zA-Z0-9.-]+\.net/gi,
      
      // Common PDF watermark phrases
      /this is a sample/gi,
      /for preview only/gi,
      /not for distribution/gi,
      /confidential/gi,
      /draft/gi,
      /internal use/gi,
      /property of/gi,
      
      // File sharing site watermarks
      /scribd/gi,
      /slideshare/gi,
      /academia\.edu/gi,
      /researchgate/gi,
      /pdfdrive/gi,
      /libgen/gi,
      /z-library/gi,
      /zlibrary/gi,
      
      // Publisher watermarks
      /springer/gi,
      /elsevier/gi,
      /wiley/gi,
      /pearson/gi,
      /mcgraw.?hill/gi,
      
      // Generic patterns
      /\[.*watermark.*\]/gi,
      /\(.*watermark.*\)/gi,
      /\{.*watermark.*\}/gi,
      /-\s*watermark/gi,
      /watermark\s*-/gi,
    ];

    // Filename cleaning patterns
    this.filenamePatterns = [
      // Remove common suffixes
      /_watermark/gi,
      /_sample/gi,
      /_preview/gi,
      /_demo/gi,
      /_trial/gi,
      
      // Remove brackets with watermark content
      /\[.*?watermark.*?\]/gi,
      /\(.*?watermark.*?\)/gi,
      /\{.*?watermark.*?\}/gi,
      
      // Remove website references
      /\s*-\s*www\.[a-zA-Z0-9.-]+/gi,
      /\s*-\s*[a-zA-Z0-9.-]+\.com/gi,
      
      // Remove version indicators
      /\s*v\d+/gi,
      /\s*version\s*\d+/gi,
      
      // Clean up extra spaces and dashes
      /\s*-\s*-\s*/g,
      /\s{2,}/g,
      /^[-\s]+|[-\s]+$/g,
    ];
  }

  /**
   * Clean filename by removing watermark-related text
   */
  cleanFilename(filename) {
    let cleaned = filename;
    
    // Remove .pdf extension for processing
    const extension = cleaned.toLowerCase().endsWith('.pdf') ? '.pdf' : '';
    if (extension) {
      cleaned = cleaned.slice(0, -4);
    }
    
    // Apply filename cleaning patterns
    this.filenamePatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, ' ');
    });
    
    // Additional cleaning
    cleaned = cleaned
      .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing spaces
    
    // Capitalize first letter of each word
    cleaned = cleaned.replace(/\b\w/g, l => l.toUpperCase());
    
    return cleaned;
  }

  /**
   * Remove watermarks from text content
   */
  cleanTextContent(text) {
    if (!text) return text;
    
    let cleaned = text;
    
    // Apply watermark removal patterns
    this.watermarkPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    // Clean up extra whitespace
    cleaned = cleaned
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    return cleaned;
  }

  /**
   * Process canvas to remove watermark-like elements
   */
  async processCanvasForWatermarks(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Create a copy for processing
    const processedData = new Uint8ClampedArray(data);
    
    try {
      // Detect and remove semi-transparent overlays (common watermark technique)
      this.removeSemiTransparentOverlays(processedData, canvas.width, canvas.height);
      
      // Remove repetitive patterns (watermark text/logos)
      this.removeRepetitivePatterns(processedData, canvas.width, canvas.height);
      
      // Enhance contrast to reduce faded watermarks
      this.enhanceContrast(processedData);
      
      // Apply the processed data back to canvas
      const newImageData = new ImageData(processedData, canvas.width, canvas.height);
      ctx.putImageData(newImageData, 0, 0);
      
      return canvas;
    } catch (error) {
      console.warn('Watermark removal failed, using original image:', error);
      return canvas;
    }
  }

  /**
   * Remove semi-transparent overlays that might be watermarks
   */
  removeSemiTransparentOverlays(data, width, height) {
    const threshold = 50; // Transparency threshold
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Detect semi-transparent pixels that might be watermarks
      if (a < 255 && a > threshold) {
        const brightness = (r + g + b) / 3;
        
        // If it's a light semi-transparent overlay, make it more transparent
        if (brightness > 200) {
          data[i + 3] = Math.max(0, a - 100);
        }
      }
    }
  }

  /**
   * Remove repetitive patterns that might be watermark text
   */
  removeRepetitivePatterns(data, width, height) {
    // This is a simplified pattern detection
    // In a real implementation, you might use more sophisticated algorithms
    
    const blockSize = 20;
    const similarityThreshold = 0.9;
    
    for (let y = 0; y < height - blockSize; y += blockSize) {
      for (let x = 0; x < width - blockSize; x += blockSize) {
        const block1 = this.getImageBlock(data, x, y, blockSize, width);
        
        // Check for similar blocks (potential watermark repetition)
        for (let y2 = y + blockSize; y2 < height - blockSize; y2 += blockSize) {
          for (let x2 = x + blockSize; x2 < width - blockSize; x2 += blockSize) {
            const block2 = this.getImageBlock(data, x2, y2, blockSize, width);
            
            if (this.calculateBlockSimilarity(block1, block2) > similarityThreshold) {
              // Found repetitive pattern, reduce its opacity
              this.reduceBlockOpacity(data, x2, y2, blockSize, width);
            }
          }
        }
      }
    }
  }

  /**
   * Get a block of image data
   */
  getImageBlock(data, x, y, size, width) {
    const block = [];
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const index = ((y + dy) * width + (x + dx)) * 4;
        block.push(data[index], data[index + 1], data[index + 2], data[index + 3]);
      }
    }
    return block;
  }

  /**
   * Calculate similarity between two image blocks
   */
  calculateBlockSimilarity(block1, block2) {
    if (block1.length !== block2.length) return 0;
    
    let totalDiff = 0;
    for (let i = 0; i < block1.length; i += 4) {
      const diff = Math.abs(block1[i] - block2[i]) + 
                   Math.abs(block1[i + 1] - block2[i + 1]) + 
                   Math.abs(block1[i + 2] - block2[i + 2]);
      totalDiff += diff;
    }
    
    const maxDiff = block1.length * 3 * 255 / 4; // Maximum possible difference
    return 1 - (totalDiff / maxDiff);
  }

  /**
   * Reduce opacity of a block (to remove watermarks)
   */
  reduceBlockOpacity(data, x, y, size, width) {
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const index = ((y + dy) * width + (x + dx)) * 4;
        if (index + 3 < data.length) {
          data[index + 3] = Math.max(0, data[index + 3] - 100); // Reduce alpha
        }
      }
    }
  }

  /**
   * Enhance contrast to reduce faded watermarks
   */
  enhanceContrast(data) {
    const contrast = 1.2; // Contrast multiplier
    const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));     // Red
      data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128)); // Green
      data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128)); // Blue
    }
  }

  /**
   * Process PDF page to remove watermarks
   */
  async processPDFPage(page, scale = 1.5) {
    try {
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render the page
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Process the canvas to remove watermarks
      const processedCanvas = await this.processCanvasForWatermarks(canvas);
      
      return processedCanvas.toDataURL('image/jpeg', 0.9);
    } catch (error) {
      console.error('Error processing PDF page:', error);
      throw error;
    }
  }

  /**
   * Extract and clean metadata from PDF
   */
  async extractCleanMetadata(pdf) {
    try {
      const metadata = await pdf.getMetadata();
      const info = metadata.info;
      
      let title = info.Title || '';
      let author = info.Author || '';
      let subject = info.Subject || '';
      let creator = info.Creator || '';
      
      // Clean metadata
      title = this.cleanTextContent(title);
      author = this.cleanTextContent(author);
      subject = this.cleanTextContent(subject);
      creator = this.cleanTextContent(creator);
      
      // Try to extract author from different fields
      let finalAuthor = '';
      
      // Priority order: Author field, Creator field, then try to parse from title
      if (author && author.trim() && !this.isSystemGenerated(author)) {
        finalAuthor = this.cleanAuthorName(author);
      } else if (creator && creator.trim() && !this.isSystemGenerated(creator)) {
        finalAuthor = this.cleanAuthorName(creator);
      } else {
        // Try to extract author from title if it contains "by [author]" pattern
        finalAuthor = this.extractAuthorFromTitle(title);
      }
      
      return {
        title: title || null,
        author: finalAuthor || null,
        subject: subject || null,
        creator: creator || null,
        producer: info.Producer || null,
        creationDate: info.CreationDate || null,
        modificationDate: info.ModDate || null
      };
    } catch (error) {
      console.warn('Could not extract PDF metadata:', error);
      return {};
    }
  }

  /**
   * Check if author name is system-generated (should be ignored)
   */
  isSystemGenerated(author) {
    const systemPatterns = [
      /^user$/i,
      /^admin$/i,
      /^administrator$/i,
      /^owner$/i,
      /^default$/i,
      /^system$/i,
      /^computer$/i,
      /^pc$/i,
      /^laptop$/i,
      /^desktop$/i,
      /^windows$/i,
      /^microsoft$/i,
      /^adobe$/i,
      /^acrobat$/i,
      /^reader$/i,
      /^unknown$/i,
      /^anonymous$/i,
      /^\s*$/,
      /^[a-zA-Z]:\\/,  // Windows paths
      /^\/[a-zA-Z]/,   // Unix paths
    ];
    
    return systemPatterns.some(pattern => pattern.test(author.trim()));
  }

  /**
   * Clean and format author name
   */
  cleanAuthorName(author) {
    if (!author) return '';
    
    let cleaned = author.trim();
    
    // Remove common prefixes/suffixes
    cleaned = cleaned
      .replace(/^(by|author:?|written by|created by)\s*/i, '')
      .replace(/\s*(author|writer|creator)$/i, '')
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/["']/g, '') // Remove quotes
      .trim();
    
    // If it looks like an email, extract name part
    if (cleaned.includes('@')) {
      const emailMatch = cleaned.match(/^([^@]+)@/);
      if (emailMatch) {
        cleaned = emailMatch[1].replace(/[._]/g, ' ');
      }
    }
    
    // Capitalize properly
    cleaned = cleaned.replace(/\b\w+/g, word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    
    // Remove extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  /**
   * Try to extract author from title using common patterns
   */
  extractAuthorFromTitle(title) {
    if (!title) return '';
    
    // Common patterns for author in title
    const patterns = [
      /by\s+([^-\n\r]+?)(?:\s*[-–—]\s*|\s*$)/i,
      /author:?\s*([^-\n\r]+?)(?:\s*[-–—]\s*|\s*$)/i,
      /written\s+by\s+([^-\n\r]+?)(?:\s*[-–—]\s*|\s*$)/i,
      /([^-\n\r]+?)\s*[-–—]\s*author/i,
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        const author = this.cleanAuthorName(match[1]);
        if (author && !this.isSystemGenerated(author)) {
          return author;
        }
      }
    }
    
    return '';
  }

  /**
   * Generate a clean fallback cover without watermarks
   */
  generateCleanFallbackCover(title, author = '') {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // Create a clean gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 600);
    
    // Add subtle pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 400; i += 40) {
      for (let j = 0; j < 600; j += 40) {
        ctx.fillRect(i, j, 20, 20);
      }
    }
    
    // Add title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Word wrap title
    const words = title.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 350 && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    // Draw title lines
    const startY = 200;
    lines.forEach((line, index) => {
      ctx.fillText(line, 200, startY + (index * 40));
    });
    
    // Add author (only if provided)
    if (author && author.trim()) {
      ctx.font = '18px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(`by ${author}`, 200, 450);
    }
    
    // Add decorative elements
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 350);
    ctx.lineTo(350, 350);
    ctx.stroke();
    
    return canvas.toDataURL('image/jpeg', 0.9);
  }
}

// Export singleton instance
export const watermarkRemover = new WatermarkRemover();