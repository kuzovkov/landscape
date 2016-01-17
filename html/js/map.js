/**Модуль для работы с картой**/
var Map = {};
Map.Center = [56.605, 47.9];
Map.zoom = 13;
Map.maxZoom = 16;               /*максимальный масштаб*/
Map.minZoom = 5;             /*минимальный масштаб*/
Map.id = 'examples.map-zr0njcqy'; /*ключ*/
Map.map = null;


Map.init = function(center){
    if (center != undefined ) Map.Center = center;
    Map.map = L.map('map-block').setView( Map.Center, Map.zoom );

    //создаем tile-слой и добавляем его на карту 
    Map.mapbox = L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
        maxZoom: Map.maxZoom,
        minZoom: Map.minZoom,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: Map.id
    });
    
    //создаем другие базовые слои от других провайдеров     
    Map.osmde = L.tileLayer.provider('OpenStreetMap.DE',{maxZoom: Map.maxZoom, minZoom: Map.minZoom});
    Map.osmBW = L.tileLayer.provider('OpenStreetMap.BlackAndWhite',{maxZoom: Map.maxZoom, minZoom: Map.minZoom});
     /*создаем tile-слои Google*/ 
    Map.ersiwi = L.tileLayer.provider('Esri.WorldImagery',{maxZoom: Map.maxZoom, minZoom: Map.minZoom});
    Map.ggl = new L.Google('SATELLITE',{maxZoom: Map.maxZoom, minZoom: Map.minZoom});
    Map.ggl2 = new L.Google('TERRAIN',{maxZoom: Map.maxZoom, minZoom: Map.minZoom});
    Map.map.addLayer(Map.ggl2);
    //создаем контрол для переключения слоев
    Map.baseLayers =    {
                            "OpenStreetMap": Map.osmde,
                            "Mapbox": Map.mapbox,
                            "OpenStreetMap Black and White": Map.osmBW,
                            'Esri WorldImagery': Map.ersiwi,
                             "Google Satellite": Map.ggl,
                            "Google Terrain": Map.ggl2
                        };

    L.control.layers(Map.baseLayers).addTo(Map.map);
};

Map.addListener = function(event, handler){
    Map.map.addEventListener(event, handler, this);
}

Map.removeListener = function(event){
    Map.map.removeEventListener(event);
};

Map.removeListeners = function(){
    Map.map.clearAllEventListeners();
};

Map.addListenerOnce = function(event, handler){
    Map.map.addOneTimeEventListener(event, handler, this);
};

Map.removeLayer = function(layer){
    Map.map.removeLayer(layer);
};

Map.setCenter = function(center){
    Map.Center = center;
    Map.map.setView(Map.Center, Map.zoom);
};