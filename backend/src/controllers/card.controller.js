const cardService = require("../services/card.service");
const { sendSuccess } = require("../utils/response");

/**
 * GET /api/cards
 * Get list of cards with optional provider filter.
 */
const getCards = async (req, res, next) => {
  try {
    const { provider } = req.query;
    const result = await cardService.getCards(req.user.id, { provider });
    sendSuccess(res, 200, "Daftar kartu berhasil diambil", result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cards/:id
 * Get single card by ID.
 */
const getCardById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const card = await cardService.getCardById(req.user.id, id);
    sendSuccess(res, 200, "Detail kartu berhasil diambil", { card });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cards
 * Create a new card.
 */
const createCard = async (req, res, next) => {
  try {
    const card = await cardService.createCard(req.user.id, req.body);
    sendSuccess(res, 201, "Kartu berhasil disimpan", { card });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/cards/:id
 * Update card details.
 */
const updateCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const card = await cardService.updateCard(req.user.id, id, req.body);
    sendSuccess(res, 200, "Kartu berhasil diperbarui", { card });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/cards/:id/pin
 * Toggle pin status.
 */
const togglePinToTop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const card = await cardService.togglePinToTop(req.user.id, id);
    sendSuccess(res, 200, "Status sematan kartu berhasil diperbarui", { card });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cards/:id
 * Delete a card.
 */
const deleteCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const card = await cardService.deleteCard(req.user.id, id);
    sendSuccess(res, 200, "Kartu berhasil dihapus", { card });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCards,
  getCardById,
  createCard,
  updateCard,
  togglePinToTop,
  deleteCard,
};
