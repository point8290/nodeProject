const { Router } = require("express");
const controller = require("./controller");

const router = Router();

router.post("/add_contacts", controller.addContacts);

router.get("/find_common_users", controller.findCommonUsers);

router.post("/get_contacts", controller.getContacts);

module.exports = router;
