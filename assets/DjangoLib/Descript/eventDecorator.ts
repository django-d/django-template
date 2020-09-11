import * as events from 'events';

export interface IConstructorFunction {
    constructor;
    addListeners();
    removeListener(eventName: string, functionName: string);
    onDestroy(...args: any[]);
    onLoad()
}

const eventMapping = 'mapping';
export const myEvent = new events.EventEmitter();
/**
 * @param mapping {functionName:eventname}
 */
export function eventHandler() {
    return <T extends { new (...args: any[]): IConstructorFunction }>(constructorFunction: T): T => {
        return class extends constructorFunction implements IConstructorFunction {
            myeventList;
            mapping;
            constructor(...args: any[]) {
                super(...args);
                if (!(this instanceof cc.Component)) {
                    this.addListeners();
                }
            }

            onLoad() {
                this.addListeners();
                if(super.onLoad) {
                    super.onLoad()
                }
            }

            addListeners() {
                const myeventList = [];
                for (const eventName in this.mapping) {
                    const functionName = this.mapping[eventName];
                    const targetFunction: Function = constructorFunction.prototype[functionName];
                    if (targetFunction) {
                        const callback = (...params) => {
                            if (this instanceof cc.Component) {
                                if (!this['node'] || !cc.isValid(this['node'])) return;
                            }
                            if (targetFunction) targetFunction.call(this, ...params);
                        };
                        const bindFunction = callback.bind(this);
                        myEvent.on(eventName, bindFunction);
                        const eventObj = {};
                        eventObj['eventName'] = eventName;
                        eventObj['method'] = bindFunction;
                        eventObj['functionName'] = functionName;
                        myeventList.push(eventObj);
                    }
                }
                Object.defineProperty(this, 'myeventList', {
                    value: myeventList,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
            }

            // 添加removeListener方法
            removeListener(eventName: string, functionName: string) {
                const oldFunction = constructorFunction.prototype['onDestroy'];
                if (oldFunction) {
                    oldFunction();
                }
                for (const i in this.myeventList) {
                    const eventObj = this.myeventList[i];
                    const itemEventName = eventObj['eventName'];
                    const itemMethodName = eventObj['functionName'];
                    if (itemEventName === eventName && functionName === itemMethodName) {
                        const method = eventObj['method'];
                        myEvent.removeListener(itemEventName, method);
                        this.myeventList.splice(Number(i), 1);
                        break;
                    }
                }
            }

            // 拓展destroy方法
            onDestroy(...args: any[]) {
                // oft.log.info(this);
                if (super.onDestroy) {
                    super.onDestroy();
                }
                // const oldFunction = constructorFunction.prototype['onDestroy'];
                // if (oldFunction) {
                //     oldFunction(args);
                // }
                for (const i in this.myeventList) {
                    const eventObj = this.myeventList[i];
                    const itemEventName = eventObj['eventName'];
                    const itemMethodName = eventObj['functionName'];
                    const method = eventObj['method'];
                    myEvent.removeListener(itemEventName, method);
                }
            }
        };
    };
}

export function eventListenerFunction(eventName: string) {
    return (target, functionName, describe) => {
        if (typeof target === 'function') {
        } else {
            let mapping;
            const p2 = target.mapping;
            mapping = target.mapping ? target.mapping : {};
            mapping[eventName] = functionName;
            Object.defineProperty(target, eventMapping, {
                value: mapping,
                writable: !!p2,
                enumerable: true,
                configurable: true,
            });
        }
    };
}

export function emitEvents(...eventNames: any[]) {
    for (const i in eventNames) {
        const eventName = eventNames[i];
        myEvent.emit(eventName);
    }
}

export function emitEvent(eventName, ...params: any[]) {
    // for (const i in eventNames) {
    // const eventName = eventNames[i];
    myEvent.emit(eventName, ...params);
    // }
}
export const iVMEvent = (window['iVMEvent'] = new events.EventEmitter());
// iVMEvent.setMaxListeners(20000);
