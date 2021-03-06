'use strict';
/**
 * Created by liangdas on 17/2/25.
 * Email 1587790525@qq.com
 */

var hashmap = function () {
}
hashmap.prototype = {
    constructor: hashmap,
    add: function (k, v) {
        if (!this.hasOwnProperty(k)) {
            this[k] = v;
        }
    },
    remove: function (k) {
        if (this.hasOwnProperty(k)) {
            delete this[k];
        }
    },
    update: function (k, v) {
        this[k] = v;
    },
    has: function (k) {
        var type = typeof k;
        if (type === 'string' || type === 'number') {
            return this.hasOwnProperty(k);
        } else if (type === 'function' && this.some(k)) {
            return true;
        }
        return false;
    },
    clear: function () {
        for (var k in this) {
            if (this.hasOwnProperty(k)) {
                delete this[k];
            }
        }
    },
    empty: function () {
        for (var k in this) {
            if (this.hasOwnProperty(k)) {
                return false;
            }
        }
        return true;
    },
    each: function (fn) {
        for (var k in this) {
            if (this.hasOwnProperty(k)) {
                fn.call(this, this[k], k, this);
            }
        }
    },
    map: function (fn) {
        var hash = new Hash;
        for (var k in this) {
            if (this.hasOwnProperty(k)) {
                hash.add(k, fn.call(this, this[k], k, this));
            }
        }
        return hash;
    },
    filter: function (fn) {
        var hash = new Hash;
        for (var k in this) {

        }
    },
    join: function (split) {
        split = split !== undefined ? split : ',';
        var rst = [];
        this.each(function (v) {
            rst.push(v);
        });
        return rst.join(split);
    },
    every: function (fn) {
        for (var k in this) {
            if (this.hasOwnProperty(k)) {
                if (!fn.call(this, this[k], k, this)) {
                    return false;
                }
            }
        }
        return true;
    },
    some: function (fn) {
        for (var k in this) {
            if (this.hasOwnProperty(k)) {
                if (fn.call(this, this[k], k, this)) {
                    return true;
                }
            }
        }
        return false;
    },
    find: function (k) {
        var type = typeof k;
        if (type === 'string' || type === 'number' && this.has(k)) {
            return this[k];
        } else if (type === 'function') {
            for (var _k in this) {
                if (this.hasOwnProperty(_k) && k.call(this, this[_k], _k, this)) {
                    return this[_k];
                }
            }
        }
        return null;
    }
};

window.mqant = function () {
}
window.mqant.prototype = {
    constructor: window.mqant,
    curr_id: 0,
    client:null,
    waiting_queue:new hashmap(),
    init:function(prop){
        prop["onFailure"]=prop["onFailure"]||function () {
                console.log("onFailure");
        }
        prop["onConnectionLost"]=prop["onConnectionLost"]||function (responseObject) {
                if (responseObject.errorCode !== 0) {
                    console.log("onConnectionLost:" + responseObject.errorMessage);
                    console.log("???????????????");
                }
        }
        prop["useSSL"]=prop["useSSL"]||false
        this.client = new Paho.MQTT.Client(prop["host"], prop["port"], prop["client_id"]);
        this.client.connect({
            onSuccess: prop["onSuccess"],
            onFailure: prop["onFailure"],
            mqttVersion: 3,
            useSSL:prop["useSSL"],
            cleanSession: true,
        });//????????????????????????????????????????????????
        this.client.onConnectionLost =prop["onConnectionLost"] ;//??????????????????????????????
        this.client.onMessageArrived = onMessageArrived;//??????????????????????????????
        var self=this
        function onMessageArrived(message) {
            var callback=self.waiting_queue.find(message.destinationName)
            if(callback!=null){
                //??????????????????callback ???????????????????????????????????????
                var h=message.destinationName.split("/")
                if(h.length>2){
                    //??????topic??????msgid ?????????????????????????????????
                    self.waiting_queue.remove(message.destinationName)
                }
                callback(message)
            }
        }
    },
    /**
     * ??????????????????????????????
     * @param topic
     * @param msg
     * @param callback
     */
    request:function(topic,msg,callback){
        this.curr_id=this.curr_id+1
        var topic=topic+"/"+this.curr_id //???topic?????????msgid ????????????????????????????????????????????????,?????????????????????????????????
        var payload=JSON.stringify(msg)
        this.on(topic,callback)
        this.client.send(topic,payload ,1);
    },
    /**
     * ??????????????????????????????,?????????????????????????????????
     * @param topic
     * @param msg
     */
    requestNR:function(topic,msg){
        var payload=JSON.stringify(msg)
        this.client.send(topic,payload ,1);
    },
    /**
     * ?????????????????????topic??????
     * @param topic
     * @param callback
     */
    on:function(topic,callback){
        //???????????????????????????
        this.waiting_queue.add(topic,callback) //?????????????????????????????????
    }
}





