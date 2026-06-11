const wishlistService = require("../services/wishlist.service");
const { sendSuccess } = require("../utils/response");
const { uploadToCloudinary } = require("../utils/cloudinary");

/**
 * GET /api/wishlists
 * Get list of wishlists with optional status and priority filters.
 */
const getWishlists = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const result = await wishlistService.getWishlists(req.user.id, { status, priority });
    sendSuccess(res, 200, "Daftar keinginan berhasil diambil", result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/wishlists/:id
 * Get a single wishlist by ID.
 */
const getWishlistById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const wishlist = await wishlistService.getWishlistById(req.user.id, id);
    sendSuccess(res, 200, "Detail keinginan berhasil diambil", { wishlist });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/wishlists
 * Create a new wishlist item.
 */
const createWishlist = async (req, res, next) => {
  try {
    const { name, targetPrice, savedAmount, priority, productLink, notes, targetDate, walletId } = req.body;
    
    let uploadedImageUrl = null;
    if (req.file) {
      uploadedImageUrl = await uploadToCloudinary(req.file.buffer, "wishlist");
    }

    const wishlist = await wishlistService.createWishlist(req.user.id, {
      name,
      targetPrice,
      savedAmount,
      priority,
      imageUrl: uploadedImageUrl,
      productLink,
      notes,
      targetDate,
      walletId,
    });
    sendSuccess(res, 201, "Keinginan berhasil ditambahkan", { wishlist });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/wishlists/:id
 * Update a wishlist item.
 */
const updateWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      const uploadedImageUrl = await uploadToCloudinary(req.file.buffer, "wishlist");
      updateData.imageUrl = uploadedImageUrl;
    }

    const wishlist = await wishlistService.updateWishlist(req.user.id, id, updateData);
    sendSuccess(res, 200, "Keinginan berhasil diperbarui", { wishlist });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/wishlists/:id/savings
 * Add savings to a wishlist item.
 */
const addSavings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, walletId } = req.body;
    const wishlist = await wishlistService.addSavings(req.user.id, id, amount, walletId);
    sendSuccess(res, 200, "Tabungan berhasil ditambahkan", { wishlist });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/wishlists/:id
 * Delete a wishlist item.
 */
const deleteWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const wishlist = await wishlistService.deleteWishlist(req.user.id, id);
    sendSuccess(res, 200, "Keinginan berhasil dihapus", { wishlist });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlists,
  getWishlistById,
  createWishlist,
  updateWishlist,
  addSavings,
  deleteWishlist,
};
