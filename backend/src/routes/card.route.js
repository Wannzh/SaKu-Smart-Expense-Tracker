const { Router } = require("express");
const cardController = require("../controllers/card.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Semua route kartu butuh autentikasi
router.use(authMiddleware);

router.get("/", cardController.getCards);
router.post("/", cardController.createCard);
router.get("/:id", cardController.getCardById);
router.put("/:id", cardController.updateCard);
router.patch("/:id/pin", cardController.togglePinToTop);
router.delete("/:id", cardController.deleteCard);

module.exports = router;
