(function () {
	'use strict';

	// Browserify
	// var L = require('leaflet');
	// var polyline = require('polyline');

	L.Routing = L.Routing || {};

	L.Routing.OpenRouteServiceV2 = L.Class.extend({
        /**
         * Contructor
         * @param {String} apiKey Api key (you can get it from official website https://openrouteservice.org/)
         * @param {Object} orsOptions Options for calculate the route (Valid options https://openrouteservice.org/dev/#/api-docs/v2/directions/{profile}/post)
         */
		initialize: function (apiKey, orsOptions, options) {
			this._apiKey = apiKey;
			this._orsOptions = orsOptions;
			L.Util.setOptions(this, options);
		},
        /**
         * First to execute, calculetes the route and send it to print
         * @param {Object} waypoints Destinations
         * @param {Object} callback 
         * @param {Object} context 
         */
		route: function (waypoints, callback, context) {
			var wps = [];

			// Creates the object with the API_key
			// Import JS from https://github.com/GIScience/openrouteservice-js
			let orsDirections = new Openrouteservice.Directions({
				api_key: this._apiKey,
			});

			// Change the coordenades from LatLng to LngLat and save it on the object
			let coordinates = []
			waypoints.forEach(element => {
				coordinates.push(
					[
						element.latLng.lng,
						element.latLng.lat,
					]
				)
			});

			this._orsOptions.coordinates = coordinates;

			// Calculates the route
			orsDirections.calculate(this._orsOptions)
				.then(L.bind(function (json) {
					// Add your own result handling here if needed
					let routes = JSON.parse(JSON.stringify(json));

					// Printamos la ruta
					this._routeDone(routes, wps, callback, context);
				}, this))
				.catch(function (err) {
					// Error!
					console.error(err);
				});

			return this;
		},
        /**
         * Route calculated, now print to map
         * @param {Object} response JSON response
         * @param {Object} inputWaypoints Waypoint to put
         * @param {Object} callback 
         * @param {Object} context 
         */
		_routeDone: function (response, inputWaypoints, callback, context) {
			var alts = [],
				waypoints,
				waypoint,
				coordinates,
				i, j, k,
				instructions,
				distance,
				time,
				leg,
				steps,
				step,
				startingSearchIndex,
				instruction,
				path;

			context = context || callback;

			if (!response.routes) {
				callback.call(context, {
					status: response.type,
					message: response.details
				});
				return;
			}

			for (i = 0; i < response.routes.length; i++) {
				path = response.routes[i];
				coordinates = this._decodePolyline(path.geometry);
				startingSearchIndex = 0;
				instructions = [];
				waypoints = [];
				time = 0;
				distance = 0;

				for (j = 0; j < path.segments.length; j++) {
					leg = path.segments[j];
					steps = leg.steps;
					for (k = 0; k < steps.length; k++) {
						step = steps[k];
						distance += step.distance;
						time += step.duration;
						instruction = this._convertInstructions(step, coordinates);
						instructions.push(instruction);
						waypoint = coordinates[path.way_points[1]];
						waypoints.push(waypoint);
					}
				}

				alts.push({
					name: 'Route: ' + (i + 1),
					coordinates: coordinates,
					instructions: instructions,
					summary: {
						totalDistance: distance,
						totalTime: time,
					},
					inputWaypoints: inputWaypoints,
					waypoints: waypoints
				});
			}

			callback.call(context, null, alts);
		},
        /**
         * Code from https://github.com/GIScience/openrouteservice-docs#geometry-decoding
         * Decode an x,y or x,y,z encoded polyline
         * @param {*} encodedPolyline
         * @param {Boolean} includeElevation - true for x,y,z polyline
         * @returns {Array} of coordinates
         */
		_decodePolyline: function (encodedPolyline, includeElevation = false) {
			// array that holds the points
			let points = []
			let index = 0
			const len = encodedPolyline.length
			let lat = 0
			let lng = 0
			let ele = 0
			while (index < len) {
				let b
				let shift = 0
				let result = 0
				do {
					b = encodedPolyline.charAt(index++).charCodeAt(0) - 63 // finds ascii
					// and subtract it by 63
					result |= (b & 0x1f) << shift
					shift += 5
				} while (b >= 0x20)

				lat += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
				shift = 0
				result = 0
				do {
					b = encodedPolyline.charAt(index++).charCodeAt(0) - 63
					result |= (b & 0x1f) << shift
					shift += 5
				} while (b >= 0x20)
				lng += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))

				if (includeElevation) {
					shift = 0
					result = 0
					do {
						b = encodedPolyline.charAt(index++).charCodeAt(0) - 63
						result |= (b & 0x1f) << shift
						shift += 5
					} while (b >= 0x20)
					ele += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
				}
				try {
					let location = [(lat / 1E5), (lng / 1E5)]
					if (includeElevation) location.push((ele / 100))
					points.push(location)
				} catch (e) {
					console.log(e)
				}
			}
			return points
		},
		_convertInstructions: function (step, coordinates) {
			return {
				text: step.instruction,
				distance: step.distance,
				time: step.duration,
				index: step.way_points[0]
			};
		},
	});

	L.Routing.openrouteserviceV2 = function (apiKey, orsOptions, options) {
		return new L.Routing.OpenRouteServiceV2(apiKey, orsOptions, options);
	};

	// Browserify
	// module.exports = L.Routing.OpenRouteServiceV2;
})();