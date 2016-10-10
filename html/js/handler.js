/*модуль обработки событий интерфейса*/

var Handler = {};

Handler.init = function(app){
    Handler.app = app;
};

/**
 * Отправка запроса на сервер для сохранения изменений в базу
 * */
Handler.btnSaveObjClick = function(){
    Handler.app.saveChange();
};


/**
 * удаление текущего города из базы
 **/    
Handler.btnDelObjClick = function(){
    Handler.app.delObj();
};
    
/**
 * удаление маркеров с карты 
 **/
Handler.btnDelMarkersClick = function(){
    App.delBoundaryMarkers();
    App.hideTempPolygon();
    App.hideObjPolygon();
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
        Handler.app.searchObj(point);
        Handler.app.point.on('dragend',function(e){
            var point = {lat:0, lng: 0};
            point.lat = Handler.app.point.getLatLng().lat;
            point.lng = Handler.app.point.getLatLng().lng;
            Handler.app.searchObj(point);
        });
        
    }else{
         if (Handler.app.point != null){
            Handler.app.map.removeLayer(Handler.app.point);
            Handler.app.point = null;
        }
        var point = {lat:e.latlng.lat, lng:e.latlng.lng};
        Handler.app.addBoundaryMarker(point);
        Handler.app.showTempPolygon(Handler.app.boundaryMarkers);
    }         
};