const fs = require("fs");
const path = require("path");
const CVS_DIR = "../../CVS/mycvs";

function status() {

    if (!fs.existsSync(CVS_DIR)) {
        console.log("No Repository  exists! so can not tell about branch");
    } else {
        const targetBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
        console.log(targetBranch);
    }
}
module.exports={status};