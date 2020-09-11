// import * as seqqueue from '../Lib/seq-queue';
// import { times } from '../../DjangoLib/Manager/DJTimerService';
// import { dlm } from '../../DjangoLib/Manager/DJDialogManager';
// import { tool } from '../../DjangoLib/Util/Tool';

// const MAX_RECONNECT_COUNT = 30;

// export class Socket {
//     private callbacks = {};
//     private routeMap = {};
//     private handlers = {};
//     private ws: WebSocket = null;
//     private host: string;
//     private routeQueue = seqqueue.createQueue(10 * 1000, false);
//     // private startId: NodeJS.Timer;
//     private heartTime: number;
//     private timeOut: number = 1000;
//     private reconnectionDelay: number = 8000;
//     private maxReconnectCount: number = MAX_RECONNECT_COUNT;

//     public connectedCB: Function = null;
//     public connectingCB: Function = null;
//     public connectErrorCB: Function = null;
//     public eventCloseCB: Function = null;
//     public disconnectCB: Function = null;
//     public reconnectdCB: Function = null;
//     public reconnectdBeginCB: Function = null;
//     public reconnectFail: Function = null;
//     public errorCB: Function = null;

//     reConnecting: boolean = false;
//     public pauseEvent: boolean = false;

//     constructor(url?: string, port?: string | number, opCB?: Function, errCB?: Function) {
//         let token = oft.cns.token;
//         if (token) {
//             token = token.split(' ')[1];
//         }
//         const host = `${url}${port ? ':' + port : ''}`;
//         this.host = host;
//     }

//     public createSocket(host?: string, opCB?: Function, errCB?: Function) {
//         const url = host ? host : this.host;
//         this.ws = new WebSocket(`${url}?x-version=${oft.cfm.serverVersion}`);
//         console.log(this.ws);
//         this.clearRouteQueue();
//         this.ws.binaryType = 'arraybuffer';
//         this.ws.onopen = this.connected.bind(this);
//         this.ws.onmessage = this.message.bind(this);
//         this.ws.onclose = this.disconnect.bind(this);
//         this.ws.onerror = this.socketError.bind(this);
//     }

//     response(res: GateWayMessage) {
//         console.log('response:', res);
//         res.route = this.routeMap[res.timestamp];
//         delete this.routeMap[res.timestamp];
//         if (!res.route) return;
//         const cb = this.callbacks[res.timestamp];
//         delete this.callbacks[res.timestamp];
//         if (typeof cb !== 'function') return;
//         cb(res);
//     }

//     startPingPong() {
//         times.runSocketHeartBeat(this.timeOut, () => {
//             const pongTime = Date.now();
//             if (pongTime - this.heartTime >= this.reconnectionDelay) {
//                 // 超时
//                 console.info('心跳超时~');
//                 if (this.isOpen()) {
//                     this.ws.close();
//                 }
//                 this.startReconnect();
//                 times.clearSocketHeartBeat();
//             } else {
//                 this.sendPing();
//                 // this.ws.send();
//             }
//         });
//     }

//     /**
//      * 开始重连
//      */
//     startReconnect() {
//         times.runSocketReConnect(
//             2000,
//             MAX_RECONNECT_COUNT,
//             () => {
//                 console.info('重连中。。。。');
//                 if (this.ws.readyState === WebSocket.OPEN) {
//                     dlm.hideWaitingDialog();
//                     return;
//                 }
//                 oft.log.info('创建新的 socket');
//                 this.reconnectBegin();
//                 this.createSocket();
//             },
//             async () => {
//                 console.log('重连次数超过最大次数');
//                 if (this.reconnectFail) {
//                     await tool.sleep(1000);
//                     this.reconnectFail();
//                 }
//             },
//         );
//     }

//     /**
//      * 发送 ping
//      */
//     sendPing() {
//         const message = new gateway.basic.Message();
//         message.ping = new gateway.basic.Ping();
//         const uint8Msg = gateway.basic.Message.encode(message).finish();
//         const array = uint8Msg.buffer.slice(uint8Msg.byteOffset, uint8Msg.byteOffset + uint8Msg.byteLength);
//         if (this.isOpen()) {
//             this.ws.send(array);
//         } else {
//             console.error('web socket is not open');
//         }
//     }

//     /**
//      * 心跳
//      */
//     onPongRsp() {
//         this.heartTime = Date.now();
//     }

//     public getPlayingDivision(cb: Function) {
//         if (cb) cb();
//     }

//     /**
//      * 清除所有socket监听
//      */
//     public removeAllListeners() {
//         // this.ws.removeAllListeners();
//     }

//     /** 开始重连 */
//     private reconnectBegin(): void {
//         console.log('reconnectBegin');
//         this.reConnecting = true;
//         if (this.reconnectdBeginCB) this.reconnectdBeginCB();
//     }

//     /**
//      * socket报错
//      */
//     private socketError(err): void {
//         this.connectErrorCB ? this.connectErrorCB() : null;
//         this.clientDisconnect();
//         console.error('socketError', cc.sys.isNative ? JSON.stringify(err) : err);
//     }

//     /**
//      * 打开socket连接
//      */
//     private connected(): void {
//         console.log('连接成功');
//         this.maxReconnectCount = MAX_RECONNECT_COUNT;
//         this.sendAuth(oft.cns.token);
//         this.reConnecting = false;
//         console.log('connected');
//     }

//     private message(mevent: MessageEvent): void {
//         const data = mevent.data;
//         const ui8Arr = new Uint8Array(data);
//         const decodeMsg = gateway.basic.Message.decode(ui8Arr);
//         this.heartTime = Date.now();
//         if (this.pauseEvent || decodeMsg.pong) return;
//         const flag = this.routeQueue.push(task => {
//             const data = mevent.data;
//             const ui8Arr = new Uint8Array(data);
//             const decodeMsg = gateway.basic.Message.decode(ui8Arr);
//             if (CC_DEBUG) {
//                 cc.log('解码：', decodeMsg);
//             }
//             if (decodeMsg.rsp) {
//                 if (decodeMsg.rsp.authRsp) {
//                     this.authDone();
//                 } else if (decodeMsg.rsp.joinRoomStreamRsp) {
//                     cc.log('请求加入房间流返回:', decodeMsg.rsp.joinRoomStreamRsp);
//                     if (this.joinRoomCallback) {
//                         this.joinRoomCallback();
//                     }
//                 } else if (decodeMsg.rsp.joinMateStreamRsp) {
//                     cc.log('请求加入匹配流返回:', decodeMsg.rsp.joinRoomStreamRsp);
//                     if (this.joinMateCallback) {
//                         this.joinMateCallback();
//                     }
//                 } else if (decodeMsg.rsp.joinMatchStreamRsp) {
//                     cc.log('请求加入匹配流返回:', decodeMsg.rsp.joinRoomStreamRsp);
//                     if (this.joinMateCallback) {
//                         this.joinMateCallback();
//                     }
//                 }
//             }
//             oft.sks.manageMessage(decodeMsg);
//             task.done();
//         });
//         cc.log('pause :== ', this.routeQueue.isPause);
//     }

//     /**
//      * 断开连接
//      */
//     private disconnect(reson: CloseEvent): void {
//         if (this.disconnectCB) this.disconnectCB(reson);
//         console.log('close socket:', reson);
//     }

//     /**
//      * 客户端主动断开连接
//      */
//     public clientDisconnect() {
//         console.info('调用主动断开');
//         if (this.isOpen()) {
//             oft.log.info('客户端主动断开');
//             this.ws.close();
//         }
//     }

//     /**
//      * 手动重连接
//      */
//     public manualConnection() {
//         console.log('手动重连触发');
//         // this.ws.connect();
//     }

//     /**
//      * 监听路由
//      * @param route
//      * @param cb
//      */
//     public on(route: string, cb: Function) {
//         this.handlers[route] = cb;
//     }

//     /**
//      * 删除全部监听
//      */
//     public clearAll(): void {
//         this.handlers = {};
//     }

//     /**
//      * 删除指定监听
//      * @param handlers
//      */
//     public clearHandlers(handlers: string[]): void {
//         handlers.forEach(v => {
//             delete this.handlers[v];
//         });
//         this.clearRouteQueue();
//     }

//     /**
//      * 发送请求
//      * @param msg
//      */
//     public sendReq(msg: gateway.basic.Req) {
//         const reqBody = new gateway.basic.Message();
//         reqBody.req = msg;
//         cc.log('socket请求REQ：', reqBody);
//         const uint8Msg = gateway.basic.Message.encode(reqBody).finish();
//         const array = uint8Msg.buffer.slice(uint8Msg.byteOffset, uint8Msg.byteOffset + uint8Msg.byteLength);
//         if (this.isOpen()) {
//             this.ws.send(array);
//         } else {
//             throw new Error('web socket is not open');
//         }
//     }

//     /**
//      * 发送流数据
//      * @param msg
//      */
//     public sendStream(msg) {
//         const reqBody = new gateway.basic.Message();
//         reqBody.stream = msg;
//         const uint8Msg = gateway.basic.Message.encode(reqBody).finish();
//         const array = uint8Msg.buffer.slice(uint8Msg.byteOffset, uint8Msg.byteOffset + uint8Msg.byteLength);
//         cc.log('socket请求STREAM：', reqBody);
//         if (this.isOpen()) {
//             this.ws.send(array);
//         } else {
//             throw new Error('web socket is not open');
//         }
//     }

//     /**
//      * 发送json字符串
//      * @param message
//      * @param timestamp
//      */
//     public send(message, timestamp?: number) {
//         const reqBody = new gateway.basic.Message();
//         reqBody.message = message;
//         cc.log('socket请求：', reqBody);
//         if (this.isOpen()) {
//             this.ws.send(JSON.stringify(reqBody));
//         } else {
//             throw new Error('web socket is not open');
//         }
//     }

//     public emit(type: string, data: any) {
//         if (this.ws.CONNECTING) {
//             // this.ws.emit(type, data);
//         } else {
//             // this.onClose();
//             if (!this.reConnecting) {
//                 // this.reconnectFail();
//                 return console.info('连接错误 开始重连');
//             }
//             console.error('web socket is not open');
//         }
//     }

//     /**
//      * socket 连接验证
//      * @param type
//      * @param token
//      * @param timestamp
//      */
//     public sendAuth(token: string): void {
//         const msg = new gateway.basic.Req();
//         const authReq = new gateway.basic.AuthReq();
//         authReq.token = token;
//         msg.authReq = authReq;
//         if (this.isOpen()) {
//             this.sendReq(msg);
//         }
//     }

//     private authDone() {
//         this.connectedCB ? this.connectedCB() : null;
//         this.heartTime = Date.now();
//         oft.timers.clearSocketReConnect();
//         this.startPingPong();
//         console.log('authdone');
//     }

//     ////////////////// 进入stream之前调用 ///////////
//     joinRoomCallback: Function = null;
//     /**
//      * 加入房间流
//      * @param roomType
//      * @param roomNo
//      */
//     public joinRoomStreamReq(roomType: room.basic.RoomType, roomNo: string, cb?: Function) {
//         const msg = new gateway.basic.Req();
//         const joinStreamReq = new gateway.basic.JoinRoomStreamReq();
//         joinStreamReq.roomNo = roomNo;
//         joinStreamReq.roomType = roomType;
//         msg.joinRoomStreamReq = joinStreamReq;
//         if (cb) {
//             this.joinRoomCallback = cb;
//         } else {
//             this.joinRoomCallback = null;
//         }
//         console.log('请求加入房间流:', msg);
//         this.sendReq(msg);
//     }

//     joinMateCallback: Function = null;
//     /**
//      * 加入房间流
//      * @param roomType
//      * @param roomNo
//      */
//     public joinMateStreamReq(mateType: mate.basic.MateType, cb?: Function) {
//         const msg = new gateway.basic.Req();
//         const joinStreamReq = new gateway.basic.JoinMateStreamReq();
//         joinStreamReq.mateType = mateType;
//         joinStreamReq.version = oft.cfm.serverVersion;
//         msg.joinMateStreamReq = joinStreamReq;
//         if (cb) {
//             this.joinMateCallback = cb;
//         } else {
//             this.joinMateCallback = null;
//         }
//         console.log('请求加入匹配流:', msg);
//         this.sendReq(msg);
//     }

//     public joinMatchStreamReq(id: number, cb?: Function) {
//         const msg = new gateway.basic.Req();
//         const joinStreamReq = new gateway.basic.JoinMatchStreamReq();
//         joinStreamReq.id = id;
//         msg.joinMatchStreamReq = joinStreamReq;
//         if (cb) {
//             this.joinMateCallback = cb;
//         } else {
//             this.joinMateCallback = null;
//         }
//         console.log('请求加入匹配流:', msg);
//         this.sendReq(msg);
//     }
//     ///////////////////////////////////////

//     /**
//      * 发送room config
//      * @param type
//      */
//     public sendConfig(
//         roomDivisionVersion: string,
//         matchingDivisionVersion: string,
//         roomGoldVersion: string,
//         matchingGoldVersion: string,
//         roomFriendVersion: string,
//     ): void {
//         this.emit('config', {
//             roomDivisionVersion,
//             matchingDivisionVersion,
//             roomGoldVersion,
//             matchingGoldVersion,
//             roomFriendVersion,
//         });
//     }

//     /**
//      * 请求
//      * @param route 路由
//      * @param msg 参数
//      * @param cb 回调
//      */
//     public request(route: string, msg: any, cb) {
//         console.log('走到request:', route);
//         // if (arguments.length === 2 && typeof msg === 'function') {
//         //     cb = msg;
//         //     msg = {};
//         // } else {
//         //     msg = msg || {};
//         // }
//         // console.log('请求1:', route);
//         // route = route || msg.route;
//         // if (!route) {
//         //     console.log('请求2:', route);
//         //     return;
//         // }
//         // const reqId = Date.now();
//         // this.send(WSType.REQUEST, route, msg, reqId);
//         // this.callbacks[`${reqId}`] = cb;
//         // this.routeMap[`${reqId}`] = route;
//         // console.log({ request: route, data: msg });
//     }

//     /**
//      * 是否关闭
//      */
//     public isClose() {
//         return this.ws.readyState === WebSocket.CLOSED;
//     }

//     /**
//      * 是否打开
//      */
//     public isOpen() {
//         return this.ws.readyState === WebSocket.OPEN;
//     }
//     /**
//      * 清除所有route队列
//      */
//     public clearRouteQueue() {
//         console.log('clearRouteQueue');
//         this.routeQueue.clearAll();
//         return this.resume();
//     }

//     public pause() {
//         this.routeQueue.pause();
//         console.log('pause -----------------  handler', this.routeQueue.isPause);
//     }

//     public resume() {
//         this.routeQueue.resume();
//         console.log('resume -----------------  handler', this.routeQueue.isPause);
//     }
// }
// export interface GateWayMessage {
//     /**
//      * handler 路由
//      */
//     route: string;

//     /**
//      * 服务端push事件
//      */
//     event?: string;

//     /**
//      * 业务数据
//      */
//     data: any;

//     /**
//      * 令牌
//      */
//     token?: string;

//     /**
//      * 好友房服务器的版本 默认latest
//      */
//     roomFriendVersion?: string;

//     /**
//      * 排位赛房间服务器版本 默认latest
//      */
//     roomDivisionVersion?: string;

//     /**
//      * 排位赛匹配服务器版本 默认latest
//      */
//     matchingDivisionVersion?: string;

//     /**
//      * 当type = WSType.REQUEST必须带
//      * 毫秒级时间戳
//      * 和 route 一起 标识一次来回的传输
//      */
//     timestamp?: number;

//     /**
//      * 错误号 发生错误时会存在这个值
//      */
//     errorCode?: number;

//     /**
//      * 错误信息 发生错误时会存在这个值
//      */
//     message?: string;
// }
