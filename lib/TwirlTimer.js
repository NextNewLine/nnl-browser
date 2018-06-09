var twirl;

function start() {
	if (twirl) {
		return;
	}
	twirl = twirlTimer();
}

function stop() {
	if (!twirl) {
		return;
	}

	clearInterval(twirl);
	process.stdout.write("\r\r\r\r\r");

}

var twirlTimer = function() {
	var P = ["Ajax \\", "Ajax |", "Ajax /", "Ajax -"];
	var x = 0;
	return setInterval(function() {
		process.stdout.write("\r\r\r\r\r" + P[x++]);
		x &= 3;
	}, 100);
};

module.exports = {
	start,
	stop
};