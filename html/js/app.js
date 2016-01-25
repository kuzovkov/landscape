/**основной модуль приложения**/
var App = {};
App.iface = {};
App.ObjPoly = null;  //мультиполигон(полигон) объекта
App.point = null;//маркер произвольной точки
App.Obj_list = [];//список объектов (массив объектов)
App.Obj = null; //объект объекта
App.iface.boundaryIcon = L.icon({ //иконка флажка для обозначения границы
    iconUrl: 'img/flag32.png',
    iconRetinaUrl: 'img/flag32.png',
    iconSize: [32, 32],
    iconAnchor: [0, 32],
    popupAnchor: [0, 32]
});

App.tempPolygonStyle = {
    "color": "#ff7800",
    "weight": 2,
    "opaObj": 0.65
};

App.boundaryMarkers = [];//массив для хранения объектов маркеров обозначающих границу
App.tempPolygonGeoJSON = null; //объект для хранения GeoJSON временного полигона
App.tempPolygon = null; //объект для хранения временного полигона

App.init = function(){
    App.map = Map;
    App.map.init(['47.7097615426664', '30.728759765625']);
    
    App.iface.btnDelObj = document.getElementById('del-obj');
    App.iface.btnSaveObj = document.getElementById('save-obj');
    App.iface.btnDelMarkers = document.getElementById('del-markers');
    App.iface.inputObjName = document.getElementById('obj-name');
    App.iface.inputObjSubtype = document.getElementById('obj-subtype');
    App.iface.inputObjCountry = document.getElementById('obj-country');
    App.iface.selectObjList = document.getElementById('obj-list');
    App.iface.btnSaveObj.onclick = Handler.btnSaveObjClick;
    App.iface.btnDelObj.onclick = Handler.btnDelObjClick;
    App.iface.btnDelMarkers.onclick = Handler.btnDelMarkersClick;
    App.iface.selectObjList.onchange = App.getObj;
    App.map.addListener('click', Handler.mapClick);
    App.iface.addRadioListener('task', App.switchMode);
    App.switchMode();
    App.iface.preloader = document.getElementById('preloader');
    App.iface.time = document.getElementById('time');
    App.getList();
   
};


/**
* показ элемента
**/
App.iface.showElem = function(el){
    el.style.display = 'inline-block';
};

/**
* скрытие элемента
**/
App.iface.hideElem = function(el){
    el.style.display = 'none';
};

/**
 * удаление маркеров обозначающих границу
 * */
App.delBoundaryMarkers = function(){
    for (var i = 0; i < App.boundaryMarkers.length; i++){
        App.map.removeLayer(App.boundaryMarkers[i]);
    }
    App.boundaryMarkers = [];
};

/**
* Получение значение радио переключателя вида задачи
* @param name атрибут name радиокнопки 
* @return значение
**/
App.iface.getRadio = function(name){
    var inputs = document.getElementsByTagName('input');
    for ( var i = 0; i < inputs.length; i++ ){
        if ( inputs[i].attributes.name.value == name )
            if ( inputs[i].attributes.type.value == 'radio' )
                if( inputs[i].checked ) return inputs[i].value;
    }
    return null;
};


/**
 * установка обработчиков на переключение радиокнопки
 **/
App.iface.addRadioListener = function(name, handler){
    var inputs = document.getElementsByTagName('input');
    for ( var i = 0; i < inputs.length; i++ ){
        if ( inputs[i].attributes.name.value == name )
            if ( inputs[i].attributes.type.value == 'radio' )
                inputs[i].addEventListener('change', handler);
    }
};


App.switchMode = function(){
    var radio = App.iface.getRadio('task');
    //console.log(radio);
    if (radio == 'view'){
        document.getElementById('buttons').style.display = 'none';
        App.delBoundaryMarkers();
        App.hideTempPolygon();
        App.showObjPolygon();
    }else{
        document.getElementById('buttons').style.display = 'block';
        App.hideObjPolygon();
        App.createMarkersFromObj();
        App.showTempPolygon(App.boundaryMarkers);
    }
};


/**
* определение принадлежности заданной точки к объекту 
* @param point заданная точка {lat:lat, lng:lng}
**/
App.searchObj = function(point){
    App.iface.showElem(App.iface.preloader);
    Time.start();
    Request.searchObj(point, function(result){
        App.iface.hideElem(App.iface.preloader);
        App.iface.time.textContent = Time.stop() + ' мс';
        App.iface.time.innerText = Time.stop() + ' мс';
        //console.log(JSON.stringify(result));
        if ( result.res == true ){
            App.hideObj();
            App.showObj(result);
            
        }else{
            App.hideObj();
        }
        App.getList();
    });
};

/**
 * получения объекта по его id
 **/
App.getObj = function(){
    var id = App.iface.selectObjList.value;
    App.iface.showElem(App.iface.preloader);
    Request.getObj(id, App.showObj2);
};

/**
 * Показать границы объекта на карте 
 **/
App.showObj = function(result){
    App.hideObj();
    App.Obj = result;
    App.ObjPoly = L.geoJson(result.geometry).addTo(Map.map);
    App.iface.inputObjName.value = result.name;
    App.iface.inputObjLastname.value = result.sub_type;
    App.iface.inputObjCountry.value = result.country;
};

/**
 * Показать границы объекта на карте 
 **/
App.showObj2 = function(result){
    App.iface.hideElem(App.iface.preloader);
    App.hideObj();
    App.map.setCenter([result.avg_lat, result.avg_lng]);
    App.Obj = result;
    if (App.iface.getRadio('task') == 'view'){
        App.ObjPoly = L.geoJson(result.geometry).addTo(Map.map);
    }
    App.iface.inputObjName.value = result.name;
    App.iface.inputObjLastname.value = result.sub_type;
    App.iface.inputObjCountry.value = result.country;
};


/**
 * Скрыть границы объекта на карте и очистить текущий объект
 **/
App.hideObj = function(){
    if (App.ObjPoly != null){
        Map.map.removeLayer(App.ObjPoly);
        App.Obj = null;
        App.ObjPoly = null;
    }
    App.iface.inputObjName.value = "";
    App.iface.inputObjSubtype.value = "";
    App.iface.inputObjCountry.value = "";
};


/**
 * Скрыть только полигон текущего объекта с карты
 **/
App.hideObjPolygon = function(){
    if (App.ObjPoly != null){
        Map.map.removeLayer(App.ObjPoly);
        App.ObjPoly = null;
    }
};


/**
 * Показать полигон текущего объекта на карте
 **/
App.showObjPolygon = function(){
    if (App.ObjPoly == null && App.Obj != null){
        App.map.setCenter([App.Obj.avg_lat, App.Obj.avg_lng]);
        App.ObjPoly = L.geoJson(App.Obj.geometry).addTo(Map.map);
    }
};


/**
 * Запрос списка объектов
 **/
App.getList = function(){
    Request.getListObj(App.fillList);
};

/**
 * Заполнение списка объектов
 * */
App.fillList = function(result){
    
    App.Obj_list = result.obj_list;
    App.iface.destroyChildren(App.iface.selectObjList);
    
    for (var i = 0; i < result.Obj_list.length; i++){
        var opt = document.createElement('option');
        opt.value = result.obj_list[i].id;
        opt.innerText = result.obj_list[i].name;
        opt.textContent = result.obj_list[i].name;
        if (App.Obj != null && result.obj_list[i].id == App.Obj.id){
            opt.selected = 'selected';
        }
        App.iface.selectObjList.appendChild(opt);
    }
        
};

/**
* удаление дочерних узлов у DOM элемента
* @param node DOM элемент
**/
App.iface.destroyChildren = function(node){
  if (!node) return;
  node.innerHTML = '';
  while (node.firstChild)
      node.removeChild(node.firstChild);
}

/**
 * отображение временного полигона на карте
 * @param markers массив объектов маркеров границы
 * */
App.showTempPolygon = function(markers){
    App.hideTempPolygon();
    if (markers.length < 3) return false;
    App.tempPolygonGeoJSON = {};
    App.tempPolygonGeoJSON.type = "Polygon";
    var coords = [];
    for (var i = 0; i < markers.length; i++){
        coords.push([markers[i].getLatLng().lng, markers[i].getLatLng().lat]);
        
    }
    App.tempPolygonGeoJSON.coordinates = [coords];
    console.log(JSON.stringify(App.tempPolygonGeoJSON));
    App.tempPolygon = L.geoJson(App.tempPolygonGeoJSON,{style:App.tempPolygonStyle}).addTo(Map.map);
    return true;
};

/**
 * создание маркеров на основе GeoJSON текущего объекта
 * */
App.createMarkersFromObj = function(){
    if (App.Obj != null){
        if (App.Obj.geometry.type == 'Polygon'){
            var coords = App.Obj.geometry.coordinates[0];
        }else if (App.Obj.geometry.type == 'MultiPolygon'){
            var coords = App.Obj.geometry.coordinates[0][0];
        }else{
            return;
        }
        for (var i = 0; i < coords.length; i++){
            var point = {lat: coords[i][1], lng: coords[i][0]};
            App.addBoundaryMarker(point);
        }
    }
};

/**
 * добавление маркера границы на карту
 * @param point объект точки вида {lat.lat, lng:lng}
 * */
App.addBoundaryMarker = function(point){
    var boundaryMarker = L.marker(L.latLng(point.lat, point.lng), {draggable:true, icon: App.iface.boundaryIcon}).addTo(App.map.map);
    App.boundaryMarkers.push(boundaryMarker);
    App.boundaryMarkers[App.boundaryMarkers.length - 1].on('dragend', function(e){
        App.showTempPolygon(App.boundaryMarkers);
    });
};

/**
 * удаление временного полигона с карты
 * */
App.hideTempPolygon = function(){
    if (App.tempPolygon != null){
        App.map.removeLayer(App.tempPolygon);
        App.tempPolygon = null;
        App.tempPolygonGeoJSON = null;
    }
};


/**
 * Отправка запроса на сервер для сохранения изменений в базу 
 * */
App.saveChange = function(){
    var name = App.iface.inputObjName.value;
    var lastname = App.iface.inputObjSubtype.value;
    var country = App.iface.inputObjCountry.value;
    var geometry = null;
    
    if (name == '' || lastname == '' || country == ''){
        alert('Заполните текстовые поля!');
        return;
    }
    var id = -1;
    if (App.tempPolygon != null && App.Obj != null){
        geometry = App.tempPolygonGeoJSON;
        id = App.Obj.id;
        if (!confirm('Внести изменения в данные объекта?')) return;
        Request.editObj(id, name, sub_type, country, geometry, function(result){
            App.getObj();
        });
    }else if (App.Obj != null){
        geometry = App.Obj.Obj_geometry;
        id = App.Obj.id;
        if (!confirm('Внести изменения в данные объекта?')) return;
        Request.editObj(id, name, sub_type, country, geometry, function(result){
            App.getObj();
        });
    }else if(App.tempPolygon != null){
        geometry = App.tempPolygonGeoJSON;
        App.iface.showElem(App.iface.preloader);
        if (!confirm('Добавить объект?')) return;
        Request.addObj(name, sub_type, country, geometry, function(result){
            App.hideTempPolygon();
            App.delBoundaryMarkers();
            App.showObj2(result);
            App.getList();
            App.createMarkersFromObj();
            App.showTempPolygon(App.boundaryMarkers);
        });
    }else{
        alert('Полигон не задан!');
        return;
    }    
};


/**
 * Отправка запроса на сервер для удаления объекта
 * */
App.delObj = function(){
    if (!confirm('Удалить данные текущего объекта?')) return;
    if (App.Obj != null){
        var id = App.Obj.id;
        Request.delObj(id, function(){
            App.hideObj();
            App.Obj = null;
            App.getList();
            App.delBoundaryMarkers();
            App.hideTempPolygon();
        });
    }else{
        alert('Объект не выбран!');
    }
};