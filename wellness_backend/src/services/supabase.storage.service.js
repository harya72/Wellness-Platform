
const { getSupabaseAdmin } = require('../config/supabase');


const BUCKET_NAME = 'meals';
const UPLOAD_FOLDER = 'calorie-tracker/meals';

/**
 * Upload an image buffer to Supabase Storage
 * @param {Buffer} buffer - Image data as buffer
 * @param {Object} options - Upload options
 * @param {string} [options.folder] - Folder to upload to
 * @param {string} [options.publicId] - Custom public ID
 * @returns {Promise<Object>} - Upload result with URL and public ID
 */
const uploadImage = async (buffer, options = {}) => {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('Supabase admin client is not configured.');
  }

  const folder = options.folder || UPLOAD_FOLDER;
  const publicId = options.publicId || `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const filePath = `${folder}/${publicId}.jpg`;

  try {
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      publicId: filePath,
      width: null,
      height: null,
      format: 'jpg',
      size: buffer.length,
    };
  } catch (error) {
    console.error('Supabase upload error:', error);
    throw error;
  }
};


const uploadFromPath = async (filePath, options = {}) => {
  throw new Error('Not implemented for Supabase storage');
};

/**
 * Delete an image from Supabase Storage
 * @param {string} publicId - Supabase storage file path (folder/id.jpg)
 * @returns {Promise<Object>} - Deletion result
 */
const deleteImage = async (publicId) => {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('Supabase admin client is not configured');
  }

  try {
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .remove([publicId]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    return {
      success: true,
      result: 'ok',
    };
  } catch (error) {
    console.error('Supabase delete error:', error);
    throw error;
  }
};

/**
 * Extract public ID from Supabase URL
 * @param {string} url - Supabase Storage URL
 * @returns {string|null} - Public ID or null
 */
const extractPublicIdFromUrl = (url) => {
  if (!url || !url.includes('supabase.co')) {
    return null;
  }

  try {
    const bucketToken = `/public/${BUCKET_NAME}/`;
    const bucketIndex = url.indexOf(bucketToken);

    if (bucketIndex === -1) return null;

    const publicId = url.substring(bucketIndex + bucketToken.length);
    return publicId; // e.g., 'calorie-tracker/meals/1234.jpg'
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

/**
 * Generate a thumbnail URL from an existing image
 * Since Supabase storage transformations require Pro plan, we just return the URL.
 * @param {string} publicId - Supabase storage path
 * @param {Object} options - Thumbnail options
 * @returns {string} - Thumbnail URL
 */
const getThumbnailUrl = (publicId, options = {}) => {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = supabase
    .storage
    .from(BUCKET_NAME)
    .getPublicUrl(publicId);

  return data.publicUrl;
};

module.exports = {
  uploadImage,
  uploadFromPath,
  deleteImage,
  extractPublicIdFromUrl,
  getThumbnailUrl,
};
