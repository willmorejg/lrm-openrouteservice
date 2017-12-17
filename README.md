Leaflet Routing Machine / OpenRoute Service
===========================================

NOTE: As of the latest commit, this is a preliminary implementation. For example, there is NO Browserfy implementation at this time, as is the norm for other extentions of the Leaflet Routing Machine.

Author: [James G. Willmore](mailto:willmorejg@gmail.com?subject=lrm-openrouteservice%20inquiry)

License: [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

Extends [Leaflet Routing Machine](https://github.com/perliedman/leaflet-routing-machine) with support for [OpenRoute Service](https://go.openrouteservice.org/) routing API.

Some brief instructions follow below, but the [Leaflet Routing Machine tutorial on alternative routers](http://www.liedman.net/leaflet-routing-machine/tutorials/alternative-routers/) is recommended.

## Installing

Put the script [L.Routing.OpenRouteService.js](lrm-openrouteservice/L.Routing.OpenRouteService.js) after Leaflet and Leaflet Routing Machine has been loaded.

## Using

There's a single class exported by this module, `L.Routing.OpenRouteService`. It implements the [`IRouter`](http://www.liedman.net/leaflet-routing-machine/api/#irouter) interface. Use it to replace Leaflet Routing Machine's default OSRM router implementation:

```javascript
L.Routing.control({
    router: new L.Routing.openrouteservice('api key'),
}).addTo(map);
```

Note that you will need to pass a valid OpenRoute Service api key to the constructor.
