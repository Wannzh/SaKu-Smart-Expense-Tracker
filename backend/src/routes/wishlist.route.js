const { Router } = require("express");
const wishlistController = require("../controllers/wishlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const router = Router();

// Semua route wishlist (keinginan) butuh autentikasi
router.use(authMiddleware);

router.get("/", wishlistController.getWishlists);
router.post("/", upload.single("image"), wishlistController.createWishlist);
router.get("/:id", wishlistController.getWishlistById);
router.put("/:id", upload.single("image"), wishlistController.updateWishlist);
router.post("/:id/savings", wishlistController.addSavings);
router.delete("/:id", wishlistController.deleteWishlist);

module.exports = router;
