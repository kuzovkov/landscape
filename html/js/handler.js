/*модуль обработки событий интерфейса*/

var Handler = {};

Handler.init = function(app){
    Handler.app = app;
};

Handler.btnSaveCityClick = function(){
    alert('save');
};


    
Handler.btnDelCityClick = function(){
    alert('del-city');
};
    
Handler.btnDelMarkersClick = function(){
     alert('del-markers');   
};
    


/**
* обработка клика на карте
**/
Handler.mapClick = function(e){
    if (Handler.app.iface.getRadio('task') == 'view'){
        if (Handler.app.point != null){
            Handler.app.map.removeLayer(Handler.app.point);
            Handler.app.point = null;
        }
        var point = {lat:e.latlng.lat, lng:e.latlng.lng};
        Handler.app.point = L.marker(L.latLng(point.lat, point.lng), {draggable:true}).addTo(Handler.app.map.map);
        //clearAllNodes();
        //clearAllRoads();
        Handler.app.searchCity(point);
        Handler.app.point.on('dragend',function(e){
            var point = {lat:0, lng: 0};
            point.lat = Handler.app.point.getLatLng().lat;
            point.lng = Handler.app.point.getLatLng().lng;
            Handler.app.searchCity(point);
        });
        
    }else{
        
    }         
};