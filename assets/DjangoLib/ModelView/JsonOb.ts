/**
 * 实现动态绑定的核心部分，
 * 每次修改属性值，都会调用对应函数，并且获取值的路径
 */

const OP = Object.prototype;
const types = {
    obj: '[object Object]',
    array: '[object Array]',
};
const OAM = ['push', 'pop', 'shift', 'unshift', 'short', 'reverse', 'splice', 'concat'];

/**
 * 实现属性拦截的类
 */
export class JsonOb<T> {
    constructor(obj: T, callback: (newVal: any, oldVal: any, pathArray: string[]) => void) {
        if (!isReferenceTypes(obj)) {
            console.error('请传入一个对象或数组');
        }

        this._callback = callback;
        this.observe(obj);
    }

    private _callback;
    /**对象属性劫持 */
    private observe<T>(obj: T, path?) {
        if (isArray(obj)) {
            this.overrideArrayProto(obj, path);
        }

        Object.keys(obj).forEach(key => {
            let self = this;
            let oldVal = obj[key];
            let pathArray = path && path.slice();
            if (pathArray) {
                pathArray.push(key);
            } else {
                pathArray = [key];
            }
            Object.defineProperty(obj, key, {
                get: function() {
                    return oldVal;
                },
                set: function(newVal) {
                    //cc.log(newVal);
                    if (oldVal !== newVal) {
                        if (isObject(newVal)) {
                            self.observe(newVal, pathArray);
                        }
                        self._callback(newVal, oldVal, pathArray);
                        oldVal = newVal;
                    }
                },
            });

            if (isReferenceTypes(obj[key])) {
                this.observe(obj[key], pathArray);
            }
        }, this);
    }

    /**
     * 对数组类型进行动态绑定
     * @param array
     * @param path
     */
    private overrideArrayProto(array: any, path) {
        // 保存原始 Array 原型
        var originalProto = Array.prototype;
        // 通过 Object.create 方法创建一个对象，该对象的原型是Array.prototype
        var overrideProto = Object.create(Array.prototype);
        var self = this;
        var result;
        /**
         * 遍历要重写的数组方法:['push','pop','shift','unshift','short','reverse','splice','concat']
         */
        OAM.forEach(method => {
            Object.defineProperty(overrideProto, method, {
                value: function() {
                    var oldVal = this.slice();
                    //调用原始原型上的方法
                    result = originalProto[method].apply(this, arguments);
                    //继续监听新数组
                    self.observe(this, path);
                    // 调用改变数组后的回调
                    self._callback(this, oldVal, path);
                    // console.log('old path:', path);
                    return result;
                },
            });
        });
        // 最后 让该数组实例的 __proto__ 属性指向 假的原型 overrideProto
        array['__proto__'] = overrideProto;
    }
}

export const isReferenceTypes = (obj: any) => {
    return OP.toString.call(obj) === types.obj || OP.toString.call(obj) === types.array;
};

export const isArray = (obj: any) => {
    return OP.toString.call(obj) === types.array;
};
export const isObject = (obj: any) => {
    return OP.toString.call(obj) === types.obj;
};

export const changeArrayValue = (n, o) => {
    const list = [];
    if (!!o) {
        const length = n.length - o.length > 0 ? n.length : o.length;
        for (let i = 0; i < length; i++) {
            const nv = n[i];
            const ov = o[i];
            if (nv !== ov) {
                list.push({ nv, ov, i });
            }
        }
    }
    return list;
};

/**
 *
 * @param source 更新源
 * @param target 被更新数组
 */
export const updateArr = (source, target) => {
    if (source) {
        source.forEach((s, i) => {
            if (i < target.length) {
                target[i] = s;
            } else {
                target.push(s);
            }
        });
    }
};

/**
 * 向数组添加元素 [优先替换,null,undefined]
 * @param target
 * @param element
 */
export const addElement = (target: any[], element: any): number => {
    if (target) {
        let index = target.findIndex(t => t === null || t === undefined);
        if (index >= 0) {
            target[index] = element;
        } else {
            index = target.push(element) - 1;
        }
        return index;
    }
};

export const changeWatchPathByIndex = (path: string, index: number) => {
    //提前拆分、并且解析路径
    let paths = path.split('.');
    for (let i = 1; i < paths.length; i++) {
        const p = paths[i];
        //如果发现了路径使用了 * ，则自动去自己的父节点查找自己所在 index 值
        if (p == '*') {
            if (index <= 0) index = 0;
            paths[i] = index.toString();
            break;
        }
    }

    //替换掉原路径
    path = paths.join('.');
    return path;
};

/**
 *
 * @requires @param oldV 被升级数据
 * @requires @param newV 升级数据
 */
export const updateObj = (oldV: any, newV: any) => {
    if (isReferenceTypes(newV)) {
        if (isObject(newV)) {
            Object.keys(newV).forEach((k, i) => {
                if (!isReferenceTypes(newV[k])) {
                    oldV[k] = newV[k];
                    console.log('更新了属性: ' + k);
                } else {
                    updateObj(oldV[k], newV[k]);
                }
            });
        } else if (isArray(newV)) {
            /**
             * @required 老数组 >= 新数组, 没有的用 null 占位
             *  new = [1,2] old = [3,4,5] => old = [1,2,null]
             */
            if (oldV.length) {
                oldV.forEach((v, i) => {
                    if (newV.length < i + 1) {
                        oldV[i] = null;
                    } else {
                        if (!isReferenceTypes(v)) {
                            oldV[i] = newV[i];
                        } else {
                            updateObj(v, newV[i]);
                        }
                    }
                });
            }
        }
    }
};
