// ========================================
// FUTURISTIC ML CLASSIFIER - JAVASCRIPT
// ========================================

// DOM Elements
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const uploadBox = document.getElementById('upload-box');
const previewContainer = document.getElementById('preview-container');
const removeBtn = document.getElementById('remove-btn');
const classifyBtn = document.getElementById('classify-btn');
const buttonText = document.getElementById('button-text');
const resultsSection = document.getElementById('results-section');
const predictionResult = document.getElementById('prediction-result');
const confidenceScore = document.getElementById('confidence-score');
const confidenceFill = document.getElementById('confidence-fill');
const processingOverlay = document.getElementById('processing-overlay');

// API Configuration
const CLASSIFY_API_URL = '/classify';

// State Management
let currentImage = null;
let isProcessing = false;

// ========================================
// INITIALIZATION
// ========================================

function init() {
    console.log('🚀 AI Vision Classifier Initialized');
    
    // Event Listeners
    imageUpload.addEventListener('change', handleImageUpload);
    removeBtn.addEventListener('click', handleRemoveImage);
    classifyBtn.addEventListener('click', handleClassify);
    
    // Drag and Drop
    uploadBox.addEventListener('dragover', handleDragOver);
    uploadBox.addEventListener('dragleave', handleDragLeave);
    uploadBox.addEventListener('drop', handleDrop);
    
    // Prevent default drag behavior on body
    document.body.addEventListener('dragover', (e) => e.preventDefault());
    document.body.addEventListener('drop', (e) => e.preventDefault());
}

// ========================================
// IMAGE UPLOAD HANDLERS
// ========================================

/**
 * Handle file input change
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file && validateFile(file)) {
        displayImage(file);
    } else {
        showError('Please select a valid image file (JPG, PNG, GIF, WebP)');
    }
}

/**
 * Validate file type and size
 */
function validateFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
        return false;
    }
    
    if (file.size > maxSize) {
        showError('File size must be less than 10MB');
        return false;
    }
    
    return true;
}

/**
 * Handle drag over event
 */
function handleDragOver(event) {
    event.preventDefault();
    uploadBox.style.borderColor = 'var(--primary-cyan)';
    uploadBox.style.background = 'rgba(0, 242, 255, 0.1)';
    uploadBox.style.transform = 'scale(1.02)';
}

/**
 * Handle drag leave event
 */
function handleDragLeave(event) {
    event.preventDefault();
    resetUploadBoxStyle();
}

/**
 * Handle drop event
 */
function handleDrop(event) {
    event.preventDefault();
    resetUploadBoxStyle();
    
    const file = event.dataTransfer.files[0];
    if (file && validateFile(file)) {
        // Manually set the file to the input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        imageUpload.files = dataTransfer.files;
        
        displayImage(file);
    }
}

/**
 * Reset upload box style
 */
function resetUploadBoxStyle() {
    uploadBox.style.borderColor = 'rgba(0, 242, 255, 0.3)';
    uploadBox.style.background = 'rgba(0, 242, 255, 0.02)';
    uploadBox.style.transform = 'scale(1)';
}

/**
 * Display uploaded image with animation
 */
function displayImage(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        currentImage = e.target.result;
        imagePreview.src = currentImage;
        
        // Show preview with animation
        setTimeout(() => {
            uploadBox.style.display = 'none';
            previewContainer.classList.add('active');
            classifyBtn.disabled = false;
        }, 100);
        
        // Reset results
        resetResults();
        
        console.log('✅ Image loaded successfully');
    };
    
    reader.onerror = function() {
        showError('Failed to read image file');
        console.error('❌ FileReader error');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Handle remove image button
 */
function handleRemoveImage(event) {
    event.stopPropagation();
    
    // Reset state
    currentImage = null;
    imagePreview.src = '#';
    imageUpload.value = '';
    
    // Reset UI
    previewContainer.classList.remove('active');
    setTimeout(() => {
        uploadBox.style.display = 'block';
    }, 300);
    
    classifyBtn.disabled = true;
    resetResults();
    
    console.log('🗑️ Image removed');
}

// ========================================
// CLASSIFICATION
// ========================================

/**
 * Handle classify button click
 */
async function handleClassify() {
    if (!currentImage || isProcessing) {
        return;
    }

    console.log('🔍 Starting classification...');
    
    // Set processing state
    isProcessing = true;
    setLoadingState(true);
    showProcessingOverlay();

    try {
        // Simulate minimum processing time for better UX
        const [response] = await Promise.all([
            fetchClassification(),
            new Promise(resolve => setTimeout(resolve, 2000))
        ]);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log('📊 Classification Result:', result);

        // Display results
        displayResults(result);

    } catch (error) {
        console.error('❌ Classification Error:', error);
        showError(error.message || 'Failed to classify image. Please try again.');
    } finally {
        isProcessing = false;
        setLoadingState(false);
        hideProcessingOverlay();
    }
}

/**
 * Fetch classification from API
 */
async function fetchClassification() {
    return fetch(CLASSIFY_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: currentImage }),
    });
}

/**
 * Set button loading state
 */
function setLoadingState(isLoading) {
    if (isLoading) {
        classifyBtn.classList.add('loading');
        classifyBtn.disabled = true;
    } else {
        classifyBtn.classList.remove('loading');
        classifyBtn.disabled = false;
    }
}

/**
 * Show processing overlay
 */
function showProcessingOverlay() {
    processingOverlay.classList.add('active');
}

/**
 * Hide processing overlay
 */
function hideProcessingOverlay() {
    setTimeout(() => {
        processingOverlay.classList.remove('active');
    }, 500);
}

// ========================================
// RESULTS DISPLAY
// ========================================

/**
 * Display classification results
 */
function displayResults(result) {
    resultsSection.classList.add('active');

    if (result.isCatOrDog) {
        const prediction = result.message.toLowerCase();
        const confidence = result.confidence * 100;

        // Update prediction with animation
        predictionResult.textContent = result.message;
        
        // Apply styling based on prediction
        if (prediction.includes('cat') || prediction.includes('🐱')) {
            predictionResult.className = 'result-value cat';
        } else if (prediction.includes('dog') || prediction.includes('🐕')) {
            predictionResult.className = 'result-value dog';
        } else {
            predictionResult.className = 'result-value';
        }

        // Update confidence score
        confidenceScore.textContent = `${confidence.toFixed(2)}%`;
        
        // Animate confidence bar
        setTimeout(() => {
            confidenceFill.style.width = `${Math.min(confidence, 100)}%`;
        }, 100);

        console.log(`✅ Prediction: ${result.message} (${confidence.toFixed(2)}%)`);

    } else {
        // Handle unknown/neither case
        predictionResult.textContent = result.message || 'Unknown';
        predictionResult.className = 'result-value unknown';
        
        const confidence = (result.confidence || 0) * 100;
        confidenceScore.textContent = `${confidence.toFixed(2)}%`;
        
        setTimeout(() => {
            confidenceFill.style.width = `${Math.min(confidence, 100)}%`;
        }, 100);

        console.log(`⚠️ Result: ${result.message}`);
    }
}

/**
 * Show error message
 */
function showError(message) {
    resultsSection.classList.add('active');
    
    predictionResult.textContent = 'Error';
    predictionResult.className = 'result-value error';
    
    confidenceScore.textContent = message;
    confidenceFill.style.width = '0%';
    
    console.error('❌ Error:', message);
}

/**
 * Reset results section
 */
function resetResults() {
    resultsSection.classList.remove('active');
    predictionResult.textContent = '---';
    predictionResult.className = 'result-value';
    confidenceScore.textContent = '---';
    confidenceFill.style.width = '0%';
}

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

document.addEventListener('keydown', (event) => {
    // Press 'U' to trigger upload
    if (event.key === 'u' || event.key === 'U') {
        if (!previewContainer.classList.contains('active')) {
            imageUpload.click();
        }
    }
    
    // Press 'Enter' to classify
    if (event.key === 'Enter') {
        if (!classifyBtn.disabled && !isProcessing) {
            handleClassify();
        }
    }
    
    // Press 'Escape' to remove image
    if (event.key === 'Escape') {
        if (previewContainer.classList.contains('active')) {
            handleRemoveImage(event);
        }
    }
});

// ========================================
// INITIALIZE APP
// ========================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Console welcome message
console.log(`
%c🤖 AI VISION CLASSIFIER %c
%cNeural Network Image Recognition System
%cVersion 2.0 - Powered by Machine Learning
`,
'background: linear-gradient(135deg, #00f2ff 0%, #a02aff 100%); color: white; padding: 10px 20px; font-size: 20px; font-weight: bold;',
'',
'color: #00f2ff; font-size: 14px;',
'color: #94a3b8; font-size: 12px;'
);
