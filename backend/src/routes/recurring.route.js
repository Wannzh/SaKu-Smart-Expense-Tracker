const { Router } = require("express");
const recurringController = require("../controllers/recurring.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const router = Router();

// Semua route transaksi berulang butuh autentikasi
router.use(authMiddleware);

router.get("/", recurringController.getRecurrings);
router.post("/", upload.single("image"), recurringController.createRecurring);
router.get("/:id", recurringController.getRecurringById);
router.put("/:id", upload.single("image"), recurringController.updateRecurring);
router.patch("/:id/toggle", recurringController.toggleStatus);
router.post("/:id/execute", recurringController.executeRecurring);
router.delete("/:id", recurringController.deleteRecurring);

module.exports = router;
