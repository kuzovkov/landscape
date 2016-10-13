/** модуль запросов к серверу **/

var Request = {
    server: 'http://landscape.py:8080',
    
     /**
    * определение принадлежности точки городу
    * @param start заданная точка {lat:lat, lng:lng}
    * @param callback функция обратного вызова в которую передается результат
    **/
    
    searchObj: function(start, callback){
        var params = 'data=' + [start.lat,start.lng].join(',');
        console.log(params);
        var url = Request.server+'/search';
        console.log(url)
        Ajax.sendRequest('GET', url, params, function(result) {
            callback(result);
        });
    },
    
    /**
    * получение списка городов
    * @param callback функция обратного вызова в которую передается результат
    **/
    getListObj: function(callback){
        var url = Request.server+'/list';
         Ajax.sendRequest('GET', url, null, function(result) {
            callback(result);
        });
    },
    
    /**
    * получение города по его id
    * @param id id города
    * @param callback функция обратного вызова в которую передается результат
    **/
    getObj: function(id, callback){
        var params = 'data=' + id;
        var url = Request.server+'/get';
        Ajax.sendRequest('GET', url, params, function(result) {
            callback(result);
        });
    },
    
    /**
     * редактирование записи о городе
     * */
    editObj: function(id, name, sub_type, country, geometry, scale, eng_name, callback){
        var params = 'data=' + [id, name, sub_type, country, JSON.stringify(geometry), scale, eng_name].join('|');
        console.log(params);
        var url = Request.server+'/edit';
        Ajax.sendRequest('POST', url, params, function(result) {
            callback(result);
        });
    },
    
     /**
     * создание записи о городе
     * */
    addObj: function(name, sub_type, country, geometry, scale, eng_name, callback){
        var params = 'data=' + [name, sub_type, country, JSON.stringify(geometry), scale, eng_name].join('|');
        var url = Request.server+'/add';
        Ajax.sendRequest('POST', url, params, function(result) {
            callback(result);
        });
    },
    
     /**
     * удаление записи о городе
     * */
    delObj: function(id, callback){
        var params = 'data=' + id;
        var url = Request.server+'/del';
        Ajax.sendRequest('GET', url, params, function(result) {
            callback(result);
        });
    }
    
       
};

