const YAML = require("yaml");
const fs = require("fs");

const conf = fs.readFileSync(__dirname + "/../../../../config.yaml", "utf8");
var res = YAML.parse(conf);

var data = {
	emoji: require("../../../node_modules/emojibase-data/en/compact.json"),
	config: res,
};

module.exports = data;
