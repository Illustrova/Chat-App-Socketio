// Geolocation solution source:
// http://phillippuleo.com/articles/obtaining-visitor-location-html5-geolocation-api

const TIMEOUT = 50000;
const getByGeo = function () {
	// Start a timer to ensure we get some kind of response.
	// Make sure to clear this timer in your success and error handlers
	var location_timeout = setTimeout(function () {
		// eslint-disable-next-line no-console
		console.error("Connection timeout");
	}, TIMEOUT);
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			(response) => resolve(findAddress(response)),
			(err) => reject(err),
			{
				timeout: TIMEOUT,
			}
		);

		function findAddress(response) {
			clearTimeout(location_timeout);
			return fetch(
				`https://nominatim.openstreetmap.org/reverse?lat=${response.coords.latitude}&lon=${response.coords.longitude}&format=json&zoom=10&accept-language=en`
			)
				.then(handleFetchErrors)
				.then((response) => response.json())
				.then((geodata) => {
					let mydata = {
						city: geodata.address.city,
						region: geodata.address.state ? geodata.address.state : "",
						country: geodata.address.country,
					};
					return mydata;
				});
		}
	});
};

const getByIP = function () {
	return fetch("https://ipapi.co/json")
		.then(handleFetchErrors)
		.then((response) => response.json())
		.then((ipData) => {
			return {
				city: ipData.city,
				region: ipData.region,
				country: ipData.country_name,
			};
		})
		.catch((err) => {
			throw err;
		});
};

//www.tjvantoll.com/2015/09/13/fetch-and-errors/#comment-2254295840
function handleFetchErrors(response) {
	if (!response.ok) {
		throw Error(response.statusText ? response.statusText : response.status);
	}
	return response;
}

exports.getByIP = getByIP;
exports.getByGeo = getByGeo;
