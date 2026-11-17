function GEOCODE_LAT(address) {
  if (!address) return "";
  var results = Maps.newGeocoder().geocode(address);
  return results.results[0] ? results.results[0].geometry.location.lat : "";
  }

function GEOCODE_LNG(address) {
    if (!address) return "";
    var results = Maps.newGeocoder().geocode(address);
    return results.results[0] ? results.results[0].geometry.location.lng : "";
    }
